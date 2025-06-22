# Prompt: Análise de Constantes Duplicadas

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Centralizar constantes duplicadas em `src/lib/constants.ts`  
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

Identificar e catalogar todas as constantes duplicadas, strings hardcoded e valores mágicos no projeto para centralização.

## Tarefas de Análise

### 1. Buscar Constantes Duplicadas

Execute os seguintes comandos para identificar padrões:

```bash
# Buscar strings comuns que podem ser constantes
grep -r "TODO\|FIXME\|NOTE" src/ --include="*.ts" --include="*.tsx"
grep -r '"[A-Z_]{3,}"' src/ --include="*.ts" --include="*.tsx"
grep -r "'[A-Z_]{3,}'" src/ --include="*.ts" --include="*.tsx"

# Buscar valores numéricos mágicos
grep -r "\b[0-9]{2,}\b" src/ --include="*.ts" --include="*.tsx"

# Buscar strings de configuração/mensagens repetidas
grep -r "className.*=" src/ --include="*.tsx" | head -20
grep -r "placeholder.*=" src/ --include="*.tsx" | head -20
```

### 2. Revisar Arquivos Existentes

Verifique se já existe algum arquivo de constantes:

- `src/lib/constants.ts`
- `src/constants/`
- `src/config/`

### 3. Identificar Categorias

Classifique as constantes encontradas em:

- **UI Constants**: Classes CSS, placeholder texts, labels
- **Business Constants**: Status values, tipos de dados
- **Configuration**: URLs, limites, timeouts
- **Messages**: Textos de erro, sucesso, validação

### 4. Buscar Padrões Específicos do Projeto

Com base na estrutura do DataOcean Instance Manager, busque:

```bash
# Constantes de API duplicadas
grep -r "'/api/" src/ --include="*.ts" --include="*.tsx"
grep -r '"/api/' src/ --include="*.ts" --include="*.tsx"

# Status values comuns
grep -r "active\|inactive\|pending\|running\|stopped" src/ --include="*.ts" --include="*.tsx"

# Environment/Application types
grep -r "production\|development\|staging" src/ --include="*.ts" --include="*.tsx"

# Mensagens de erro/sucesso comuns
grep -r "Error\|Success\|Failed\|Loading" src/ --include="*.ts" --include="*.tsx" | grep -v "console"

# Constantes de tempo/timeout
grep -r "1000\|2000\|5000\|timeout" src/ --include="*.ts" --include="*.tsx"
```

### 5. Analisar Services Específicos

Verifique duplicações nos services principais:

```bash
# Services com possíveis constantes duplicadas
ls -la src/services/
grep -r "const.*=" src/services/ --include="*.ts" | head -10
```

## Resultado Esperado

Documente os achados em `results.md` com:

1. Lista de constantes duplicadas encontradas
2. Categorização das constantes
3. Arquivos afetados para cada constante
4. Proposta de estrutura para `src/lib/constants.ts`

### Exemplo de Estrutura Esperada

```typescript
// src/lib/constants.ts
export const API = {
  BASE_URL: '/api',
  ENDPOINTS: {
    APPLICATIONS: '/applications',
    ENVIRONMENTS: '/environments',
    LOCATIONS: '/locations',
  },
  TIMEOUTS: {
    DEFAULT: 5000,
    LONG_OPERATION: 30000,
  },
} as const;

export const UI = {
  PLACEHOLDERS: {
    SEARCH: 'Search...',
    NAME: 'Enter name',
    DESCRIPTION: 'Enter description',
  },
  MESSAGES: {
    LOADING: 'Loading...',
    ERROR: 'An error occurred',
    SUCCESS: 'Operation completed successfully',
  },
} as const;

export const BUSINESS = {
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
  },
  ENVIRONMENTS: {
    PRODUCTION: 'production',
    STAGING: 'staging',
    DEVELOPMENT: 'development',
  },
} as const;
```

## Próximo Passo

Após completar a análise, execute `../implementation/prompt.md`
