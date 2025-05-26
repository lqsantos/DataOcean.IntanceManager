import { fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { vi } from 'vitest';

import { ThemeToggle } from '../theme-toggle';

// Mock completo para o DropdownMenu do Radix UI
vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }) => <div>{children}</div>,
    DropdownMenuContent: ({ children, ...props }) => (
      <div data-testid="theme-toggle-menu" {...props}>
        {children}
      </div>
    ),
    DropdownMenuItem: ({ children, onClick, ...props }) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  };
});

// Mock do hook useTheme
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    setTheme: vi.fn(),
  })),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as jest.Mock).mockImplementation(() => ({
      setTheme: mockSetTheme,
    }));
  });

  it('should render the theme toggle button', () => {
    render(<ThemeToggle />);

    const toggleButton = screen.getByTestId('theme-toggle-button');

    expect(toggleButton).toBeInTheDocument();
  });

  it('should display theme menu', () => {
    render(<ThemeToggle />);

    // Como estamos mockando o componente DropdownMenu, o menu estará sempre visível nos testes
    expect(screen.getByTestId('theme-toggle-menu')).toBeInTheDocument();
  });

  it('should call setTheme with "light" when light option is clicked', () => {
    render(<ThemeToggle />);

    const lightOption = screen.getByTestId('theme-toggle-light');

    fireEvent.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with "dark" when dark option is clicked', () => {
    render(<ThemeToggle />);

    const darkOption = screen.getByTestId('theme-toggle-dark');

    fireEvent.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "system" when system option is clicked', () => {
    render(<ThemeToggle />);

    const systemOption = screen.getByTestId('theme-toggle-system');

    fireEvent.click(systemOption);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('should contain all theme options in the dropdown', () => {
    render(<ThemeToggle />);

    expect(screen.getByTestId('theme-toggle-light')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();

    expect(screen.getByTestId('theme-toggle-dark')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();

    expect(screen.getByTestId('theme-toggle-system')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });
});
