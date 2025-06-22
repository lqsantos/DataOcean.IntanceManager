# Prompt: Análise Code Cleanup - Dead Code Detection

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Identificar e catalogar código não utilizado (dead code) antes da refatoração arquitetural  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Informações do Projeto

### Estrutura Atual do Projeto

```
src/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── applications/       # Application-related components
│   ├── blueprints/         # Blueprint management components
│   ├── clusters/           # Cluster management components
│   ├── entities/           # Generic entity components
│   ├── environments/       # Environment-related components
│   ├── form/               # Generic form components
│   ├── git-source/         # Git source management components
│   ├── layout/             # Layout components (Sidebar, Header)
│   ├── locations/          # Location-related components
│   ├── pat/                # Personal Access Token components
│   ├── resources/          # Resource management components
│   └── ui/                 # Generic UI components
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries and configurations
├── locales/                # i18n translation files
├── mocks/                  # MSW mocks for testing/development
├── services/               # API services
├── tests/                  # Test utilities and setup
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

### Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Mocking**: MSW (Mock Service Worker)
- **State**: React hooks + Context
- **i18n**: Custom i18n implementation

### Domínios Principais

1. **Applications** - Gerenciamento de aplicações
2. **Blueprints** - Gerenciamento de templates/blueprints
3. **Clusters** - Gerenciamento de clusters de infraestrutura
4. **Environments** - Gerenciamento de ambientes (prod, staging, dev)
5. **Git Sources** - Gerenciamento de fontes Git
6. **Locations** - Gerenciamento de localizações/datacenters
7. **PAT (Personal Access Tokens)** - Gerenciamento de tokens de acesso
8. **Templates** - Gerenciamento de templates de configuração

## Objetivo da Análise

Identificar e catalogar **código não utilizado** (dead code) em todas as categorias:

- **Components** não importados ou referenciados
- **Hooks** não utilizados
- **Services** órfãos
- **Types/Interfaces** não referenciadas
- **Utils** não utilizadas
- **Constants** não utilizadas
- **Contexts** não utilizados
- **Mocks** desnecessários

## Tarefas de Análise

### 1. Análise de Components Não Utilizados

```bash
# Listar todos os components
find src/components -name "*.tsx" -o -name "*.ts" | grep -v index.ts | sort

# Para cada component, verificar se é importado/referenciado
for component in $(find src/components -name "*.tsx" -o -name "*.ts" | grep -v index.ts); do
  filename=$(basename "$component" .tsx)
  filename=$(basename "$filename" .ts)
  echo "Checking $filename:"

  # Buscar imports do component
  grep -r "import.*$filename" src/ --include="*.ts" --include="*.tsx" | wc -l

  # Buscar referências diretas
  grep -r "$filename" src/app/ --include="*.ts" --include="*.tsx" | wc -l
done

# Verificar components sem exports
grep -L "export" src/components/**/*.tsx | head -10

# Verificar components órfãos (sem imports externos)
find src/components -name "*.tsx" -exec bash -c '
  file="$1"
  filename=$(basename "$file" .tsx)
  if [ $(grep -r "import.*$filename" src/ --include="*.ts" --include="*.tsx" | grep -v "$file" | wc -l) -eq 0 ]; then
    echo "Orphan component: $file"
  fi
' _ {} \;
```

### 2. Análise de Hooks Não Utilizados

```bash
# Listar todos os hooks
find src/hooks -name "*.ts" -o -name "*.tsx" | sort

# Verificar hooks não importados
for hook in $(find src/hooks -name "*.ts" | grep -v index.ts); do
  hookname=$(basename "$hook" .ts)
  echo "Hook: $hookname"
  grep -r "import.*$hookname\|from.*$hookname" src/ --include="*.ts" --include="*.tsx" | grep -v "$hook" | wc -l
done

# Buscar hooks com padrão use*
grep -r "export.*use[A-Z]" src/hooks/ --include="*.ts" | while read -r line; do
  hookname=$(echo "$line" | sed -n 's/.*export.*\(use[A-Za-z]*\).*/\1/p')
  if [ ! -z "$hookname" ]; then
    echo "Checking hook: $hookname"
    grep -r "$hookname" src/ --include="*.ts" --include="*.tsx" | grep -v src/hooks/ | wc -l
  fi
done
```

### 3. Análise de Services Órfãos

```bash
# Listar todos os services
ls -la src/services/

# Verificar services não importados
for service in src/services/*.ts; do
  servicename=$(basename "$service" .ts)
  echo "Service: $servicename"

  # Buscar imports do service
  grep -r "import.*$servicename\|from.*$servicename" src/ --include="*.ts" --include="*.tsx" | grep -v "$service" | wc -l

  # Buscar chamadas de funções do service
  grep -r "from.*services.*$servicename" src/ --include="*.ts" --include="*.tsx" | wc -l
done

# Verificar se há services duplicados ou similares
ls src/services/ | grep -E "(\.test\.|\.spec\.)" | wc -l
```

### 4. Análise de Types/Interfaces Não Utilizadas

```bash
# Listar todos os types
find src/types -name "*.ts" | sort

# Verificar types não importados
for typefile in src/types/*.ts; do
  echo "Type file: $typefile"

  # Extrair nomes de types/interfaces do arquivo
  grep -E "^export (interface|type|enum)" "$typefile" | sed 's/export //' | sed 's/ {.*//' | while read -r typename; do
    if [ ! -z "$typename" ]; then
      typename=$(echo "$typename" | awk '{print $2}')
      echo "  Checking type: $typename"
      grep -r "$typename" src/ --include="*.ts" --include="*.tsx" | grep -v "$typefile" | wc -l
    fi
  done
done

# Verificar imports de types
grep -r "import type\|import.*{.*}" src/ --include="*.ts" --include="*.tsx" | grep "from.*types" | head -10
```

### 5. Análise de Utils Não Utilizadas

```bash
# Listar utils
find src/utils -name "*.ts" | sort

# Verificar cada util
for util in src/utils/*.ts; do
  utilname=$(basename "$util" .ts)
  echo "Util: $utilname"

  # Buscar imports
  grep -r "import.*$utilname\|from.*$utilname" src/ --include="*.ts" --include="*.tsx" | grep -v "$util" | wc -l

  # Buscar funções exportadas
  grep "export" "$util" | head -3
done
```

### 6. Análise de Contexts Não Utilizados

```bash
# Listar contexts
find src/contexts -name "*.tsx" -o -name "*.ts" | sort

# Verificar contexts não utilizados
for context in src/contexts/*.tsx; do
  contextname=$(basename "$context" .tsx)
  echo "Context: $contextname"

  # Buscar Provider usage
  grep -r "Provider\|useContext" src/ --include="*.ts" --include="*.tsx" | grep -i "$contextname" | wc -l

  # Buscar imports do context
  grep -r "import.*$contextname" src/ --include="*.ts" --include="*.tsx" | grep -v "$context" | wc -l
done
```

### 7. Análise de Test Files Órfãos

```bash
# Listar arquivos de teste
find src/ -name "*.test.*" -o -name "*.spec.*" | sort

# Verificar se component/service correspondente existe
find src/ -name "*.test.*" -o -name "*.spec.*" | while read -r testfile; do
  # Extrair nome base do arquivo
  basename_without_test=$(echo "$testfile" | sed 's/\.test\./\./' | sed 's/\.spec\./\./')

  if [ ! -f "$basename_without_test" ]; then
    echo "Orphan test file: $testfile (no corresponding source file)"
  fi
done
```

### 8. Análise de Dependências Não Utilizadas

```bash
# Verificar imports não utilizados em arquivos específicos
echo "Verificando imports não utilizados em arquivos principais:"

# Verificar alguns arquivos chave
for file in src/app/layout.tsx src/app/page.tsx src/components/layout/sidebar.tsx; do
  if [ -f "$file" ]; then
    echo "File: $file"
    echo "Imports:"
    grep "^import" "$file" | head -5
  fi
done

# Buscar imports que podem estar órfãos
grep -r "import.*{.*}" src/ --include="*.ts" --include="*.tsx" | grep -E "from ['\"]@/" | head -10
```

## Documenting Results

Documente os achados em `analysis/results.md` com:

### Template de Resultados:

```markdown
# Code Cleanup Analysis Results

## Dead Components Found

### Unused Components

- Component: src/components/[domain]/[component].tsx
  - Imports: 0 found
  - References: 0 found
  - Status: CANDIDATE FOR REMOVAL

### Components Without Exports

- List components that don't export anything

## Dead Hooks Found

### Unused Hooks

- Hook: src/hooks/use-[name].ts
  - Usage: 0 found
  - Status: CANDIDATE FOR REMOVAL

## Dead Services Found

### Unused Services

- Service: src/services/[name]-service.ts
  - Imports: 0 found
  - Status: CANDIDATE FOR REMOVAL

## Dead Types Found

### Unused Types/Interfaces

- Type: [TypeName] in src/types/[file].ts
  - Usage: 0 found
  - Status: CANDIDATE FOR REMOVAL

## Dead Utils Found

### Unused Utilities

- Util: src/utils/[name].ts
  - Usage: 0 found
  - Status: CANDIDATE FOR REMOVAL

## Dead Contexts Found

### Unused Contexts

- Context: src/contexts/[name]-context.tsx
  - Provider usage: 0 found
  - Status: CANDIDATE FOR REMOVAL

## Orphan Test Files

### Tests Without Source

- Test: src/[path]/[name].test.ts
  - Source file exists: NO
  - Status: CANDIDATE FOR REMOVAL

## Summary

### Total Dead Code Found

- Components: X files
- Hooks: Y files
- Services: Z files
- Types: W types
- Utils: V files
- Contexts: U files
- Tests: T files

### Estimated Cleanup Impact

- Files to remove: X total
- Lines of code to remove: ~Y lines
- Bundle size reduction: ~Z KB

### Risk Assessment

- LOW RISK: Components/hooks/utils with 0 references
- MEDIUM RISK: Services (may have dynamic imports)
- HIGH RISK: Types (may be used in type-only imports)

## Cleanup Strategy Recommendation

### Phase 1 (Safe)

- Remove components with 0 imports/references
- Remove utils with 0 usage
- Remove orphan test files

### Phase 2 (Careful)

- Remove unused hooks (verify dynamic usage)
- Remove unused contexts (verify Provider patterns)

### Phase 3 (Verify)

- Remove unused types (check type-only imports)
- Remove unused services (check dynamic imports)
```

## Critérios de Aceitação

- [ ] Todos os components analisados para usage
- [ ] Hooks verificados para referências
- [ ] Services analisados para imports/calls
- [ ] Types verificadas para usage
- [ ] Utils analisadas para imports
- [ ] Contexts verificados para Provider usage
- [ ] Test files verificados para source files correspondentes
- [ ] Risk assessment completado
- [ ] Cleanup strategy definida
- [ ] Resultados documentados em `analysis/results.md`

## Próximos Passos

Após completar a análise, proceder para `implementation/prompt.md` para executar a remoção segura do dead code identificado.

## ⚠️ Avisos Importantes

- **Backup**: Sempre fazer commit antes de remover código
- **Testes**: Executar testes após cada remoção
- **Dinâmicos**: Verificar imports/calls dinâmicos que grep pode não capturar
- **Types**: Types podem ser usados apenas em anotações de tipo
- **Build**: Verificar se build passa após remoções
