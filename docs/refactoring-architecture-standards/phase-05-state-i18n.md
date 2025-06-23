# Phase 05: Global State Architecture

**Objetivo**: Implementar Zustand store global e otimizar state management seguindo architecture-standards.md.

**Dependência**: Phase 04 (Features Architecture) completa.

**Status i18n**: ✅ Sistema i18n JÁ COMPLETO e type-safe - não recriar!

## Context & Pre-Conditions

> **📋 Contexto**: Consulte [project-architecture-context.md](../project-architecture-context.md) para convenções.

**Validar antes de executar**:

- [ ] Phase 04: Features Architecture completa
- [ ] `src/features/` com 6 features funcionais

## Implementation Target

**FOCO**: Adicionar apenas Zustand store global + otimizar contexts existentes.

**NÃO RECRIAR**: i18n já está implementado e funcional!

### Step 1: Install Dependencies

```bash
# APENAS instalar Zustand (i18n já está completo)
pnpm add zustand immer
```

### Step 2: Create Global Store

Criar `src/lib/store/app-store.ts`:

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;

  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';

  // Context
  currentLocation: string | null;
  currentEnvironment: string | null;
}

interface AppActions {
  setUser: (user: User | null) => void;
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: AppState['theme']) => void;
  setCurrentLocation: (locationId: string | null) => void;
  setCurrentEnvironment: (environmentId: string | null) => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      sidebarOpen: true,
      theme: 'system',
      currentLocation: null,
      currentEnvironment: null,

      // Actions
      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
        }),
      logout: () =>
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
        }),
      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open;
        }),
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
        }),
      setCurrentLocation: (locationId) =>
        set((state) => {
          state.currentLocation = locationId;
        }),
      setCurrentEnvironment: (environmentId) =>
        set((state) => {
          state.currentEnvironment = environmentId;
        }),
    })),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        currentLocation: state.currentLocation,
        currentEnvironment: state.currentEnvironment,
      }),
    }
  )
);
```

### Step 3: Migrate Feature Contexts

Mover contexts específicos para suas features:

```bash
# Feature-specific contexts → features/[domain]/contexts/
mv src/contexts/create-template-modal-context.tsx src/features/templates/contexts/
mv src/contexts/create-environment-modal-context.tsx src/features/environments/contexts/
mv src/contexts/create-blueprint-context.tsx src/features/blueprints/contexts/
mv src/contexts/blueprint-form-context.tsx src/features/blueprints/contexts/
mv src/contexts/template-validation-context.tsx src/features/templates/contexts/

# Global contexts permanecem em src/contexts/
# - modal-manager-context.tsx (modal global)
# - font-scale-context.tsx (UI global)
```

Atualizar exports em cada `src/features/[domain]/index.ts`:

```typescript
export * from './contexts';
```

### Step 4: Update Imports

Atualizar imports nos componentes que usam os contexts migrados:

```typescript
// Antes
import { useCreateTemplateModal } from '@/contexts/create-template-modal-context';

// Depois
import { useCreateTemplateModal } from '@/features/templates';
```

## Validation

### Checklist

- [ ] **Zustand store**: `src/lib/store/app-store.ts` criado e funcional
- [ ] **Dependencies**: `zustand` e `immer` instalados
- [ ] **Contexts migrated**: Feature contexts movidos para `src/features/[domain]/contexts/`
- [ ] **Exports updated**: Cada feature exporta seus contexts
- [ ] **Imports fixed**: Todos os imports atualizados
- [ ] **No TypeScript errors**: Build sem erros
- [ ] **Store persistence**: Estado global persiste entre reloads

### Testing

```bash
# Validar build
pnpm build

# Executar testes
pnpm test

# Verificar translations (i18n já funcional)
pnpm run check-translations
```

### Commit

```bash
git add .
git commit -m "feat: implement global state with Zustand and optimize state architecture

- Add Zustand global store with persistence
- Migrate feature contexts to features architecture
- Maintain existing i18n system (already complete)
- Align with architecture-standards.md"
```

## Expected State Hierarchy

```typescript
// 1. Component State (local)
const [isOpen, setIsOpen] = useState(false);

// 2. Feature Context (shared within feature)
const { selectedApplication } = useApplicationsContext();

// 3. Global State (app-wide) - NOVO
const { user, theme, sidebarOpen } = useAppStore();

// 4. Server State (React Query) - mantido
const { data: applications } = useSWR('/api/applications');
```

**Próximo**: Phase 06 - Performance & Optimization
