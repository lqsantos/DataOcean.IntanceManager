# Prompt: Implementação da Padronização de Imports

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Converter imports relativos para absolutos (@/) e criar barrel exports  
**Base**: Resultados da análise em `../analysis/results.md`

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

## Objetivo da Implementação

Implementar a conversão de imports relativos para absolutos (@/) e criar barrel exports estratégicos baseados na análise.

## Pré-requisitos

- [ ] Análise completa executada (`../analysis/results.md` preenchido)
- [ ] Lista de arquivos com imports relativos identificada
- [ ] Estrutura de barrel exports definida

## Tarefas de Implementação

### 1. Criar Barrel Exports Estratégicos

#### src/components/index.ts

```typescript
// Exports principais de componentes
export * from './applications';
export * from './environments';
export * from './locations';
export * from './layout';
export * from './ui';
export * from './theme-provider';
```

#### src/services/index.ts

```typescript
// Exports de services
export * from './application-service';
export * from './environment-service';
export * from './location-service';
// Adicionar outros services conforme análise
```

#### src/hooks/index.ts

```typescript
// Exports de hooks customizados
export * from './use-applications';
export * from './use-environments';
export * from './use-locations';
// Adicionar outros hooks conforme análise
```

#### src/types/index.ts

```typescript
// Exports de tipos
export * from './application';
export * from './environment';
export * from './location';
// Adicionar outros tipos conforme análise
```

### 2. Converter Imports Relativos para Absolutos

Para cada arquivo identificado na análise, substituir:

```typescript
// ❌ ANTES: Imports relativos
import { Component } from '../../components/ui/component';
import { useService } from '../hooks/use-service';
import type { EntityType } from '../types/entity';

// ✅ DEPOIS: Imports absolutos
import { Component } from '@/components/ui/component';
import { useService } from '@/hooks/use-service';
import type { EntityType } from '@/types/entity';
```

### 3. Utilizar Barrel Exports Onde Apropriado

```typescript
// ❌ ANTES: Imports específicos
import { ApplicationService } from '@/services/application-service';
import { EnvironmentService } from '@/services/environment-service';

// ✅ DEPOIS: Barrel import (quando múltiplos)
import { ApplicationService, EnvironmentService } from '@/services';
```

### 4. Configurar ESLint Rules (Opcional)

Adicionar rules para manter consistência:

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["../.*", "./.**/.*"]
      }
    ]
  }
}
```

## Checklist de Implementação

- [ ] Barrel exports criados nos diretórios principais
- [ ] Todos os imports relativos convertidos para @/
- [ ] Imports organizados e consistentes
- [ ] ESLint rules configuradas (opcional)
- [ ] Build sem erros de compilação

## Validação Rápida

```bash
# Verificar se ainda existem imports relativos
grep -r "from '\.\." src/ --include="*.ts" --include="*.tsx"

# Testar build
npm run build
npm run lint
```

## Próximo Passo

Após implementação, execute `../validation/prompt.md` para validação final.
