import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Sidebar } from './sidebar';

// Mock do next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock do next/link
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({
      href,
      className,
      children,
      ...rest
    }: React.HTMLAttributes<HTMLAnchorElement> & {
      href: string;
      className?: string;
    }) => {
      return (
        <a href={href} className={className} {...rest}>
          {children}
        </a>
      );
    },
  };
});

describe('Sidebar Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Por padrão, simular que estamos na página inicial
    (usePathname as vi.Mock).mockReturnValue('/');
  });

  it('should render correctly when open', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    // Verificar elementos principais
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-close-button')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
  });

  it('should not be visible when closed', () => {
    render(<Sidebar isOpen={false} onClose={mockOnClose} />);

    // O sidebar deve estar presente no DOM, mas não visível
    const sidebar = screen.getByTestId('sidebar');

    expect(sidebar).toHaveClass('hidden');
  });

  it('should call onClose when close button is clicked', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByTestId('sidebar-close-button');

    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should mark current page as active', () => {
    // Simular que estamos na página de ambientes
    (usePathname as vi.Mock).mockReturnValue('/environments');

    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    // O link para ambientes deve estar marcado como ativo
    const environmentsLink = screen.getByTestId('sidebar-link-environments');

    expect(environmentsLink).toHaveClass('bg-accent');
  });

  it('should contain all navigation links', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    // Verificar se todos os links de navegação estão presentes
    expect(screen.getByTestId('sidebar-link-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-environments')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-applications')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-locations')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-clusters')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-git-sources')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-templates')).toBeInTheDocument();
  });

  it('should have correct hrefs for all links', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    // Verificar os hrefs dos links
    expect(screen.getByTestId('sidebar-link-dashboard')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('sidebar-link-environments')).toHaveAttribute(
      'href',
      '/environments'
    );
    expect(screen.getByTestId('sidebar-link-applications')).toHaveAttribute(
      'href',
      '/applications'
    );
    expect(screen.getByTestId('sidebar-link-locations')).toHaveAttribute('href', '/locations');
    expect(screen.getByTestId('sidebar-link-clusters')).toHaveAttribute('href', '/clusters');
    expect(screen.getByTestId('sidebar-link-git-sources')).toHaveAttribute('href', '/git-sources');
    expect(screen.getByTestId('sidebar-link-templates')).toHaveAttribute('href', '/templates');
  });

  it('should display correct icons for all links', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    // Os ícones são mockados no test-utils, então apenas verificamos se os data-testid existem
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('layers-icon')).toBeInTheDocument();
    expect(screen.getByTestId('app-window-icon')).toBeInTheDocument();
    expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    expect(screen.getByTestId('server-icon')).toBeInTheDocument();
    expect(screen.getByTestId('git-icon')).toBeInTheDocument();
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  });

  it('should close when a link is clicked on mobile view', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} isMobile={true} />);

    const dashboardLink = screen.getByTestId('sidebar-link-dashboard');

    fireEvent.click(dashboardLink);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when a link is clicked on desktop view', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} isMobile={false} />);

    const dashboardLink = screen.getByTestId('sidebar-link-dashboard');

    fireEvent.click(dashboardLink);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
