import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { UserMenu } from './user-menu';

// Mock do next/link para evitar erros com o Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock para componente Avatar para facilitar os testes
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => (
    <div className={className} data-testid="avatar">
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="avatar-image" />,
  AvatarFallback: ({ children, className }: any) => (
    <div className={className} data-testid="avatar-fallback">
      {children}
    </div>
  ),
}));

// Mock mais completo para os componentes do Radix UI
vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children, ...props }: any) => (
      <div data-testid="user-menu-dropdown" {...props}>
        {children}
      </div>
    ),
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  };
});

describe('UserMenu', () => {
  it('should render correctly with user button', () => {
    render(<UserMenu />);

    // Verifica se o botão de menu do usuário está renderizado
    expect(screen.getByTestId('user-menu-button')).toBeInTheDocument();
  });

  it('should render avatar with default fallback', () => {
    render(<UserMenu />);

    // Verifica se o avatar está presente
    expect(screen.getByTestId('avatar')).toBeInTheDocument();

    // Verifica se o fallback do avatar está presente com as iniciais padrão
    const avatarFallback = screen.getByTestId('avatar-fallback');

    expect(avatarFallback).toBeInTheDocument();
    expect(avatarFallback).toHaveTextContent('US');
  });

  it('should show dropdown menu when clicked', () => {
    render(<UserMenu />);

    // Clica no botão do menu do usuário
    const userMenuButton = screen.getByTestId('user-menu-button');

    fireEvent.click(userMenuButton);

    // Verifica se o dropdown do menu foi renderizado
    expect(screen.getByTestId('user-menu-dropdown')).toBeInTheDocument();
  });

  it('should contain profile section in the dropdown', () => {
    render(<UserMenu />);

    // Clica no botão do menu do usuário
    const userMenuButton = screen.getByTestId('user-menu-button');

    fireEvent.click(userMenuButton);

    // Verifica se o nome do usuário está presente
    expect(screen.getByText('User')).toBeInTheDocument();

    // Verifica se o email do usuário está presente
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('should contain settings options in the dropdown', () => {
    render(<UserMenu />);

    // Clica no botão do menu do usuário
    const userMenuButton = screen.getByTestId('user-menu-button');

    fireEvent.click(userMenuButton);

    // Verifica se as opções de configuração estão presentes
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('should contain logout option in the dropdown', () => {
    render(<UserMenu />);

    // Clica no botão do menu do usuário
    const userMenuButton = screen.getByTestId('user-menu-button');

    fireEvent.click(userMenuButton);

    // Verifica se a opção de logout está presente
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });
});
