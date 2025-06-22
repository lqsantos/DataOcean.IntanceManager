# Prompt: Análise de Consolidação MSW

## Objetivo

Mapear todos os mocks MSW existentes e identificar duplicações, inconsistências e oportunidades de consolidação.

## Tarefas de Análise

### 1. Mapear Estrutura Atual de Mocks

```bash
# Verificar estrutura de mocks
find . -name "*mock*" -type f | grep -v node_modules
find . -name "*msw*" -type f | grep -v node_modules

# Verificar diretórios de mocks
ls -la src/mocks/
ls -la src/tests/ | grep mock

# Verificar handlers MSW
find src/ -name "*handler*" -type f
```

### 2. Identificar Duplicações

```bash
# Buscar handlers duplicados
grep -r "rest.get\|rest.post\|rest.put\|rest.delete" src/ --include="*.ts" --include="*.tsx"

# Buscar endpoints duplicados
grep -r "'/api/" src/ --include="*.ts" --include="*.tsx" | grep -v service

# Verificar configuração MSW
grep -r "setupServer\|worker" src/ --include="*.ts"
```

### 3. Analisar Organização por Domínio

```bash
# Verificar se handlers estão organizados por domínio
ls -la src/mocks/handlers/ 2>/dev/null || echo "Não encontrado"

# Verificar handlers por entidade
grep -r "application\|environment\|location" src/mocks/ --include="*.ts" 2>/dev/null || echo "Verificar estrutura"
```

### 4. Verificar Uso em Testes

```bash
# Como mocks são importados nos testes
grep -r "from.*mock" src/tests/ --include="*.ts" --include="*.tsx"

# Configuração em diferentes contextos
grep -r "beforeAll\|beforeEach" src/tests/ --include="*.ts" | grep -i mock
```

### 5. Verificar Configuração de Desenvolvimento

```bash
# Service worker para desenvolvimento
ls -la public/mockServiceWorker.js

# Configuração para diferentes ambientes
grep -r "NODE_ENV.*mock\|mock.*NODE_ENV" src/
```

## Resultado Esperado

Documente em `results.md`:

### 1. Inventário Atual

- Localização de todos os arquivos de mock
- Handlers existentes por domínio
- Configurações MSW identificadas

### 2. Duplicações Identificadas

- Endpoints duplicados entre arquivos
- Handlers similares em locais diferentes
- Configurações redundantes

### 3. Problemas Encontrados

- Imports inconsistentes
- Organização confusa
- Falta de padronização

### 4. Estrutura Proposta

```
src/mocks/
├── index.ts              # Configuração principal
├── browser.ts           # Setup para desenvolvimento
├── server.ts            # Setup para testes
└── handlers/
    ├── index.ts         # Barrel export de todos handlers
    ├── applications.ts  # Handlers de applications
    ├── environments.ts  # Handlers de environments
    ├── locations.ts     # Handlers de locations
    └── common.ts        # Handlers comuns (auth, etc.)
```

### 5. Plano de Consolidação

- Arquivos a mover/remover
- Imports a atualizar
- Testes a ajustar

## Próximo Passo

Após análise completa, execute `../implementation/prompt.md`

---

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
