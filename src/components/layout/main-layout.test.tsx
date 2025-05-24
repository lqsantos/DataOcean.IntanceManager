import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { render as renderWithWrapper, TestWrapper } from '@/tests/test-utils';

import { MainLayout } from './main-layout';

// Mock dos componentes filhos
vi.mock('./header', () => ({
  Header: ({ onMenuClick }: any) => (
    <header data-testid="mock-header">
      <button data-testid="mock-header-button" onClick={onMenuClick}>
        Toggle Menu
      </button>
    </header>
  ),
}));

vi.mock('./sidebar', () => ({
  Sidebar: ({ isOpen, onClose }: any) => (
    <aside data-testid="mock-sidebar" data-is-open={isOpen ? 'true' : 'false'}>
      <button data-testid="mock-sidebar-close-button" onClick={onClose}>
        Close Sidebar
      </button>
    </aside>
  ),
}));

// Mock para useMediaQuery
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn().mockReturnValue(true), // Default to desktop view
}));

// Mock para useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the layout with all components', () => {
    renderWithWrapper(
      <MainLayout>
        <div data-testid="mock-children">Test Content</div>
      </MainLayout>
    );

    // Verificar se todos os componentes principais estão presentes
    expect(screen.getByTestId('main-layout-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout-content')).toBeInTheDocument();
    expect(screen.getByTestId('mock-children')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should toggle sidebar when menu button is clicked', () => {
    renderWithWrapper(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Initially, sidebar should be closed on desktop
    const sidebar = screen.getByTestId('mock-sidebar');

    expect(sidebar).toHaveAttribute('data-is-open', 'false');

    // Click the header button to toggle sidebar
    const headerButton = screen.getByTestId('mock-header-button');

    fireEvent.click(headerButton);

    // Sidebar should now be open
    expect(sidebar).toHaveAttribute('data-is-open', 'true');

    // Click again to close
    fireEvent.click(headerButton);

    // Sidebar should now be closed again
    expect(sidebar).toHaveAttribute('data-is-open', 'false');
  });

  it('should close sidebar when close button is clicked', () => {
    renderWithWrapper(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // First, open the sidebar
    const headerButton = screen.getByTestId('mock-header-button');

    fireEvent.click(headerButton);

    const sidebar = screen.getByTestId('mock-sidebar');

    expect(sidebar).toHaveAttribute('data-is-open', 'true');

    // Now close it using the sidebar close button
    const closeButton = screen.getByTestId('mock-sidebar-close-button');

    fireEvent.click(closeButton);

    // Sidebar should be closed
    expect(sidebar).toHaveAttribute('data-is-open', 'false');
  });

  it('should start with sidebar closed on mobile devices', () => {
    // Mock useMediaQuery to return false (mobile view)
    const { useMediaQuery } = require('react-responsive');

    useMediaQuery.mockReturnValue(false);

    renderWithWrapper(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Sidebar should be closed by default on mobile
    const sidebar = screen.getByTestId('mock-sidebar');

    expect(sidebar).toHaveAttribute('data-is-open', 'false');
  });

  it('should close sidebar when route changes on mobile', () => {
    // Mock useMediaQuery to return false (mobile view)
    const { useMediaQuery } = require('react-responsive');

    useMediaQuery.mockReturnValue(false);

    // Get the mocked router
    const { usePathname } = vi.requireMock('next/navigation');
    let pathnameMock = '/';

    vi.mocked(usePathname).mockImplementation(() => pathnameMock);

    const { rerender } = renderWithWrapper(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Open the sidebar
    const headerButton = screen.getByTestId('mock-header-button');

    fireEvent.click(headerButton);

    const sidebar = screen.getByTestId('mock-sidebar');

    expect(sidebar).toHaveAttribute('data-is-open', 'true');

    // Change the route
    pathnameMock = '/new-route';

    // Re-render with the new route
    rerender(
      <TestWrapper>
        <MainLayout>
          <div>New Content</div>
        </MainLayout>
      </TestWrapper>
    );

    // Sidebar should be closed due to route change
    expect(sidebar).toHaveAttribute('data-is-open', 'false');
  });

  it('should always pass the correct props to the Header and Sidebar components', () => {
    renderWithWrapper(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Check if Header and Sidebar are rendered with the correct props via their mocked behaviors
    const header = screen.getByTestId('mock-header');
    const sidebar = screen.getByTestId('mock-sidebar');

    expect(header).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveAttribute('data-is-open', 'false');

    // Test that props are correctly passed by checking the behavior
    const headerButton = screen.getByTestId('mock-header-button');

    fireEvent.click(headerButton);

    // Check if the sidebar state changed based on the header button click
    expect(sidebar).toHaveAttribute('data-is-open', 'true');
  });
});
