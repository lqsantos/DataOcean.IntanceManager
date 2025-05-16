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

  it('should display user information when open', () => {
    render(<UserMenu />);

    // Clica no botão para abrir o dropdown
    fireEvent.click(screen.getByTestId('user-menu-button'));

    // Como mockamos o DropdownMenuContent para renderizar diretamente,
    // agora podemos verificar o conteúdo
    const dropdown = screen.getByTestId('user-menu-dropdown');

    expect(dropdown).toBeInTheDocument();

    // Verifica se os elementos do usuário estão presentes
    expect(screen.getByTestId('user-menu-username')).toHaveTextContent('Admin User');
    expect(screen.getByTestId('user-menu-email')).toHaveTextContent('admin@dataocean.io');
  });

  it('should display navigation options', () => {
    render(<UserMenu />);

    // Abre o dropdown
    fireEvent.click(screen.getByTestId('user-menu-button'));

    // Verifica se todos os links estão presentes
    expect(screen.getByTestId('user-menu-profile-link')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu-settings-link')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu-logout-button')).toBeInTheDocument();
  });

  it('should have correct links for profile and settings', () => {
    render(<UserMenu />);

    // Abre o dropdown
    fireEvent.click(screen.getByTestId('user-menu-button'));

    // Verifica URLs dos links
    expect(screen.getByTestId('user-menu-profile-link')).toHaveAttribute('href', '/profile');
    expect(screen.getByTestId('user-menu-settings-link')).toHaveAttribute(
      'href',
      '/profile/settings'
    );
  });

  it('should have clickable logout button', () => {
    render(<UserMenu />);

    // Abre o dropdown
    fireEvent.click(screen.getByTestId('user-menu-button'));

    // Verifica se o botão de logout é clicável
    const logoutButton = screen.getByTestId('user-menu-logout-button');

    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).not.toBeDisabled();

    // Verifica se o conteúdo do botão de logout é correto
    expect(logoutButton).toHaveTextContent('Log out');
  });

  it('should render avatar correctly', () => {
    render(<UserMenu />);

    // Verifica se o avatar está sendo renderizado através do data-testid
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveClass('h-8 w-8 ring-2 ring-primary/20');

    // Verifica se a imagem do avatar tem o src e alt corretos
    const avatarImage = screen.getByTestId('avatar-image');

    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute(
      'src',
      'https://ui-avatars.com/api/?name=User&background=random'
    );
    expect(avatarImage).toHaveAttribute('alt', 'User');

    // Verifica se o fallback do avatar está presente com o conteúdo correto
    const avatarFallback = screen.getByTestId('avatar-fallback');

    expect(avatarFallback).toBeInTheDocument();
    expect(avatarFallback).toHaveClass('gradient-blue');
    expect(avatarFallback).toHaveTextContent('DO');
  });
});
