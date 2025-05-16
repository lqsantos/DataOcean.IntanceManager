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
      href: string, 
      className?: string 
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
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/');
  });
  
  it('should render correctly with closed state on mobile', () => {
    render(<Sidebar open={false} onClose={mockOnClose} />);
    
    // O container da sidebar deve ter a classe de translação
    const sidebarContainer = screen.getByTestId('sidebar-container');
    
    expect(sidebarContainer).toHaveClass('-translate-x-full');
    
    // O overlay não deve estar presente quando fechado
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
  });
  
  it('should render correctly with open state on mobile', () => {
    render(<Sidebar open={true} onClose={mockOnClose} />);
    
    // O container da sidebar não deve ter a classe de translação
    const sidebarContainer = screen.getByTestId('sidebar-container');
    
    expect(sidebarContainer).toHaveClass('translate-x-0');
    
    // O overlay deve estar presente quando aberto
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
  });
  
  it('should call onClose when clicking the close button', () => {
    render(<Sidebar open={true} onClose={mockOnClose} />);
    
    // Clicar no botão de fechar
    const closeButton = screen.getByTestId('sidebar-close-button');
    
    fireEvent.click(closeButton);
    
    // Verificar se a função onClose foi chamada
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should call onClose when clicking the overlay', () => {
    render(<Sidebar open={true} onClose={mockOnClose} />);
    
    // Clicar no overlay
    const overlay = screen.getByTestId('sidebar-overlay');
    
    fireEvent.click(overlay);
    
    // Verificar se a função onClose foi chamada
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should render all navigation links', () => {
    render(<Sidebar open={true} onClose={mockOnClose} />);
    
    // Verificar se todos os links de navegação estão presentes
    expect(screen.getByTestId('sidebar-link-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-instances')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-environments')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-locations')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-clusters')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-applications')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-templates')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-link-settings')).toBeInTheDocument();
  });
  
  it('should highlight the active link based on current pathname', () => {
    // Simular que estamos na página de ambientes
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/environments');
    
    render(<Sidebar open={true} onClose={mockOnClose} />);
    
    // Verificar se o link de ambientes está destacado
    const environmentsLink = screen.getByTestId('sidebar-link-environments');
    
    expect(environmentsLink).toHaveClass('bg-primary/10');
    expect(environmentsLink).toHaveClass('text-primary');
    
    // Verificar se outro link não está destacado
    const dashboardLink = screen.getByTestId('sidebar-link-dashboard');
    
    expect(dashboardLink).not.toHaveClass('bg-primary/10');
    expect(dashboardLink).toHaveClass('text-muted-foreground');
  });
  
  it('should have correct hrefs for navigation links', () => {
    render(<Sidebar open={true} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('sidebar-link-dashboard')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('sidebar-link-environments')).toHaveAttribute('href', '/environments');
    expect(screen.getByTestId('sidebar-link-locations')).toHaveAttribute('href', '/locations');
  });
  
  it('should have a working logo link to home page', () => {
    render(<Sidebar open={true} onClose={mockOnClose} />);
    
    const logoLink = screen.getByTestId('sidebar-logo-link');
    
    expect(logoLink).toHaveAttribute('href', '/');
  });
});