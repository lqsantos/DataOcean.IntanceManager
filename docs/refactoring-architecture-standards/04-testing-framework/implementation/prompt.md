# Prompt: Implementação da Migração de Framework de Testes (CONDICIONAL)

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Situação Atual**: Vitest configurado  
**Decisão**: Baseada nos resultados de `../analysis/results.md`

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
- **Testing**: Vitest (potencialmente migrando para Jest)
- **Mocking**: MSW (Mock Service Worker)
- **State**: React hooks + Context
- **i18n**: Custom i18n implementation

### Domínios Principais

1. **Applications** - Gerenciamento de aplicações
2. **Environments** - Gerenciamento de ambientes (prod, staging, dev)
3. **Locations** - Gerenciamento de localizações/datacenters

## ⚠️ DECISÃO CONDICIONAL

**SE a análise indicou MANTER Vitest:**

- Marque esta fase como ✅ **Mantido/Otimizado**
- Pule para a validação apenas para confirmar que tudo funciona
- Foque esforços nas outras fases mais críticas

**SE a análise indicou MIGRAR para Jest:**

- Execute as tarefas de implementação abaixo

## Tarefas de Implementação (APENAS se migração for necessária)

### 1. Instalar Dependências Jest + @next/jest

```bash
# Remover Vitest
npm uninstall vitest @vitest/ui vitest-environment-jsdom

# Instalar Jest + @next/jest
npm install --save-dev jest @next/jest @types/jest jest-environment-jsdom
```

### 2. Criar Configuração Jest

**Criar `jest.config.js`:**

```javascript
const nextJest = require('@next/jest');

const createJestConfig = nextJest({
  // Caminho para sua aplicação Next.js para carregar next.config.js e .env
  dir: './',
});

// Configuração customizada do Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Mapear alias @/ para src/
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
};

module.exports = createJestConfig(customJestConfig);
```

**Criar `jest.setup.js`:**

```javascript
import '@testing-library/jest-dom';

// Setup adicional para testes se necessário
```

### 3. Atualizar package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 4. Migrar Testes Existentes (se necessário)

Se existirem diferenças sintáticas entre Vitest e Jest:

```typescript
// Verificar se há imports específicos do Vitest para substituir
// Exemplo de possíveis mudanças:
// import { vi } from 'vitest' → const vi = jest

// Buscar testes existentes
find src/ -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx"
```

### 5. Remover Configuração Vitest

```bash
# Remover arquivo de configuração Vitest
rm vitest.config.ts 2>/dev/null || echo "Arquivo não encontrado"

# Verificar se há referências ao Vitest em outros arquivos
grep -r "vitest" . --exclude-dir=node_modules
```

## Checklist de Implementação

- [ ] Dependências Jest instaladas e Vitest removidas
- [ ] `jest.config.js` criado e configurado
- [ ] `jest.setup.js` criado
- [ ] Scripts npm atualizados
- [ ] Testes existentes migrados (se necessário)
- [ ] Configuração Vitest removida
- [ ] Build funciona sem erros

## Validação Rápida

```bash
# Testar nova configuração
npm run test
npm run test:coverage

# Verificar se build ainda funciona
npm run build
```

## Próximo Passo

Execute `../validation/prompt.md` para validação final, independente da decisão tomada.
