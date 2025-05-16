import { act, fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import { Header } from './header';
import { MainLayout } from './main-layout';
import { Sidebar } from './sidebar';

// Mock das dependências
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('./header', () => ({
  Header: vi.fn(({ onMenuClick }) => (
    <div data-testid="header-mock">
      <button data-testid="menu-button" onClick={onMenuClick}>
        Toggle Menu
      </button>
    </div>
  )),
}));

vi.mock('./sidebar', () => ({
  Sidebar: vi.fn(({ open, onClose }) => (
    <div data-testid="sidebar-mock" className={open ? 'visible' : 'hidden'}>
      <button data-testid="close-sidebar-button" onClick={onClose}>
        Close Sidebar
      </button>
    </div>
  )),
}));

describe('MainLayout', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Default mock implementation
    (usePathname as any).mockReturnValue('/');

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop por padrão
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render the layout with all components', () => {
    render(
      <MainLayout>
        <div data-testid="test-children">Test Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('main-layout-container')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout-content')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout-main')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout-children-container')).toBeInTheDocument();
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('should toggle sidebar when menu button is clicked', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const menuButton = screen.getByTestId('menu-button');

    // Verify sidebar is open by default (on desktop)
    expect(screen.getByTestId('sidebar-mock')).toHaveClass('visible');

    // Click menu button to close sidebar
    fireEvent.click(menuButton);
    expect(screen.getByTestId('sidebar-mock')).toHaveClass('hidden');

    // Click again to open sidebar
    fireEvent.click(menuButton);
    expect(screen.getByTestId('sidebar-mock')).toHaveClass('visible');
  });

  it('should close sidebar when close button is clicked', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const closeButton = screen.getByTestId('close-sidebar-button');

    // Verify sidebar is open by default (on desktop)
    expect(screen.getByTestId('sidebar-mock')).toHaveClass('visible');

    // Click close button
    fireEvent.click(closeButton);
    expect(screen.getByTestId('sidebar-mock')).toHaveClass('hidden');
  });

  it('should start with sidebar closed on mobile devices', () => {
    // Set window width to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640, // Mobile width
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Force useEffect to run
    act(() => {
      // Trigger the useEffect
    });

    // Verify sidebar is closed on mobile
    expect(screen.getByTestId('sidebar-mock')).toHaveClass('hidden');
  });

  it('should close sidebar when route changes on mobile', () => {
    // Set window width to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640, // Mobile width
    });

    const pathname = vi.fn();

    (usePathname as any).mockImplementation(() => pathname);

    const { rerender } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Change route
    pathname.mockReturnValue('/new-route');

    rerender(
      <MainLayout>
        <div>New Route Content</div>
      </MainLayout>
    );

    // Trigger useEffect for pathname change
    act(() => {
      // Simulate the effect of changing routes
    });

    // Verify sidebar is closed after route change on mobile
    expect(screen.getByTestId('sidebar-mock')).toHaveClass('hidden');
  });

  it('should always pass the correct props to the Header and Sidebar components', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Verificar se Header foi chamado com uma função onMenuClick
    expect(Header).toHaveBeenCalled();
    const headerCall = (Header as any).mock.calls[0][0];

    expect(headerCall).toHaveProperty('onMenuClick');
    expect(typeof headerCall.onMenuClick).toBe('function');

    // Verificar se Sidebar foi chamado com as props corretas
    expect(Sidebar).toHaveBeenCalled();
    const sidebarCall = (Sidebar as any).mock.calls[0][0];

    expect(sidebarCall).toHaveProperty('open', true);
    expect(sidebarCall).toHaveProperty('onClose');
    expect(typeof sidebarCall.onClose).toBe('function');
  });
});
