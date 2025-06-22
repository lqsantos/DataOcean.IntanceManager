# Prompt: Análise de Props Interfaces

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Padronizar interfaces de props dos componentes  
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

Catalogar todas as interfaces de props nos componentes e identificar inconsistências de nomenclatura, estrutura e tipagem.

## Tarefas de Análise

### 1. Mapear Interfaces de Props Existentes

Execute comandos para identificar padrões:

```bash
# Buscar interfaces de props
grep -r "interface.*Props" src/components/ --include="*.tsx" --include="*.ts"

# Buscar types de props
grep -r "type.*Props" src/components/ --include="*.tsx" --include="*.ts"

# Buscar props inline (sem interface nomeada)
grep -r "React\.FC<{" src/components/ --include="*.tsx"
grep -r "function.*{.*}.*)" src/components/ --include="*.tsx"
```

### 2. Identificar Padrões de Nomenclatura

Analisar inconsistências:

```bash
# Buscar diferentes patterns de nomenclatura
grep -r "Props\|Properties\|IProps" src/components/ --include="*.tsx" --include="*.ts"

# Verificar componentes sem interface tipada
grep -r "export.*function\|export.*const.*=" src/components/ --include="*.tsx" | head -10
```

### 3. Analisar Tipos de Props

Categorizar props por complexidade:

```bash
# Props simples (string, number, boolean)
grep -r ": string\|: number\|: boolean" src/components/ --include="*.tsx" | head -10

# Props complexas (objects, arrays, functions)
grep -r ": {.*}\|: \[\]\|: (.*) =>" src/components/ --include="*.tsx" | head -10

# Props opcionais vs obrigatórias
grep -r ": .*\?" src/components/ --include="*.tsx" | head -10
```

### 4. Verificar Documentação JSDoc

```bash
# Buscar props documentadas
grep -B2 -A2 "\*.*@param\|/\*\*" src/components/ --include="*.tsx" | head -20
```

### 5. Identificar Componentes Prioritários

Focar nos componentes mais utilizados:

```bash
# Componentes de layout
ls -la src/components/layout/

# Componentes de UI
ls -la src/components/ui/

# Componentes de domínio
ls -la src/components/applications/
ls -la src/components/environments/
ls -la src/components/locations/
```

## Resultado Esperado

Documente em `results.md`:

### 1. Inventário de Interfaces

- Lista completa de interfaces Props existentes
- Componentes sem interface definida
- Componentes com props inline

### 2. Inconsistências Identificadas

- Nomenclatura inconsistente (Props vs Properties vs IProps)
- Props não tipadas ou genéricas demais
- Falta de documentação JSDoc

### 3. Categorização por Prioridade

- **Alta**: Componentes core e layout
- **Média**: Componentes de domínio
- **Baixa**: Componentes específicos

### 4. Padrões Propostos

```typescript
// Template padrão proposto
interface ComponentNameProps {
  /**
   * Description of the prop
   */
  propName: Type;
  optionalProp?: Type;
  children?: React.ReactNode;
  className?: string;
}
```

## Próximo Passo

Após análise completa, execute `../implementation/prompt.md`
