// src/tests/test-utils.tsx
import '@testing-library/jest-dom';
import {
  render as rtlRender,
  screen as rtlScreen,
  waitFor as rtlWaitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'i18next';
import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { vi } from 'vitest';

import { ThemeProvider } from '@/components/theme-provider';

// Initialize i18n for tests
i18n.use(initReactI18next).init({
  resources: {
    en: {
      settings: {
        title: 'Settings',
        description: 'Manage your application settings',
        tabs: {
          applications: 'Applications',
          environments: 'Environments',
          locations: 'Locations',
        },
        applications: {
          title: 'Application',
          table: {
            title: 'Applications',
            columns: {
              name: 'Name',
              description: 'Description',
            },
            searchPlaceholder: 'Search applications...',
            emptyMessage: 'No applications found',
            emptySearchMessage: 'No applications match your search',
          },
          description: 'Manage your applications',
          modal: {
            create: {
              title: 'Create Application',
            },
            edit: {
              title: 'Edit Application',
            },
          },
        },
        environments: {
          title: 'Environment',
          table: {
            title: 'Environments',
            columns: {
              name: 'Name',
              description: 'Description',
            },
            searchPlaceholder: 'Search environments...',
            emptyMessage: 'No environments found',
            emptySearchMessage: 'No environments match your search',
          },
          description: 'Manage your environments',
          modal: {
            create: {
              title: 'Create Environment',
            },
            edit: {
              title: 'Edit Environment',
            },
          },
        },
        locations: {
          title: 'Location',
          table: {
            title: 'Locations',
            columns: {
              name: 'Name',
            },
            searchPlaceholder: 'Search locations...',
            emptyMessage: 'No locations found',
            emptySearchMessage: 'No locations match your search',
          },
          description: 'Manage your locations',
          modal: {
            create: {
              title: 'Create Location',
            },
            edit: {
              title: 'Edit Location',
            },
          },
        },
      },
      entityTable: {
        searchPlaceholder: 'Search...',
        emptyMessage: 'No items found',
        emptySearchMessage: 'No items match your search',
        actions: {
          view: 'View actions',
          edit: 'Edit',
          delete: 'Delete',
        },
      },
      common: {
        buttons: {
          add: 'Add',
          refresh: 'Refresh',
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
        },
        validation: {
          required: 'This field is required',
          invalidSlug: 'Slug can only contain lowercase letters, numbers, and hyphens',
        },
        messages: {
          requiredField: 'This field is required',
        },
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Mock for window.matchMedia
if (typeof window !== 'undefined') {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
      };
    };
}

// Since the react-responsive module is imported directly in files instead of using our mock,
// we need to provide it as a global mock
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn().mockReturnValue(true), // Default to desktop view
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Mock Lucide icons - expanded with all icons used in the app
vi.mock('lucide-react', () => {
  return {
    AlertCircle: () => <span data-testid="alert-icon" />,
    AppWindow: () => <span data-testid="app-window-icon" />,
    ArrowUpDown: () => <span data-testid="arrow-up-down-icon" />,
    Bell: () => <span data-testid="bell-icon" />,
    Check: () => <span data-testid="check-icon" />,
    CheckCircle2: () => <span data-testid="checkcircle-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    ChevronRight: () => <span data-testid="chevron-right-icon" />,
    ChevronUp: () => <span data-testid="chevron-up-icon" />,
    Copy: () => <span data-testid="copy-icon" />,
    Database: ({ className }) => <span data-testid="icon-database" className={className} />,
    Edit: ({ className }) => <span data-testid="icon-edit" className={className} />,
    Eye: () => <span data-testid="eye-icon" />,
    EyeOff: () => <span data-testid="eye-off-icon" />,
    Git: () => <span data-testid="git-icon" />,
    GitBranch: ({ className }) => <span data-testid="icon-git-branch" className={className} />,
    GitBranchPlus: () => <span data-testid="gitbranchplus-icon" />,
    Github: () => <span data-testid="github-icon" />,
    Gitlab: () => <span data-testid="gitlab-icon" />,
    Globe: () => <span data-testid="globe-icon" />,
    Key: () => <span data-testid="key-icon" />,
    Loader2: ({ className }) => <span data-testid="loader" className={className} />,
    LogOut: () => <span data-testid="logout-icon" />,
    MapPin: () => <span data-testid="map-pin-icon" />,
    Menu: () => <span data-testid="menu-icon" />,
    Moon: () => <span data-testid="moon-icon" />,
    MoreHorizontal: () => <span data-testid="more-horizontal-icon" />,
    MoreVertical: () => <span data-testid="more-vertical-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    PlusCircle: () => <span data-testid="plus-circle-icon" />,
    RefreshCw: () => <span data-testid="refresh-icon" />,
    Search: () => <span data-testid="search-icon" />,
    Server: () => <span data-testid="server-icon" />,
    Settings: () => <span data-testid="settings-icon" />,
    Sun: () => <span data-testid="sun-icon" />,
    Trash2: ({ className }) => <span data-testid="icon-trash" className={className} />,
    User: () => <span data-testid="user-icon" />,
    XCircle: () => <span data-testid="xcircle-icon" />,
    XIcon: () => <span data-testid="x-icon" />,
  };
});

// Clipboard API mock
if (typeof navigator === 'undefined') {
  global.navigator = {} as any;
}

if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    configurable: true,
  });
}

// Mock date functions to avoid "Invalid time value" errors
vi.mock('date-fns', () => ({
  format: vi.fn().mockImplementation(() => '2023-01-01'),
  formatDistanceToNow: vi.fn().mockReturnValue('1 day ago'),
  parseISO: vi.fn().mockImplementation((date) => new Date(date || '2023-01-01')),
}));

// Create a mock ModalManagerContext for our tests
const createMockModalManagerContext = () => {
  // Mock functions
  const mockOpenModal = vi.fn();
  const mockCloseModal = vi.fn();
  const mockOpenEditModal = vi.fn();
  const mockSetPatCallback = vi.fn();

  // Mock state
  const mockModalState = {
    pat: { isOpen: false },
    environment: { isOpen: false, editItem: null },
    application: { isOpen: false, editItem: null },
    cluster: { isOpen: false, editItem: null },
    location: { isOpen: false, editItem: null },
    gitSource: { isOpen: false, editItem: null },
    template: { isOpen: false },
  };

  return {
    modals: mockModalState,
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
    openEditModal: mockOpenEditModal,
    setPatCallback: mockSetPatCallback,
  };
};

// Mock the modal manager context module
vi.mock('@/contexts/modal-manager-context', () => {
  const mockContext = createMockModalManagerContext();

  return {
    useApplicationModal: vi.fn(() => ({
      isOpen: false,
      entityToEdit: null,
      openModal: vi.fn(),
      openEditModal: vi.fn(),
      closeModal: vi.fn(),
    })),
    useEnvironmentModal: vi.fn(() => ({
      isOpen: false,
      entityToEdit: null,
      openModal: vi.fn(),
      openEditModal: vi.fn(),
      closeModal: vi.fn(),
    })),
    useLocationModal: vi.fn(() => ({
      isOpen: false,
      entityToEdit: null,
      openModal: vi.fn(),
      openEditModal: vi.fn(),
      closeModal: vi.fn(),
    })),
    useModalManager: vi.fn(() => mockContext),
  };
});

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock UI components that could cause issues in tests
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }) => <div>{children}</div>,
}));

// Mock module resolution for common components
vi.mock('@/components/entities/generic-entity-page', () => ({
  GenericEntityPage: vi.fn(({ entities, EntityTable, testIdPrefix }) => (
    <div data-testid={`${testIdPrefix}-page`}>
      <EntityTable entities={entities} />
      <div data-testid={`${testIdPrefix}-add-button`}>Add Button</div>
      <div data-testid={`${testIdPrefix}-refresh-button`}>Refresh Button</div>
      <div data-testid={`${testIdPrefix}-page-error-alert`}>{entities.error || null}</div>
    </div>
  )),
}));

// Create a proper ModalManagerContext for the TestWrapper
const MockModalManagerContext = React.createContext(createMockModalManagerContext());

// TestWrapper component that provides necessary context providers
export const TestWrapper = ({ children }) => {
  return (
    <MockModalManagerContext.Provider value={createMockModalManagerContext()}>
      {children}
    </MockModalManagerContext.Provider>
  );
};

// Provider for wrapping components in tests
const AllTheProviders = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <TestWrapper>{children}</TestWrapper>
      </ThemeProvider>
    </I18nextProvider>
  );
};

// Create properly initialized test screen object
const screen = {
  ...rtlScreen,
  getByTestId: (...args) => rtlScreen.getByTestId(...args),
  getByText: (...args) => rtlScreen.getByText(...args),
  getByLabelText: (...args) => rtlScreen.getByLabelText(...args),
  getByRole: (...args) => rtlScreen.getByRole(...args),
  queryByTestId: (...args) => rtlScreen.queryByTestId(...args),
  findByText: (...args) => rtlScreen.findByText(...args),
  getAllByTestId: (...args) => rtlScreen.getAllByTestId(...args),
  debug: rtlScreen.debug,
};

// Initialize userEvent properly
const user = userEvent.setup();

// Custom render function that includes providers
export function render(ui, options = {}) {
  return rtlRender(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
}

// Helper function to wait for data to load
const waitFor = rtlWaitFor;

export { screen, user, userEvent, waitFor };
