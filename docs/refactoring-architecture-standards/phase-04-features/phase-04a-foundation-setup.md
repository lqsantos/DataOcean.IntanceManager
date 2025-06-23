# Phase 04A: Foundation Setup

**Objetivo**: Estabelecer estrutura base e padrões para migração de features seguindo architecture-standards.md e features-organization-strategy.md.

**Prioridade**: Alta - Base para todas as migrações de features

## Context & Architecture

> **📋 Contexto do Projeto**: Consulte sempre [project-architecture-context.md](../project-architecture-context.md) para entender a estrutura target e convenções do DataOcean Instance Manager.

### **Estratégia de Features (conforme features-organization-strategy.md)**

- **Migração gradual**: Estrutura atual → Features organizadas por domínio
- **Coexistência temporária**: Antiga e nova estrutura funcionando juntas
- **Validação incremental**: Cada feature migrada é validada antes da próxima

### **Categorização Global vs. Feature**

- **GLOBAL** (raiz): Código agnóstico de domínio, reutilizável
- **FEATURE-BOUND** (`features/[domain]/`): Código específico do domínio de negócio

### **Package Manager**: pnpm (padrão do projeto)

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Analisar estrutura atual de componentes em `src/components/`
- Identificar padrões de organização existentes
- Mapear dependências entre componentes
- Planejar estrutura target de features
- Estabelecer convenções de migração

### 2. Gaps Típicos Esperados

- [ ] **Estrutura features/**: Criar diretório base e padrões
- [ ] **Template de feature**: Estabelecer estrutura padrão
- [ ] **Barrel exports**: Padrão de Public API para features
- [ ] **Import paths**: Configurar @/features/\* aliases
- [ ] **Validation patterns**: Estabelecer padrões de validação de migração

## Implementação

### Step 1: Instruções de Backup (Usuário)

**ANTES DE INICIAR**: O usuário deve criar backup:

```bash
git add .
git commit -m "Backup before features foundation setup"
```

### Step 2: Criar Estrutura Base Features (Copilot Agent)

**CATEGORIA**: Global - Infraestrutura de features

**COMANDO**: Criar diretório e estrutura base:

```bash
# Estrutura conforme architecture-standards.md
src/features/
├── README.md                    # Documentação da arquitetura de features
└── .gitkeep                     # Manter diretório no git
```

```markdown
# src/features/README.md (GLOBAL)

# Features Architecture

Este diretório organiza o código por **domínios de negócio** seguindo o padrão **Domain-Driven Design**.

## Estrutura Padrão de Feature
```

features/[feature-name]/
├── components/ # Components específicos da feature
│ ├── [Feature]Table.tsx # Tabela principal
│ ├── [Feature]Form.tsx # Formulário principal
│ ├── [Feature]Modal.tsx # Modal específico
│ └── index.ts # Exports dos components
├── hooks/ # Hooks específicos da feature
│ ├── use-[feature].ts # Hook principal de dados
│ ├── use-[feature]-form.ts # Hook de formulário
│ └── index.ts # Exports dos hooks
├── services/ # Services específicos da feature
│ ├── [feature]-service.ts # Service principal
│ └── index.ts # Exports dos services
├── types/ # Types específicos da feature
│ ├── [feature].ts # Types principais
│ └── index.ts # Exports dos types
├── constants/ # Constants específicos da feature
│ ├── [feature].ts # Constants principais
│ └── index.ts # Exports dos constants
└── index.ts # Public API da feature

````

## Public API Pattern

Cada feature exporta uma API pública limpa:

```typescript
// features/[feature]/index.ts
export { FeatureTable, FeatureForm } from './components';
export { useFeature, useFeatureForm } from './hooks';
export { featureService } from './services';
export type { Feature, FeatureFormData } from './types';
export { FEATURE_STATUS } from './constants';
````

## Convenções

- **Domain-Driven**: Organização por domínio de negócio
- **Self-Contained**: Cada feature é independente
- **Public API**: Interface limpa entre features
- **Global Resources**: Código comum na raiz para facilidade de acesso

````

### Step 3: Configurar TypeScript Paths (Copilot Agent)

**COMANDO**: Atualizar `tsconfig.json` para suportar features:

```json
// tsconfig.json - adicionar paths para features
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"]
    }
  }
}
````

### Step 4: Criar Template de Feature (Copilot Agent)

**CATEGORIA**: Global - Template para criação de features

**COMANDO**: Criar template de referência:

```typescript
// src/features/_template/index.ts (TEMPLATE)
/**
 * TEMPLATE DE FEATURE
 *
 * Copie esta estrutura para criar novas features:
 * 1. Substitua [FEATURE] pelo nome da feature (PascalCase)
 * 2. Substitua [feature] pelo nome da feature (camelCase)
 * 3. Implemente os componentes, hooks, services, etc.
 */

// Public API da Feature
export { [FEATURE]Table, [FEATURE]Form, [FEATURE]Modal } from './components';
export { use[FEATURE]s, use[FEATURE]Form } from './hooks';
export { [feature]Service } from './services';
export type { [FEATURE], [FEATURE]FormData, [FEATURE]Filters } from './types';
export { [FEATURE]_STATUS, [FEATURE]_VALIDATION } from './constants';
```

```typescript
// src/features/_template/components/index.ts (TEMPLATE)
export { [FEATURE]Table } from './[FEATURE]Table';
export { [FEATURE]Form } from './[FEATURE]Form';
export { [FEATURE]Modal } from './[FEATURE]Modal';
```

```typescript
// src/features/_template/hooks/index.ts (TEMPLATE)
export { use[FEATURE]s } from './use-[feature]s';
export { use[FEATURE]Form } from './use-[feature]-form';
```

```typescript
// src/features/_template/services/index.ts (TEMPLATE)
export { [feature]Service } from './[feature]-service';
```

```typescript
// src/features/_template/types/index.ts (TEMPLATE)
export type { [FEATURE], [FEATURE]FormData, [FEATURE]Filters } from './[feature]';
```

```typescript
// src/features/_template/constants/index.ts (TEMPLATE)
export { [FEATURE]_STATUS, [FEATURE]_VALIDATION } from './[feature]';
```

### Step 5: Estabelecer Padrões de Migração (Copilot Agent)

**CATEGORIA**: Global - Guidelines de migração

**COMANDO**: Criar documentação de padrões:

```markdown
# MIGRATION_PATTERNS.md

## Critério de Separação

### Feature-Specific (vai para features/[domain]/)

- Código que conhece o **domínio de negócio específico**
- Components que não serão reutilizados
- Hooks que conhecem entidades específicas
- Services que lidam com APIs específicas
- Types específicos do domínio

### Global (fica na raiz)

- Código **agnóstico de domínio**, reutilizável
- Components genéricos (UI, forms, tables)
- Hooks utilitários (debounce, toggle, etc.)
- Utils genéricos (format, validation)
- Types compartilhados

## Padrão de Migração

1. **Análise**: Identificar arquivos do domínio
2. **Mapeamento**: Mapear dependências
3. **Criação**: Criar estrutura da feature
4. **Migração**: Mover arquivos mantendo funcionalidade
5. **Public API**: Estabelecer exports limpos
6. **Validação**: Testar funcionamento
7. **Cleanup**: Atualizar imports e remover arquivos antigos

## Nomenclatura

- **Feature Directory**: kebab-case (`user-management`)
- **Components**: PascalCase (`UserTable`, `UserForm`)
- **Files**: kebab-case (`user-table.tsx`, `use-users.ts`)
- **Types**: PascalCase (`User`, `UserFormData`)
- **Constants**: SCREAMING_SNAKE_CASE (`USER_STATUS`)
```

### Step 6: Validação da Estrutura (Copilot Agent)

**COMANDO**: Use ferramentas do VS Code para validação:

1. **Verificar Estrutura**: Use `list_dir` para confirmar criação
2. **Verificar TypeScript**: Use `get_errors` para validar paths
3. **Verificar Imports**: Testar se @/features/\* funciona

```typescript
// Copilot Agent deve usar:
// 1. list_dir("src/features") - Verificar estrutura criada
// 2. get_errors(["tsconfig.json"]) - Verificar configuração TS
// 3. file_search("@/features") - Verificar se paths funcionam
// 4. Verificar no Problems panel do VS Code se há erros
```

**APÓS validação automática**, fazer commit:

```bash
git add .
git commit -m "feat: establish features foundation setup and migration patterns"
```

## Checklist de Finalização

### ✅ Estrutura Base (Copilot Agent)

- [ ] Diretório `src/features/` criado
- [ ] README.md com documentação da arquitetura
- [ ] Template de feature estabelecido
- [ ] Padrões de migração documentados

### ✅ Configuração TypeScript (Copilot Agent)

- [ ] Paths @/features/\* configurados no tsconfig.json
- [ ] Imports funcionando corretamente
- [ ] Sem erros de compilação

### ✅ Documentação (Copilot Agent)

- [ ] README.md explicando estrutura de features
- [ ] MIGRATION_PATTERNS.md com guidelines
- [ ] Template de referência para novas features

### ✅ Validação Final (Copilot Agent)

- [ ] `list_dir` - Estrutura criada corretamente
- [ ] `get_errors` - Sem erros de compilação TypeScript
- [ ] Problems panel vazio no VS Code
- [ ] Alterações commitadas

### ✅ Impacto Esperado

- [ ] **Estrutura de features** estabelecida seguindo architecture-standards.md
- [ ] **Template padrão** para criação de features
- [ ] **Padrões de migração** claramente definidos
- [ ] **TypeScript paths** configurados para facilitar imports
- [ ] **Base sólida** para migração incremental dos domínios

## Próximo Passo

→ **Phase 04B-1: Applications Migration** - Primeiro domínio (prova de conceito)
