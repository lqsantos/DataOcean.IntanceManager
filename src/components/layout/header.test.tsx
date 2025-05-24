import { cleanup, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { render } from '@/tests/test-utils';

import { Header } from './header';

// Mock for next-themes useTheme hook
const mockSetTheme = vi.fn();
let mockTheme = 'light';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock for modal manager context
vi.mock('@/contexts/modal-manager-context', () => {
  const mockPATModalOpen = vi.fn();
  const mockOpenModal = vi.fn();
  const mockCloseModal = vi.fn();
  const mockOpenEditModal = vi.fn();
  const mockSetPatCallback = vi.fn();

  return {
    useModalManager: () => ({
      modals: {
        pat: { isOpen: false },
        environment: { isOpen: false, editItem: null },
        application: { isOpen: false, editItem: null },
        cluster: { isOpen: false, editItem: null },
        location: { isOpen: false, editItem: null },
        gitSource: { isOpen: false, editItem: null },
        template: { isOpen: false },
      },
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      openEditModal: mockOpenEditModal,
      setPatCallback: mockSetPatCallback,
    }),
    usePATModal: () => ({
      open: mockPATModalOpen,
      openModal: mockPATModalOpen,
      isOpen: false,
      status: {
        configured: true,
        lastUpdated: '2023-06-15T10:30:00Z',
      },
    }),
  };
});

// Mock for UserMenu component
vi.mock('./user-menu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));

// Mock for UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} data-testid={props['data-testid'] || 'button'} {...props}>
      {children}
    </button>
  ),
}));

describe('Header Component', () => {
  const mockOnMenuClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
  });

  afterEach(() => {
    cleanup();
  });

  it('should render correctly', () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    // Check basic elements
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    expect(screen.getByTestId('app-logo')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('pat-status-button')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('should call onMenuClick when menu button is clicked', () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    const menuButton = screen.getByTestId('menu-button');

    fireEvent.click(menuButton);

    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should toggle theme when theme button is clicked', () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    const themeButton = screen.getByTestId('theme-toggle');

    fireEvent.click(themeButton);

    // Should set theme to dark
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should render sun icon when theme is dark', () => {
    mockTheme = 'dark';

    render(<Header onMenuClick={mockOnMenuClick} />);

    // In dark mode, should show sun icon
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('should render moon icon when theme is light', () => {
    mockTheme = 'light';

    render(<Header onMenuClick={mockOnMenuClick} />);

    // In light mode, should show moon icon
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('should open PAT modal when PAT button is clicked', async () => {
    const { usePATModal } = require('@/contexts/modal-manager-context');
    const mockOpen = vi.fn();

    // Override the mock to provide a fresh function
    usePATModal.mockReturnValue({
      open: mockOpen,
      openModal: mockOpen,
      isOpen: false,
      status: {
        configured: true,
        lastUpdated: '2023-06-15T10:30:00Z',
      },
    });

    const user = userEvent.setup();

    render(<Header onMenuClick={mockOnMenuClick} />);

    const patButton = screen.getByTestId('pat-status-button');

    await user.click(patButton);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('should display PAT status correctly', () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    // PAT status is mocked as configured
    const patStatus = screen.getByTestId('pat-status');

    expect(patStatus).toHaveTextContent(/configurado/i);
  });
});
