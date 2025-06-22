# Phase 04: Features Architecture

## Objetivo

Organizar o código por features/domínios ao invés de tipos técnicos, criando uma arquitetura escalável e mantível baseada em contextos de negócio.

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Analisar estrutura atual de diretórios
- Identificar features/domínios de negócio existentes
- Mapear components, hooks e services por domínio
- Avaliar organização atual vs. features-based

### 2. Features de Negócio Típicas

Baseado na análise automática, as features principais geralmente são:

```
Features identificadas:
├── applications/     # Gestão de aplicações
├── environments/     # Gestão de ambientes
├── locations/        # Gestão de localizações
├── blueprints/       # Templates e blueprints
├── auth/            # Autenticação
└── dashboard/       # Dashboard principal
```

### 3. Gaps Arquiteturais Esperados

- [ ] **Organização por feature**: Código espalhado por tipo técnico
- [ ] **Shared components**: Misturados com feature-specific
- [ ] **Business logic**: Espalhada entre components e services
- [ ] **Domain boundaries**: Não definidas claramente

## Implementação

### Step 1: Instruções de Backup (Usuário)

**ANTES DE INICIAR**: O usuário deve criar backup:

```bash
git add .
git commit -m "Backup before features architecture refactoring"
```

### Step 2: Análise da Estrutura Atual (Copilot Agent)

O Copilot Agent irá automaticamente usar suas ferramentas nativas:

- **`file_search`**: Identificar features/domínios existentes
- **`grep_search`**: Mapear components, hooks e services por domínio
- **`list_dir`**: Analisar estrutura atual de diretórios
- **`semantic_search`**: Encontrar padrões de organização

### Step 3: Criação da Nova Estrutura (Copilot Agent)

O Copilot Agent irá criar automaticamente usando `create_directory` e `create_file`:

```
src/
├── features/
│   ├── applications/
│   │   ├── components/           # Components específicos de aplicações
│   │   │   ├── application-card.tsx
│   │   │   ├── application-form.tsx
│   │   │   ├── application-list.tsx
│   │   │   └── index.ts
│   │   ├── hooks/               # Hooks específicos
│   │   │   ├── use-applications.ts
│   │   │   ├── use-application-form.ts
│   │   │   └── index.ts
│   │   ├── services/            # Business logic
│   │   │   ├── application-service.ts
│   │   │   ├── application-validation.ts
│   │   │   └── index.ts
│   │   ├── types/               # Types específicos
│   │   │   ├── application.ts
│   │   │   └── index.ts
│   │   ├── utils/               # Utils específicos
│   │   │   ├── application-utils.ts
│   │   │   └── index.ts
│   │   └── index.ts             # Feature export
│   ├── environments/
│   ├── locations/
│   └── ...
├── shared/
│   ├── components/              # Components reutilizáveis
│   │   ├── ui/                  # Base UI components
│   │   ├── layout/              # Layout components
│   │   ├── forms/               # Form components
│   │   └── index.ts
│   ├── hooks/                   # Hooks reutilizáveis
│   ├── utils/                   # Utils globais
│   └── types/                   # Types globais
├── lib/                         # Configurações e setup
├── config/                      # Configurações
└── constants/                   # Constantes globais
```

### Step 4: Migração de Applications Feature (Copilot Agent)

O Copilot Agent irá usar ferramentas nativas para migração:

1. **`file_search`**: Buscar arquivos `*application*` para identificar componentes
2. **`read_file`**: Analisar conteúdo dos arquivos encontrados
3. **`create_file`**: Criar arquivos na nova estrutura de features
4. **`replace_string_in_file`**: Mover conteúdo e atualizar imports

**O Agent criará componentes na estrutura**: `src/features/applications/components/`

### Step 5: Migração de Hooks (Copilot Agent)

**Processo**: O Agent identificará hooks existentes e os migrará para `src/features/{feature}/hooks/`

**Padrão esperado**: `useApplications`, `useEnvironments`, `useLocations`

### Step 6: Migração de Services (Copilot Agent)

**Processo**: O Agent moverá services para `src/features/{feature}/services/`

**Padrão esperado**: Classes que herdam de `BaseService` ou funções específicas de domínio

### Step 7: Definir Types (Copilot Agent)

**Processo**: O Agent criará types específicos em `src/features/{feature}/types/`

**Separação**: Types de domínio vs types compartilhados

### Step 8: Feature Index (Copilot Agent)

**Processo**: O Agent criará barrel exports em cada feature (`index.ts`)

**Objetivo**: Imports limpos tipo `import { ApplicationCard } from '@/features/applications'`

### Step 9: Atualização de Imports (Copilot Agent)

O Copilot Agent irá atualizar automaticamente usando suas ferramentas nativas:

- **`grep_search`**: Encontrar todos os imports antigos
- **`replace_string_in_file`**: Atualizar imports para nova estrutura
- **`get_errors`**: Verificar se mudanças quebram o build
- **`semantic_search`**: Validar referências perdidas

### Step 10: Shared Components (Copilot Agent)

**Processo**: O Agent identificará componentes reutilizáveis e os moverá para `src/shared/`

**Critérios**: Components usados por múltiplas features ou genéricos (DataTable, Pagination, etc.)

### Step 11: Atualizar TSConfig (Copilot Agent)

**Processo**: O Agent atualizará `tsconfig.json` para incluir paths de features

**Paths necessários**: `@/features/*`, `@/shared/*`

### Step 12: Validação e Commit (Usuário)

**APÓS a migração completa**: O usuário deve validar e commitar:

```bash
# Validar refatoração
pnpm type-check   # Verificar types
pnpm build        # Verificar se build passa
pnpm test         # Verificar se testes passam
pnpm dev          # Verificar se app funciona

# Commitar
git add .
git commit -m "feat: implement features-based architecture organization"
```

## Checklist de Finalização

### ✅ Antes de Iniciar (Usuário)

- [ ] Backup realizado

### ✅ Estrutura de Features (Copilot Agent)

- [ ] Features principais identificadas e criadas
- [ ] Subdiretórios criados para cada feature
- [ ] Shared vs feature-specific bem definido
- [ ] Barrel exports implementados

### ✅ Migração Completa (Copilot Agent)

- [ ] Components migrados para features
- [ ] Hooks migrados e organizados
- [ ] Services agrupados por domínio
- [ ] Types específicos definidos

### ✅ Imports e Paths (Copilot Agent)

- [ ] TSConfig paths atualizados
- [ ] Imports atualizados para nova estrutura
- [ ] Barrel exports funcionando
- [ ] IDE intellisense funcionando

### ✅ Shared Layer (Copilot Agent)

- [ ] Components UI genéricos identificados
- [ ] Hooks reutilizáveis separados
- [ ] Utils globais organizados
- [ ] Types base definidos

### ✅ Validação Final (Usuário)

- [ ] `pnpm type-check` - Types válidos
- [ ] `pnpm build` - Build successful
- [ ] `pnpm test` - Tests passam
- [ ] App funciona normalmente
- [ ] Features independentes funcionais
- [ ] Alterações commitadas

### ✅ Benefícios Alcançados

- [ ] **Discoverability**: Fácil encontrar código relacionado
- [ ] **Maintainability**: Mudanças isoladas por feature
- [ ] **Scalability**: Novas features seguem padrão consistente
- [ ] **Team collaboration**: Diferentes times podem trabalhar em features separadas

## Próximo Passo

→ **Phase 05: State & i18n Architecture**
