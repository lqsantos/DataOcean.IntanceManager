# Phase 04B-2: Environments Migration

**Objetivo**: Migrar domínio Environments para arquitetura de features seguindo padrões estabelecidos na migração de Applications.

**Prioridade**: Alta - Foundation Domain

## Context & Architecture

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](../project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Domain: Environments**

- **Complexidade**: Baixa (Foundation Domain)
- **Pattern**: Standard CRUD operations (similar a Applications)
- **Workflow**: Simple table + modal form
- **Dependencies**: Locations (referências)

### **Categorização para Environments**

- **FEATURE-BOUND** (`features/environments/`): Todos os componentes, hooks, services específicos de Environments
- **GLOBAL** (raiz): Apenas UI components genéricos reutilizados

### **Template Base**: Seguir padrão estabelecido em Applications

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Mapear arquivos relacionados a Environments usando padrões de Applications
- Identificar dependências e imports
- Analisar hooks, services, types existentes
- Aplicar padrão de migração estabelecido
- Preservar funcionalidade 100%

### 2. Arquivos Esperados para Migração

**Components (src/components/)**:

- [ ] `environments/` (diretório completo)
- [ ] Verificar components relacionados

**Hooks**:

- [ ] `src/hooks/use-environments.ts`

**Services**:

- [ ] `src/services/environment-service.ts`

**Types**:

- [ ] `src/types/environment.ts`

## Implementação

### Step 1: Análise de Mapeamento (Copilot Agent)

**COMANDO**: Use mesmo padrão de Applications para mapear:

```typescript
// Copilot Agent deve usar:
// 1. file_search("**/environments/**") - Mapear components
// 2. file_search("**/environment*") - Mapear arquivos relacionados
// 3. grep_search("environment", isRegexp=false) - Encontrar referências
// 4. read_file para analisar estrutura (similar a Applications)
```

### Step 2: Criar Estrutura Environments Feature (Copilot Agent)

**CATEGORIA**: Feature-bound - Domínio Environments

**COMANDO**: Aplicar template padrão:

```bash
src/features/environments/
├── components/
│   ├── EnvironmentTable.tsx
│   ├── EnvironmentForm.tsx
│   ├── EnvironmentModal.tsx
│   └── index.ts
├── hooks/
│   ├── use-environments.ts
│   ├── use-environment-form.ts
│   └── index.ts
├── services/
│   ├── environment-service.ts
│   └── index.ts
├── types/
│   ├── environment.ts
│   └── index.ts
├── constants/
│   ├── environment.ts
│   └── index.ts
└── index.ts                # Public API
```

### Step 3-8: Migração Seguindo Padrão Applications

**COMANDO**: Aplicar exatamente o mesmo processo de Applications:

- **Step 3**: Migrar Components (mesmo padrão, nomes Environment\*)
- **Step 4**: Migrar Hooks (use-environments.ts, use-environment-form.ts)
- **Step 5**: Migrar Services (environment-service.ts)
- **Step 6**: Migrar Types (Environment, EnvironmentFormData, etc.)
- **Step 7**: Criar Constants (ENVIRONMENT_STATUS, ENVIRONMENT_VALIDATION)
- **Step 8**: Estabelecer Public API limpa

### Step 9: Atualizar Imports Existentes (Copilot Agent)

**COMANDO**: Mesmo padrão de Applications:

```typescript
// ANTES
import { useEnvironments } from '@/hooks/use-environments';
import { environmentService } from '@/services/environment-service';
import type { Environment } from '@/types/environment';

// DEPOIS
import { useEnvironments, environmentService, type Environment } from '@/features/environments';
```

### Step 10-11: Validação e Cleanup (Copilot Agent)

**COMANDO**: Aplicar mesma validação de Applications + cleanup de arquivos antigos.

**APÓS validação automática**, fazer commit:

```bash
git add .
git commit -m "feat: migrate Environments domain to features architecture"
```

## Checklist de Finalização

### ✅ Migração Completa (Copilot Agent)

- [ ] Estrutura `src/features/environments/` criada seguindo padrão
- [ ] Components, hooks, services, types migrados
- [ ] Public API estabelecida
- [ ] Imports atualizados
- [ ] Validação completa (build + tests)
- [ ] Arquivos antigos removidos
- [ ] Funcionalidade preservada 100%

## Próximo Passo

→ **Phase 04B-3: Locations Migration**
