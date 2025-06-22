# Prompt: Análise Foundation Architecture

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Estabelecer foundation sólida com configurações, constants e environment validation  
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
│   ├── use-applications.ts
│   ├── use-blueprints.ts
│   ├── use-clusters.ts
│   ├── use-environments.ts
│   ├── use-locations.ts
│   ├── use-pat.ts
│   └── use-templates.ts
├── lib/                    # Utility libraries and configurations
├── locales/                # i18n translation files
├── mocks/                  # MSW mocks for testing/development
├── services/               # API services
│   ├── application-service.ts
│   ├── blueprint-service.ts
│   ├── cluster-service.ts
│   ├── environment-service.ts
│   ├── git-service.ts
│   ├── git-source-service.ts
│   ├── location-service.ts
│   ├── pat-service.ts
│   ├── template-schema-service.ts
│   └── template-service.ts
├── tests/                  # Test utilities and setup
├── types/                  # TypeScript type definitions
│   ├── application.ts
│   ├── blueprint.ts
│   ├── cluster.ts
│   ├── environment.ts
│   ├── git-source.ts
│   ├── location.ts
│   ├── pat.ts
│   └── template.ts
└── utils/                  # Utility functions
```

### Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest (será migrado para Jest)
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

Analisar a foundation atual do projeto para identificar necessidades de:

- Constants duplicados e hardcoded
- Environment variables sem validation
- Configurações dispersas
- Oportunidades de centralização

## Tarefas de Análise

### 1. Análise de Constants Duplicados

Execute comandos para identificar duplicações:

```bash
# Buscar API_BASE_URL duplicado
grep -r "API_BASE_URL\|'/api'" src/ --include="*.ts" --include="*.tsx"

# Buscar outras constants duplicadas
grep -r "const.*=" src/services/ --include="*.ts" | grep -E "(http|api|endpoint|url|base)"

# Buscar hardcoded values
grep -r "http://\|https://\|localhost:" src/ --include="*.ts" --include="*.tsx"

# Buscar status values repetidos
grep -r "status.*=\|Status\." src/ --include="*.ts" --include="*.tsx"
```

### 2. Análise de Environment Variables

```bash
# Verificar .env files
ls -la .env*

# Buscar process.env usage
grep -r "process\.env" src/ --include="*.ts" --include="*.tsx"

# Verificar next.config.ts
cat next.config.ts | grep -A 10 -B 10 "env\|publicRuntimeConfig"

# Buscar environment configs
find src/ -name "*config*" -o -name "*env*" | head -10
```

### 3. Análise de Configurações Dispersas

```bash
# Buscar arquivos de configuração
find src/ -name "*.config.*" -o -name "*-config.*" | head -10

# Buscar imports de configuração
grep -r "import.*config" src/ --include="*.ts" --include="*.tsx" | head -10

# Verificar lib/ para configs existentes
ls -la src/lib/

# Buscar constants em múltiplos locais
find src/ -name "*constant*" -o -name "*config*" | head -10
```

### 4. Análise TypeScript Paths

```bash
# Verificar tsconfig.json paths
cat tsconfig.json | grep -A 10 -B 5 "paths"

# Verificar imports absolutos vs relativos
grep -r "from ['\"]\.\./" src/ --include="*.ts" --include="*.tsx" | wc -l
grep -r "from ['\"]@/" src/ --include="*.ts" --include="*.tsx" | wc -l

# Buscar imports problemáticos
grep -r "from ['\"]\.\.\/\.\./" src/ --include="*.ts" --include="*.tsx" | head -5
```

## Documenting Results

Documente os achados em `analysis/results.md` com:

### Template de Resultados:

```markdown
# Foundation Architecture Analysis Results

## Constants Duplicados Encontrados

### API Configuration

- API_BASE_URL: encontrado em X locais
- Endpoints: duplicados em Y services

### Business Constants

- Status values: encontrados em Z locais
- Types: duplicações identificadas

## Environment Variables

### Current Usage

- process.env.\* encontrados em X locais
- Validation: [SIM/NÃO] existe

### Missing Validation

- Listar variables sem validation

## Configuration Files

### Existing

- Listar configs existentes

### Missing

- src/config/ não existe
- Environment validation não implementada

## TypeScript Paths

### Current Setup

- @/\* paths: [configurado/não configurado]
- Relative imports: X encontrados
- Absolute imports: Y encontrados

## Estrutura Target Recomendada
```

src/config/
├── api.ts # API endpoints e configurações
├── env.ts # Environment validation com Zod
├── constants.ts # Business constants
└── index.ts # Barrel export

```

## Prioridades de Implementação

1. **CRÍTICO**: Constants centralization
2. **CRÍTICO**: Environment validation
3. **IMPORTANTE**: API configuration
4. **IMPORTANTE**: TypeScript paths optimization
```

## Critérios de Aceitação

- [ ] Constants duplicados catalogados
- [ ] Environment variables listadas e analisadas
- [ ] Configurações dispersas identificadas
- [ ] Estrutura target definida
- [ ] Prioridades estabelecidas
- [ ] Resultados documentados em `analysis/results.md`

## Próximos Passos

Após completar a análise, proceder para `implementation/prompt.md` para implementar a foundation architecture.
