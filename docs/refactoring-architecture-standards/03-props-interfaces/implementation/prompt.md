# Prompt: Implementação da Unificação de Props Interfaces

## Contexto do Projeto

**Projeto**: DataOcean Instance Manager (Next.js + TypeScript)  
**Objetivo**: Padronizar interfaces de props seguindo convenção `ComponentNameProps`  
**Base**: Resultados da análise em `../analysis/results.md`

## Objetivo da Implementação

Unificar e padronizar todas as interfaces de props dos componentes, seguindo convenções consistentes de nomenclatura e estrutura.

## Pré-requisitos

- [ ] Análise completa executada (`../analysis/results.md` preenchido)
- [ ] Componentes com problemas de interface identificados
- [ ] Padrão de nomenclatura definido

## Tarefas de Implementação

### 1. Aplicar Padrão de Nomenclatura

Para cada componente identificado na análise, aplicar o padrão:

```typescript
// ❌ ANTES: Nomenclatura inconsistente
interface Props { ... }
interface SidebarProperties { ... }
interface ISidebarProps { ... }
type SidebarProps = { ... }

// ✅ DEPOIS: Padrão consistente ComponentNameProps
interface SidebarProps {
  isCollapsed?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

### 2. Estrutura Padrão para Props Complexas

**Para componentes de formulário:**

```typescript
interface ApplicationFormProps {
  /**
   * Application data for editing (undefined for create mode)
   */
  application?: Application;

  /**
   * Callback fired when form is submitted
   */
  onSubmit: (data: CreateApplicationDto | UpdateApplicationDto) => Promise<void>;

  /**
   * Callback fired when form is cancelled
   */
  onCancel: () => void;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Para componentes de lista/tabela:**

```typescript
interface ApplicationListProps {
  /**
   * List of applications to display
   */
  applications: Application[];

  /**
   * Whether data is currently loading
   */
  isLoading?: boolean;

  /**
   * Callback fired when an application is selected
   */
  onSelect?: (application: Application) => void;

  /**
   * Callback fired when an application should be deleted
   */
  onDelete?: (applicationId: string) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}
```

### 3. Migrar Props Inline para Interfaces Nomeadas

```typescript
// ❌ ANTES: Props inline
const Button: React.FC<{
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ variant = 'primary', size = 'md', onClick, children }) => {
  // implementação
};

// ✅ DEPOIS: Interface nomeada
interface ButtonProps {
  /**
   * Visual variant of the button
   */
  variant?: 'primary' | 'secondary';

  /**
   * Size of the button
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
  className,
}) => {
  // implementação
};
```

### 4. Aplicar Documentação JSDoc

Para props complexas, adicionar documentação:

```typescript
interface EnvironmentFormProps {
  /**
   * Environment data for editing. If undefined, form operates in create mode.
   */
  environment?: Environment;

  /**
   * Callback fired when form is submitted successfully.
   * Receives validated form data based on current mode (create/update).
   */
  onSubmit: (data: CreateEnvironmentDto | UpdateEnvironmentDto) => Promise<void>;

  /**
   * Callback fired when user cancels the form.
   * Should typically close modal/navigate away.
   */
  onCancel: () => void;

  /**
   * Whether the form is currently submitting.
   * When true, form should be disabled and show loading state.
   */
  isSubmitting?: boolean;
}
```

### 5. Padronizar Props Comuns

**Props que devem estar em todos os componentes:**

```typescript
interface BaseComponentProps {
  /**
   * Additional CSS classes to apply
   */
  className?: string;

  /**
   * Inline styles (use sparingly)
   */
  style?: React.CSSProperties;

  /**
   * Data attributes for testing
   */
  'data-testid'?: string;
}

// Usar extends para reutilizar
interface SidebarProps extends BaseComponentProps {
  isCollapsed?: boolean;
  // props específicas...
}
```

## Checklist de Implementação

- [ ] Todas as interfaces seguem padrão `ComponentNameProps`
- [ ] Props inline migradas para interfaces nomeadas
- [ ] Documentação JSDoc aplicada em props complexas
- [ ] Props comuns padronizadas (className, style, data-testid)
- [ ] Tipos específicos aplicados (ao invés de any/unknown)
- [ ] Imports de types atualizados conforme necessário

## Validação Rápida

```bash
# Verificar se ainda há props inconsistentes
grep -r "interface.*Properties\|interface.*IProps\|interface Props" src/components/ --include="*.tsx"

# Verificar se ainda há props inline complexas
grep -r "React.FC<{.*}>" src/components/ --include="*.tsx"

# Testar build
npm run build
npm run type-check
```

## Próximo Passo

Após implementação, execute `../validation/prompt.md` para validação final.
