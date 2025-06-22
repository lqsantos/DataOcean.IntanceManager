# Phase 05: State & i18n Architecture

## Objetivo

Implementar uma arquitetura robusta de estado global com Zustand e sistema de internacionalização completo, garantindo escalabilidade e manutenibilidade.

## Análise da Situação Atual

### 1. O Copilot Agent irá automaticamente:

- Verificar gerenciamento de estado atual (Context API, Redux, etc.)
- Analisar sistema de i18n existente (react-i18next, next-i18next)
- Identificar padrões de estado local vs global
- Avaliar necessidades de persistência de estado

### 2. Gaps Típicos Esperados

- [ ] **Estado global**: Sem gerenciamento centralizado
- [ ] **State persistence**: Sem persistência de estado
- [ ] **Estado por feature**: Não organizado por domínio
- [ ] **i18n**: Sistema incompleto ou inexistente
- [ ] **Type safety**: i18n sem type safety

## Implementação

### Step 1: Setup Zustand

```bash
# Instalar dependências
npm install zustand immer
npm install --save-dev @types/node
```

### Step 2: Base Store Architecture

```typescript
// src/lib/store/types.ts
import type { StateCreator } from 'zustand';

// Base store interface
export interface BaseSliceState {
  loading: boolean;
  error: string | null;
}

export interface BaseSliceActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type BaseSlice = BaseSliceState & BaseSliceActions;

// Store creator type with immer
export type StateCreatorWithImmer<T> = StateCreator<T, [['zustand/immer', never]], [], T>;
```

```typescript
// src/lib/store/middleware.ts
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

// Custom middleware para desenvolvimento
export const withDevtools = (name: string) =>
  process.env.NODE_ENV === 'development'
    ? import('zustand/middleware').then(({ devtools }) => devtools(undefined, { name }))
    : (fn: any) => fn;

// Middleware para persistência
export const withPersistence = <T>(key: string, partialize?: (state: T) => Partial<T>) =>
  persist<T>((set, get, api) => api, {
    name: key,
    storage: createJSONStorage(() => localStorage),
    partialize,
  });

// Combine middlewares
export const withMiddleware = <T>(name: string, persist?: string) => {
  const middlewares = [immer, subscribeWithSelector];

  if (persist) {
    middlewares.push(withPersistence(persist));
  }

  if (process.env.NODE_ENV === 'development') {
    // Dinamicamente adicionar devtools apenas em dev
  }

  return middlewares;
};
```

### Step 3: Applications Store Slice

```typescript
// src/features/applications/store/applications-slice.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import type { StateCreatorWithImmer, BaseSlice } from '@/lib/store/types';
import type { Application } from '../types';
import { applicationService } from '../services';

interface ApplicationsState extends BaseSliceState {
  applications: Application[];
  selectedApplication: Application | null;
  filters: {
    status?: string;
    environmentId?: string;
    locationId?: string;
    search?: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface ApplicationsActions extends BaseSliceActions {
  // Applications CRUD
  fetchApplications: () => Promise<void>;
  createApplication: (data: CreateApplicationRequest) => Promise<void>;
  updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;

  // Selection
  selectApplication: (application: Application | null) => void;

  // Filters
  setFilters: (filters: Partial<ApplicationsState['filters']>) => void;
  clearFilters: () => void;

  // Pagination
  setPagination: (pagination: Partial<ApplicationsState['pagination']>) => void;
}

type ApplicationsSlice = ApplicationsState & ApplicationsActions;

const initialState: ApplicationsState = {
  loading: false,
  error: null,
  applications: [],
  selectedApplication: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
};

const createApplicationsSlice: StateCreatorWithImmer<ApplicationsSlice> = (set, get) => ({
  ...initialState,

  // Base actions
  setLoading: (loading) =>
    set((state) => {
      state.loading = loading;
    }),
  setError: (error) =>
    set((state) => {
      state.error = error;
    }),
  reset: () => set(() => initialState),

  // Applications CRUD
  fetchApplications: async () => {
    const { filters, pagination } = get();

    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const response = await applicationService.getAll({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      set((state) => {
        state.applications = response.data;
        state.pagination.total = response.total;
        state.loading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to fetch applications';
        state.loading = false;
      });
    }
  },

  createApplication: async (data) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const newApplication = await applicationService.create(data);

      set((state) => {
        state.applications.unshift(newApplication);
        state.loading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to create application';
        state.loading = false;
      });
      throw error;
    }
  },

  updateApplication: async (id, data) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const updatedApplication = await applicationService.update(id, data);

      set((state) => {
        const index = state.applications.findIndex((app) => app.id === id);
        if (index !== -1) {
          state.applications[index] = updatedApplication;
        }

        if (state.selectedApplication?.id === id) {
          state.selectedApplication = updatedApplication;
        }

        state.loading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to update application';
        state.loading = false;
      });
      throw error;
    }
  },

  deleteApplication: async (id) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      await applicationService.delete(id);

      set((state) => {
        state.applications = state.applications.filter((app) => app.id !== id);

        if (state.selectedApplication?.id === id) {
          state.selectedApplication = null;
        }

        state.loading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to delete application';
        state.loading = false;
      });
      throw error;
    }
  },

  // Selection
  selectApplication: (application) =>
    set((state) => {
      state.selectedApplication = application;
    }),

  // Filters
  setFilters: (filters) =>
    set((state) => {
      state.filters = { ...state.filters, ...filters };
      state.pagination.page = 1; // Reset page when filtering
    }),

  clearFilters: () =>
    set((state) => {
      state.filters = {};
      state.pagination.page = 1;
    }),

  // Pagination
  setPagination: (pagination) =>
    set((state) => {
      state.pagination = { ...state.pagination, ...pagination };
    }),
});

export const useApplicationsStore = create<ApplicationsSlice>()(
  subscribeWithSelector(immer(createApplicationsSlice))
);

// Selectors
export const applicationSelectors = {
  applications: (state: ApplicationsSlice) => state.applications,
  selectedApplication: (state: ApplicationsSlice) => state.selectedApplication,
  loading: (state: ApplicationsSlice) => state.loading,
  error: (state: ApplicationsSlice) => state.error,
  filters: (state: ApplicationsSlice) => state.filters,
  pagination: (state: ApplicationsSlice) => state.pagination,

  // Derived selectors
  filteredApplications: (state: ApplicationsSlice) => {
    let filtered = state.applications;

    if (state.filters.status) {
      filtered = filtered.filter((app) => app.status === state.filters.status);
    }

    if (state.filters.environmentId) {
      filtered = filtered.filter((app) => app.environmentId === state.filters.environmentId);
    }

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(search) || app.description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  },
};

// Actions export for easier testing
export const applicationActions = {
  fetchApplications: () => useApplicationsStore.getState().fetchApplications(),
  createApplication: (data: CreateApplicationRequest) =>
    useApplicationsStore.getState().createApplication(data),
  updateApplication: (id: string, data: Partial<Application>) =>
    useApplicationsStore.getState().updateApplication(id, data),
  deleteApplication: (id: string) => useApplicationsStore.getState().deleteApplication(id),
};
```

### Step 4: Global Store

```typescript
// src/lib/store/global-store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { StateCreatorWithImmer } from './types';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface GlobalState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;

  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';

  // Application State
  currentLocation: string | null;
  currentEnvironment: string | null;

  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
}

interface GlobalActions {
  // Authentication
  setUser: (user: User | null) => void;
  logout: () => void;

  // UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: GlobalState['theme']) => void;

  // Application
  setCurrentLocation: (locationId: string | null) => void;
  setCurrentEnvironment: (environmentId: string | null) => void;

  // Notifications
  addNotification: (
    notification: Omit<GlobalState['notifications'][0], 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

type GlobalStore = GlobalState & GlobalActions;

const initialState: GlobalState = {
  user: null,
  isAuthenticated: false,
  sidebarOpen: true,
  theme: 'system',
  currentLocation: null,
  currentEnvironment: null,
  notifications: [],
};

const createGlobalStore: StateCreatorWithImmer<GlobalStore> = (set, get) => ({
  ...initialState,

  // Authentication
  setUser: (user) =>
    set((state) => {
      state.user = user;
      state.isAuthenticated = !!user;
    }),

  logout: () =>
    set((state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.currentLocation = null;
      state.currentEnvironment = null;
    }),

  // UI
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

  // Application
  setCurrentLocation: (locationId) =>
    set((state) => {
      state.currentLocation = locationId;
    }),

  setCurrentEnvironment: (environmentId) =>
    set((state) => {
      state.currentEnvironment = environmentId;
    }),

  // Notifications
  addNotification: (notification) =>
    set((state) => {
      const newNotification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      state.notifications.unshift(newNotification);

      // Limit to 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    }),

  removeNotification: (id) =>
    set((state) => {
      state.notifications = state.notifications.filter((n) => n.id !== id);
    }),

  clearNotifications: () =>
    set((state) => {
      state.notifications = [];
    }),
});

export const useGlobalStore = create<GlobalStore>()(
  persist(immer(createGlobalStore), {
    name: 'dataocean-global-store',
    partialize: (state) => ({
      theme: state.theme,
      sidebarOpen: state.sidebarOpen,
      currentLocation: state.currentLocation,
      currentEnvironment: state.currentEnvironment,
    }),
  })
);

// Selectors
export const globalSelectors = {
  user: (state: GlobalStore) => state.user,
  isAuthenticated: (state: GlobalStore) => state.isAuthenticated,
  sidebarOpen: (state: GlobalStore) => state.sidebarOpen,
  theme: (state: GlobalStore) => state.theme,
  currentLocation: (state: GlobalStore) => state.currentLocation,
  currentEnvironment: (state: GlobalStore) => state.currentEnvironment,
  notifications: (state: GlobalStore) => state.notifications,
  unreadNotifications: (state: GlobalStore) => state.notifications.filter((n) => !n.read),
};
```

### Step 5: Store Hooks

```typescript
// src/lib/store/hooks.ts
import { useCallback } from 'react';
import { useGlobalStore, globalSelectors } from './global-store';
import { useApplicationsStore, applicationSelectors } from '@/features/applications/store';

// Global store hooks
export const useAuth = () => {
  const user = useGlobalStore(globalSelectors.user);
  const isAuthenticated = useGlobalStore(globalSelectors.isAuthenticated);
  const setUser = useGlobalStore((state) => state.setUser);
  const logout = useGlobalStore((state) => state.logout);

  return {
    user,
    isAuthenticated,
    setUser,
    logout,
  };
};

export const useUI = () => {
  const sidebarOpen = useGlobalStore(globalSelectors.sidebarOpen);
  const theme = useGlobalStore(globalSelectors.theme);
  const toggleSidebar = useGlobalStore((state) => state.toggleSidebar);
  const setSidebarOpen = useGlobalStore((state) => state.setSidebarOpen);
  const setTheme = useGlobalStore((state) => state.setTheme);

  return {
    sidebarOpen,
    theme,
    toggleSidebar,
    setSidebarOpen,
    setTheme,
  };
};

export const useNotifications = () => {
  const notifications = useGlobalStore(globalSelectors.notifications);
  const addNotification = useGlobalStore((state) => state.addNotification);
  const removeNotification = useGlobalStore((state) => state.removeNotification);
  const clearNotifications = useGlobalStore((state) => state.clearNotifications);

  const showSuccess = useCallback(
    (title: string, message: string) => {
      addNotification({ type: 'success', title, message });
    },
    [addNotification]
  );

  const showError = useCallback(
    (title: string, message: string) => {
      addNotification({ type: 'error', title, message });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string) => {
      addNotification({ type: 'warning', title, message });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string) => {
      addNotification({ type: 'info', title, message });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Feature store hooks
export const useApplications = () => {
  const applications = useApplicationsStore(applicationSelectors.applications);
  const loading = useApplicationsStore(applicationSelectors.loading);
  const error = useApplicationsStore(applicationSelectors.error);
  const selectedApplication = useApplicationsStore(applicationSelectors.selectedApplication);
  const filters = useApplicationsStore(applicationSelectors.filters);
  const pagination = useApplicationsStore(applicationSelectors.pagination);

  const actions = useApplicationsStore((state) => ({
    fetchApplications: state.fetchApplications,
    createApplication: state.createApplication,
    updateApplication: state.updateApplication,
    deleteApplication: state.deleteApplication,
    selectApplication: state.selectApplication,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
    setPagination: state.setPagination,
  }));

  return {
    applications,
    loading,
    error,
    selectedApplication,
    filters,
    pagination,
    ...actions,
  };
};
```

### Step 6: Setup i18n

```bash
# Instalar react-i18next
npm install react-i18next i18next i18next-browser-languagedetector
npm install --save-dev @types/i18next
```

```typescript
// src/lib/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from '@/locales/en/common.json';
import pt from '@/locales/pt/common.json';
import es from '@/locales/es/common.json';

// Feature translations
import enApplications from '@/features/applications/locales/en.json';
import ptApplications from '@/features/applications/locales/pt.json';
import esApplications from '@/features/applications/locales/es.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: en,
    applications: enApplications,
  },
  pt: {
    common: pt,
    applications: ptApplications,
  },
  es: {
    common: es,
    applications: esApplications,
  },
} as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    defaultNS,
    ns: ['common', 'applications'],

    resources,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### Step 7: Translation Files

```json
// src/locales/en/common.json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "update": "Update",
      "search": "Search",
      "filter": "Filter",
      "clear": "Clear",
      "load_more": "Load More"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive",
      "pending": "Pending",
      "error": "Error"
    },
    "messages": {
      "loading": "Loading...",
      "no_data": "No data available",
      "error_generic": "An error occurred",
      "success_generic": "Operation completed successfully"
    },
    "navigation": {
      "dashboard": "Dashboard",
      "applications": "Applications",
      "environments": "Environments",
      "locations": "Locations",
      "settings": "Settings"
    }
  }
}
```

```json
// src/locales/pt/common.json
{
  "common": {
    "actions": {
      "save": "Salvar",
      "cancel": "Cancelar",
      "delete": "Excluir",
      "edit": "Editar",
      "create": "Criar",
      "update": "Atualizar",
      "search": "Pesquisar",
      "filter": "Filtrar",
      "clear": "Limpar",
      "load_more": "Carregar Mais"
    },
    "status": {
      "active": "Ativo",
      "inactive": "Inativo",
      "pending": "Pendente",
      "error": "Erro"
    },
    "messages": {
      "loading": "Carregando...",
      "no_data": "Nenhum dado disponível",
      "error_generic": "Ocorreu um erro",
      "success_generic": "Operação concluída com sucesso"
    },
    "navigation": {
      "dashboard": "Dashboard",
      "applications": "Aplicações",
      "environments": "Ambientes",
      "locations": "Localizações",
      "settings": "Configurações"
    }
  }
}
```

```json
// src/features/applications/locales/en.json
{
  "title": "Applications",
  "create_title": "Create Application",
  "edit_title": "Edit Application",
  "fields": {
    "name": "Name",
    "description": "Description",
    "status": "Status",
    "environment": "Environment",
    "location": "Location",
    "repository": "Repository",
    "branch": "Branch"
  },
  "placeholders": {
    "name": "Enter application name",
    "description": "Enter application description",
    "repository": "https://github.com/..."
  },
  "validation": {
    "name_required": "Application name is required",
    "environment_required": "Environment is required",
    "invalid_repository": "Invalid repository URL"
  },
  "messages": {
    "created_success": "Application created successfully",
    "updated_success": "Application updated successfully",
    "deleted_success": "Application deleted successfully",
    "deploy_success": "Application deployed successfully"
  }
}
```

### Step 8: i18n Hooks

```typescript
// src/lib/i18n/hooks.ts
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '../store/global-store';

// Base hook
export const useI18n = (namespace?: string) => {
  const { t, i18n } = useTranslation(namespace);

  return {
    t,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
    ready: i18n.isInitialized,
  };
};

// Common translations hook
export const useCommon = () => {
  const { t } = useTranslation('common');

  return {
    t,
    actions: {
      save: t('common.actions.save'),
      cancel: t('common.actions.cancel'),
      delete: t('common.actions.delete'),
      edit: t('common.actions.edit'),
      create: t('common.actions.create'),
      update: t('common.actions.update'),
    },
    status: {
      active: t('common.status.active'),
      inactive: t('common.status.inactive'),
      pending: t('common.status.pending'),
      error: t('common.status.error'),
    },
    messages: {
      loading: t('common.messages.loading'),
      noData: t('common.messages.no_data'),
      errorGeneric: t('common.messages.error_generic'),
      successGeneric: t('common.messages.success_generic'),
    },
  };
};

// Language switcher hook
export const useLanguage = () => {
  const { i18n } = useTranslation();
  const setLanguage = useGlobalStore((state) => state.setLanguage);

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    setLanguage(language);
  };

  return {
    currentLanguage: i18n.language,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Português' },
      { code: 'es', name: 'Español' },
    ],
    changeLanguage,
  };
};
```

### Step 9: Store Provider

```typescript
// src/lib/providers.tsx
'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'next-themes';
import i18n from './i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
```

### Step 10: Usage Examples

```typescript
// src/features/applications/components/application-list.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApplications } from '@/lib/store/hooks';
import { useNotifications } from '@/lib/store/hooks';

export function ApplicationList() {
  const { t } = useTranslation('applications');
  const {
    applications,
    loading,
    error,
    fetchApplications,
    deleteApplication
  } = useApplications();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
      showSuccess(
        t('messages.deleted_success'),
        t('messages.deleted_success')
      );
    } catch (error) {
      showError(
        t('common.messages.error_generic'),
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  if (loading) {
    return <div>{t('common.messages.loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1>{t('title')}</h1>
      {applications.length === 0 ? (
        <p>{t('common.messages.no_data')}</p>
      ) : (
        applications.map(app => (
          <div key={app.id} className="border p-4 rounded">
            <h3>{app.name}</h3>
            <p>{app.description}</p>
            <button
              onClick={() => handleDelete(app.id)}
              className="text-red-500"
            >
              {t('common.actions.delete')}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
```

## Checklist de Finalização

### Zustand Store

- [ ] Base store types definidos
- [ ] Middleware configurado (immer, persist, devtools)
- [ ] Global store implementado
- [ ] Feature stores criados
- [ ] Store hooks criados
- [ ] Selectors organizados

### Estado por Feature

- [ ] Applications store slice implementado
- [ ] Environments store slice implementado
- [ ] Locations store slice implementado
- [ ] Actions e selectors bem definidos
- [ ] Estado local vs global bem separado

### i18n System

- [ ] react-i18next configurado
- [ ] Namespaces por feature
- [ ] Translation files criados (en, pt, es)
- [ ] Type safety implementado
- [ ] i18n hooks criados
- [ ] Language switcher funcionando

### Integration

- [ ] Providers configurados
- [ ] Store persistence funcionando
- [ ] i18n detection funcionando
- [ ] Theme integration funcionando
- [ ] Error handling implementado

### Performance

- [ ] Store subscriptions otimizadas
- [ ] Selectors performáticos
- [ ] Translation loading otimizado
- [ ] Re-renders minimizados
- [ ] Memory leaks prevenidos

### Funcionalidade

- [ ] `npm run type-check` - Types válidos
- [ ] `npm run build` - Build successful
- [ ] Store persiste entre reloads
- [ ] Translations funcionam
- [ ] Language switching funciona
- [ ] Notifications funcionam

## Próximo Passo

→ **Phase 06: Standards Finalization**
