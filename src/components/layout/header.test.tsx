import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { usePATModal } from '@/contexts/pat-modal-context';

import { Header } from './header';

// Mock para o hook useTheme do next-themes
const mockSetTheme = vi.fn();
let mockTheme = 'light';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

// Mock para o hook usePATModal
vi.mock('@/contexts/pat-modal-context', () => ({
  usePATModal: vi.fn(),
}));

// Mock para os componentes de UI que podem ser complexos
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className, ...props }: any) => (
    <div data-testid="mocked-avatar" className={className} {...props}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} data-testid="mocked-avatar-image" {...props} />
  ),
  AvatarFallback: ({ children, ...props }: any) => (
    <div data-testid="mocked-avatar-fallback" {...props}>
      {children}
    </div>
  ),
}));

// Mock para o dropdown menu - ajustando para manipular o atributo asChild corretamente
vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }: any) => <div data-testid="mocked-dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children, asChild, ...props }: any) => {
      // Se asChild for true, retorna o children (que é o Button), caso contrário retorna um wrapper
      return asChild ? (
        children
      ) : (
        <div data-testid="mocked-dropdown-trigger" {...props}>
          {children}
        </div>
      );
    },
    DropdownMenuContent: ({ children, ...props }: any) => (
      <div data-testid="mocked-dropdown-content" {...props}>
        {children}
      </div>
    ),
    DropdownMenuItem: ({ children, ...props }: any) => (
      <div data-testid="mocked-dropdown-item" {...props}>
        {children}
      </div>
    ),
    DropdownMenuLabel: ({ children, ...props }: any) => (
      <div data-testid="mocked-dropdown-label" {...props}>
        {children}
      </div>
    ),
    DropdownMenuSeparator: () => <hr data-testid="mocked-dropdown-separator" />,
  };
});

describe('Header Component', () => {
  const mockOnMenuClick = vi.fn();
  const mockPATModalOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
    mockSetTheme.mockClear();

    // Set up the pat modal context mock
    (usePATModal as jest.Mock).mockReturnValue({
      open: mockPATModalOpen,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component correctly', () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    // Verifica se o container principal está presente
    expect(screen.getByTestId('header-container')).toBeInTheDocument();

    // Verifica se o botão de menu mobile está presente
    expect(screen.getByTestId('header-menu-button')).toBeInTheDocument();

    // Verifica se o logo mobile está presente
    expect(screen.getByTestId('header-logo-mobile')).toBeInTheDocument();

    // Verifica se o formulário de busca está presente
    expect(screen.getByTestId('header-search-form')).toBeInTheDocument();
    expect(screen.getByTestId('header-search-input')).toBeInTheDocument();

    // Verifica se o botão de notificações está presente
    expect(screen.getByTestId('header-notifications-button')).toBeInTheDocument();
    expect(screen.getByTestId('header-notifications-badge')).toBeInTheDocument();
    expect(screen.getByTestId('header-notifications-badge')).toHaveTextContent('3');

    // Verifica se o botão de toggle de tema está presente
    expect(screen.getByTestId('header-theme-toggle')).toBeInTheDocument();

    // Verifica se o botão do menu de usuário está presente
    expect(screen.getByTestId('header-user-menu-button')).toBeInTheDocument();
  });

  it('should call onMenuClick when menu button is clicked', () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    const menuButton = screen.getByTestId('header-menu-button');

    fireEvent.click(menuButton);

    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should toggle theme when theme button is clicked', () => {
    // Teste com tema light
    mockTheme = 'light';

    render(<Header onMenuClick={mockOnMenuClick} />);

    const themeButton = screen.getByTestId('header-theme-toggle');

    fireEvent.click(themeButton);

    // Verifica se o setTheme foi chamado com 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    // Limpa o componente renderizado
    cleanup();
    mockSetTheme.mockClear();

    // Muda o tema para 'dark' e testa novamente
    mockTheme = 'dark';

    render(<Header onMenuClick={mockOnMenuClick} />);

    const updatedThemeButton = screen.getByTestId('header-theme-toggle');

    fireEvent.click(updatedThemeButton);

    // Verifica se o setTheme foi chamado com 'light'
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should display notifications correctly', () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    // Verifica o contador de notificações
    const badge = screen.getByTestId('header-notifications-badge');

    expect(badge).toHaveTextContent('3');

    // Verifica os elementos do dropdown de notificações
    expect(screen.getByTestId('header-notifications-dropdown')).toBeInTheDocument();

    // Verificamos o título/label do dropdown de notificações
    const labels = screen.getAllByTestId('mocked-dropdown-label');
    const notificationLabel = labels.find((label) => label.textContent?.includes('Notifications'));

    expect(notificationLabel).toBeDefined();

    // Verificamos a lista de notificações
    expect(screen.getByTestId('header-notifications-list')).toBeInTheDocument();
    expect(screen.getByTestId('header-notification-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('header-notification-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('header-notification-item-3')).toBeInTheDocument();
  });

  it('should display user menu correctly', () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    // Verificamos se os elementos do dropdown do usuário estão presentes
    expect(screen.getByTestId('header-user-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('header-user-name')).toBeInTheDocument();
    expect(screen.getByTestId('header-user-email')).toBeInTheDocument();
    expect(screen.getByTestId('header-profile-option')).toBeInTheDocument();
    expect(screen.getByTestId('header-logout-option')).toBeInTheDocument();
  });

  it('should render with different theme states', () => {
    // Teste com tema light
    mockTheme = 'light';
    render(<Header onMenuClick={mockOnMenuClick} />);
    expect(screen.getByTestId('header-theme-toggle')).toBeInTheDocument();

    // Limpa o componente
    cleanup();

    // Teste com tema dark
    mockTheme = 'dark';
    render(<Header onMenuClick={mockOnMenuClick} />);
    expect(screen.getByTestId('header-theme-toggle')).toBeInTheDocument();
  });

  it('opens user menu and shows PAT option', async () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    const user = userEvent.setup();
    const userMenuButton = screen.getByTestId('header-user-menu-button');

    // Open the user dropdown
    await user.click(userMenuButton);

    // Check if PAT option is shown
    const patOption = screen.getByTestId('header-pat-option');

    expect(patOption).toBeInTheDocument();
    expect(patOption).toHaveTextContent('Token de Acesso');
  });

  it('opens PAT modal when PAT option is clicked', async () => {
    render(<Header onMenuClick={mockOnMenuClick} />);

    const user = userEvent.setup();
    const userMenuButton = screen.getByTestId('header-user-menu-button');

    // Open the user dropdown
    await user.click(userMenuButton);

    // Click the PAT option
    const patOption = screen.getByTestId('header-pat-option');

    await user.click(patOption);

    // Check if the PAT modal open function was called
    expect(mockPATModalOpen).toHaveBeenCalledTimes(1);
  });
});
