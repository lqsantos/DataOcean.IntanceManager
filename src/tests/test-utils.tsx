// src/tests/test-utils.tsx
import type { RenderOptions } from '@testing-library/react';
import { render as reactRender } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import React from 'react';
import { vi } from 'vitest';

// Mock for window.matchMedia
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() { return true; },
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
}));

// Mock Lucide icons - expanded with all icons used in the app
vi.mock('lucide-react', () => {
  return {
    AlertCircle: () => <span data-testid="alert-icon" />,
    AppWindow: () => <span data-testid="app-window-icon" />,
    Bell: () => <span data-testid="bell-icon" />,
    Check: () => <span data-testid="check-icon" />,
    CheckCircle2: () => <span data-testid="checkcircle-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    ChevronRight: () => <span data-testid="chevron-right-icon" />,
    Copy: () => <span data-testid="copy-icon" />,
    Database: ({ className }: any) => <span data-testid="icon-database" className={className} />,
    Edit: ({ className }: any) => <span data-testid="icon-edit" className={className} />,
    Eye: () => <span data-testid="eye-icon" />,
    EyeOff: () => <span data-testid="eye-off-icon" />,
    Git: () => <span data-testid="git-icon" />,
    GitBranch: ({ className }: any) => <span data-testid="icon-git-branch" className={className} />,
    GitBranchPlus: () => <span data-testid="gitbranchplus-icon" />,
    Github: () => <span data-testid="github-icon" />,
    Gitlab: () => <span data-testid="gitlab-icon" />,
    Globe: () => <span data-testid="globe-icon" />,
    Key: () => <span data-testid="key-icon" />,
    Loader2: ({ className }: any) => <span data-testid="loader" className={className} />,
    LogOut: () => <span data-testid="logout-icon" />,
    MapPin: () => <span data-testid="map-pin-icon" />,
    Menu: () => <span data-testid="menu-icon" />,
    Moon: () => <span data-testid="moon-icon" />,
    MoreVertical: () => <span data-testid="more-vertical-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    PlusCircle: () => <span data-testid="plus-circle-icon" />,
    RefreshCw: () => <span data-testid="refresh-icon" />,
    Search: () => <span data-testid="search-icon" />,
    Server: () => <span data-testid="server-icon" />,
    Settings: () => <span data-testid="settings-icon" />,
    Sun: () => <span data-testid="sun-icon" />,
    Trash2: ({ className }: any) => <span data-testid="icon-trash" className={className} />,
    User: () => <span data-testid="user-icon" />,
    XCircle: () => <span data-testid="xcircle-icon" />,
    XIcon: () => <span data-testid="x-icon" />,
  };
});

// Clipboard API mock - fixed to avoid property redefinition
if (typeof navigator === 'undefined') {
  // Define global navigator object if it's not defined
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
    setPatCallback: mockSetPatCallback
  };
};

// Mock the modal manager context module
vi.mock('@/contexts/modal-manager-context', () => {
  const mockContext = createMockModalManagerContext();
  const mockPatModalOpen = vi.fn();
  
  return {
    ModalManagerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ModalManagerContext: {
      Provider: ({ children, value }: { children: React.ReactNode, value?: any }) => <>{children}</>,
      Consumer: ({ children }: { children: (context: any) => React.ReactNode }) => children(mockContext),
      displayName: 'ModalManagerContext',
    },
    useModalManager: () => mockContext,
    usePATModal: () => ({
      open: mockPatModalOpen,
      openModal: mockPatModalOpen,
      isOpen: false,
      status: {
        configured: true,
        lastUpdated: '2023-06-15T10:30:00Z',
      },
    }),
    useEnvironmentModal: () => ({
      isOpen: false,
      environmentToEdit: null,
      openModal: mockContext.openModal,
      openEditModal: mockContext.openEditModal,
      closeModal: mockContext.closeModal,
    }),
    useLocationModal: () => ({
      isOpen: false,
      locationToEdit: null,
      openModal: mockContext.openModal,
      openEditModal: mockContext.openEditModal,
      closeModal: mockContext.closeModal,
    }),
    useApplicationModal: () => ({
      isOpen: false,
      applicationToEdit: null,
      openModal: mockContext.openModal,
      openEditModal: mockContext.openEditModal,
      closeModal: mockContext.closeModal,
    }),
    useClusterModal: () => ({
      isOpen: false,
      clusterToEdit: null,
      openModal: mockContext.openModal,
      openEditModal: mockContext.openEditModal,
      closeModal: mockContext.closeModal,
    }),
    useGitSourceModal: () => ({
      isOpen: false,
      gitSourceToEdit: null,
      openModal: mockContext.openModal,
      openEditModal: mockContext.openEditModal,
      closeModal: mockContext.closeModal,
    }),
    useTemplateModal: () => ({
      isOpen: false,
      openModal: mockContext.openModal,
      closeModal: mockContext.closeModal,
    }),
    CreateEnvironmentModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useCreateEnvironmentModal: () => ({
      isOpen: false,
      openModal: mockContext.openModal,
      closeModal: mockContext.closeModal,
    }),
    CreateTemplateModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useCreateTemplateModal: () => ({
      isOpen: false,
      openModal: mockContext.openModal,
      closeModal: mockContext.closeModal,
    }),
    PATModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Create a proper ModalManagerContext for the TestWrapper
const MockModalManagerContext = React.createContext<any>(createMockModalManagerContext());

// TestWrapper component that provides necessary context providers
export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const mockModalContext = createMockModalManagerContext();
  
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <MockModalManagerContext.Provider value={mockModalContext}>
        {children}
      </MockModalManagerContext.Provider>
    </ThemeProvider>
  );
};

// Custom render function that includes providers
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return reactRender(ui, { wrapper: TestWrapper, ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
