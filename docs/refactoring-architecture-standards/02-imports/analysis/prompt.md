# Prompt: Análise de Imports Inconsistentes

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Padronizar imports para usar aliases absolutos (@/) e barrel exports  
**Localização**: `/Users/leandroqueirozdossantos/repos/projetos/02-Application/DataOcean.IntanceManager`

## Informações do Projeto

### Estrutura Atual do Projeto

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── applications/    # Application-related components
│   ├── environments/    # Environment-related components
│   ├── locations/       # Location-related components
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # Generic UI components
├── services/            # API services
│   ├── application-service.ts
│   ├── environment-service.ts
│   └── location-service.ts
├── hooks/               # Custom React hooks
│   ├── use-applications.ts
│   ├── use-environments.ts
│   └── use-locations.ts
├── types/               # TypeScript type definitions
│   ├── application.ts
│   ├── environment.ts
│   └── location.ts
├── mocks/               # MSW mocks for testing/development
├── lib/                 # Utility libraries and configurations
└── locales/             # i18n translation files
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
2. **Environments** - Gerenciamento de ambientes (prod, staging, dev)
3. **Locations** - Gerenciamento de localizações/datacenters

## Objetivo da Análise

Identificar todos os imports relativos e mapear oportunidades para implementar barrel exports, padronizando para o uso de aliases absolutos (@/).

## Tarefas de Análise

### 1. Identificar Imports Relativos

Execute comandos para mapear imports inconsistentes:

```bash
# Buscar todos os imports relativos (../../)
grep -r "from '\.\." src/ --include="*.ts" --include="*.tsx" | head -20
grep -r "from \"\.\." src/ --include="*.ts" --include="*.tsx" | head -20

# Buscar imports que poderiam usar @/
grep -r "from '\./\.\." src/ --include="*.ts" --include="*.tsx"
grep -r "from \"\./\.\." src/ --include="*.ts" --include="*.tsx"

# Verificar uso atual de @/
grep -r "from '@/" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### 2. Mapear Oportunidades de Barrel Exports

Identifique diretórios que se beneficiariam de barrel exports:

```bash
# Verificar se já existem index.ts
find src/ -name "index.ts" -o -name "index.tsx"

# Verificar estrutura de diretórios principais
ls -la src/components/
ls -la src/services/
ls -la src/hooks/
ls -la src/types/
```

### 3. Analisar Padrões de Import

Categorize os types de imports encontrados:

- **Componentes**: imports entre componentes
- **Services**: imports de services
- **Types**: imports de tipos
- **Utils/Lib**: imports de utilitários
- **Hooks**: imports de hooks customizados

### 4. Verificar Configuração Atual

Confirme configuração de aliases no tsconfig.json:

```bash
# Verificar paths configurados
grep -A 10 '"paths"' tsconfig.json
```

### 5. Analisar Estrutura Específica do Projeto

Com base na estrutura do DataOcean Instance Manager:

```bash
# Verificar imports específicos do projeto
grep -r "from.*components" src/ --include="*.tsx" | head -10
grep -r "from.*services" src/ --include="*.ts" | head -10
grep -r "from.*hooks" src/ --include="*.ts" | head -10

# Verificar imports de types
grep -r "from.*types" src/ --include="*.ts" --include="*.tsx" | head -10

# Verificar imports de locales/i18n
grep -r "from.*locales\|from.*i18n" src/ --include="*.ts" --include="*.tsx"

# Verificar imports em áreas críticas
ls -la src/app/
ls -la src/components/applications/
ls -la src/components/environments/
ls -la src/components/locations/
```

## Resultado Esperado

Documente em `results.md`:

1. Lista de arquivos com imports relativos
2. Contagem de imports @/ vs relativos
3. Diretórios candidatos para barrel exports
4. Estrutura proposta de barrel exports
5. Plano de conversão por categoria

## Próximo Passo

Após análise completa, execute `../implementation/prompt.md`
