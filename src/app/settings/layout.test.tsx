import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { render } from '@/tests/test-utils';

import SettingsLayout from './layout';

// Mock do useRouter
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/settings/applications'),
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SettingsLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render settings layout with tabs', () => {
    render(
      <SettingsLayout>
        <div data-testid="mock-child">Test Content</div>
      </SettingsLayout>
    );

    // Verificar se o título e os tabs estão presentes
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-applications')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-environments')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-locations')).toBeInTheDocument();

    // Verificar se o conteúdo filho foi renderizado
    expect(screen.getByTestId('mock-child')).toBeInTheDocument();
  });

  it('should navigate when tabs are clicked', () => {
    render(
      <SettingsLayout>
        <div>Test Content</div>
      </SettingsLayout>
    );

    // Clicar em diferentes tabs e verificar navegação
    fireEvent.click(screen.getByTestId('settings-tab-environments'));
    expect(mockPush).toHaveBeenCalledWith('/settings/environments');

    fireEvent.click(screen.getByTestId('settings-tab-locations'));
    expect(mockPush).toHaveBeenCalledWith('/settings/locations');

    fireEvent.click(screen.getByTestId('settings-tab-applications'));
    expect(mockPush).toHaveBeenCalledWith('/settings/applications');
  });

  it('should set active tab based on URL', () => {
    // Preparação
    const { usePathname } = require('next/navigation');

    // Simular diferentes URLs
    usePathname.mockReturnValue('/settings/environments');

    const { rerender } = render(
      <SettingsLayout>
        <div>Test Content</div>
      </SettingsLayout>
    );

    // Verificar se o tab correto está ativo
    expect(screen.getByTestId('settings-tab-environments')).toHaveAttribute('data-state', 'active');

    // Testar com outra URL
    usePathname.mockReturnValue('/settings/locations');

    rerender(
      <SettingsLayout>
        <div>Test Content</div>
      </SettingsLayout>
    );

    // Verificar se outro tab está ativo agora
    expect(screen.getByTestId('settings-tab-locations')).toHaveAttribute('data-state', 'active');
  });
});
