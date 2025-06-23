# Phase 01: Foundation Architecture

## Architecture Context for Agent

**REFERENCE**: Ver `project-architecture-context.md` para contexto completo do projeto

**CURRENT STATE**: Configurações e utils espalhados pelo código
**TARGET STATE**: Foundation global consolidada conforme `docs/architecture-standards.md`
**APPROACH**: Criar estrutura TARGET FINAL para código global cross-cutting

### Key Decisions for Agent:

- **Foundation é PERMANENTE**: Esta é a estrutura final, não temporária
- **Global na raiz**: Para código usado por múltiplas features
- **Domain-specific mantém**: Services específicos ficam atuais até Phase 04

## Objetivo

Estabelecer foundation arquitetural final com configurações centralizadas, utilitários globais e tipos base conforme architecture standards.

## Análise para Agent

### 1. O Copilot Agent deve executar:

**COMANDOS específicos:**

- `file_search` pattern="\*_/_.{ts,tsx}" para mapear estrutura atual
- `grep_search` pattern="config|Config" para encontrar configurações espalhadas
- `grep_search` pattern="const._=._{" includePattern="src/\*\*" para constants
- Categorizar findings: **Global** (vai para foundation) vs **Feature-specific** (fica atual)

### 2. Expected Agent Analysis:

```
✅ Para Foundation (src/raiz/): API configs, formatters, BaseEntity, validators
🔄 Mantém atual: Application types, Environment services, Location hooks
📝 Output: Lista categorizada do que vai para cada diretório
```

## Implementação

### Step 1: Backup (Usuário)

**OBRIGATÓRIO antes de iniciar**:

```bash
git add . && git commit -m "backup: before foundation architecture"
```

### Step 2: Análise e Categorização (Copilot Agent)

**Agent deve mapear e categorizar código atual:**

**COMANDOS:**

1. `file_search` pattern="src/\*_/_.{ts,tsx}"
2. `grep_search` pattern="export const.\*config" isRegexp=true
3. `grep_search` pattern="export.*interface.*Entity" isRegexp=true

**CATEGORIZAÇÃO esperada:**

- ✅ **Global (move para foundation)**: API configs, formatters, BaseEntity, error classes
- 🔄 **Feature-specific (mantém atual)**: ApplicationService, EnvironmentType, LocationHook

**Agent Output**: Lista do que vai para `src/{config,constants,utils,types}/`

### Step 3: Configurações Globais (Copilot Agent)

**Agent deve criar estrutura:**

- `src/config/app.ts` - configurações da aplicação
- `src/config/api.ts` - settings de API
- `src/config/index.ts` - barrel exports

**Exemplo essencial:**

```typescript
// src/config/api.ts
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 30000,
} as const;
```

### Step 4: Constants Globais (Copilot Agent)

**Agent deve criar:**

- `src/constants/routes.ts` - rotas da aplicação
- `src/constants/status.ts` - status globais (loading, error, etc)
- `src/constants/index.ts` - barrel exports

**Exemplo pattern:**

```typescript
// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  APPLICATIONS: '/applications',
} as const;
```

### Step 5: Utils Globais (Copilot Agent)

**Agent deve criar:**

- `src/utils/validation.ts` - validators reutilizáveis
- `src/utils/formatting.ts` - formatters cross-domain
- `src/utils/error.ts` - error handling global
- `src/utils/index.ts` - barrel exports

**Exemplo key:**

```typescript
// src/utils/error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
  }
}
```

### Step 6: Types Base (Copilot Agent)

**Agent deve criar APENAS types GLOBAIS:**

- `src/types/common.ts` - BaseEntity, ApiResponse
- `src/types/ui.ts` - Status, LoadingState
- `src/types/index.ts` - barrel exports

**IMPORTANTE**: Domain types (Application, Environment) ficam atuais

**Exemplo:**

```typescript
// src/types/common.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Step 7: TSConfig Paths (Copilot Agent)

**Agent deve atualizar `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/config/*": ["src/config/*"],
      "@/constants/*": ["src/constants/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}
```

### Step 8: Validação Final (Copilot Agent)

**Agent deve PRIORIZAR VS Code integration:**

1. `get_errors` - verificar Problems panel primeiro
2. Se necessário: `run_in_terminal: 'pnpm run type-check'`
3. Se necessário: `run_in_terminal: 'pnpm run build'`

**Success criteria:** Zero errors no Problems panel, build successful

## Checklist de Finalização

### ✅ Para o Agent

- [ ] Foundation structure criada (`src/{config,constants,utils,types}/`)
- [ ] Barrel exports implementados
- [ ] TSConfig paths configurados
- [ ] Build e type-check passando

### ✅ Para o Usuário

- [ ] Validar funcionamento da aplicação
- [ ] Commit das mudanças
- [ ] Pronto para Phase 02

## Próximo Passo

→ **Phase 02: Testing Framework**

_Foundation estabelecida conforme architecture standards._
