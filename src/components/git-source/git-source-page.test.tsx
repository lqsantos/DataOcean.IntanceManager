// src/components/git-source/git-source-page.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';

import { GitSourcePage } from './git-source-page';

// Configurando MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

// Mock data
const mockGitSource = {
  id: '1',
  name: 'GitHub Source',
  provider: 'github',
  organization: 'acme-org',
  status: 'active',
  url: 'https://api.github.com',
  repositoryCount: 25,
  createdAt: '2023-06-15T10:30:00Z',
  updatedAt: '2023-06-16T14:45:00Z',
};

describe('GitSourcePage', () => {
  it('should render the page with git source data', async () => {
    // Configurar MSW para retornar uma fonte Git existente
    server.use(
      http.get('/api/git-source', () => {
        return HttpResponse.json(mockGitSource);
      })
    );

    render(<GitSourcePage />);

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Fontes Git')).toBeInTheDocument();
    });

    // Verificar se a página foi renderizada com os elementos esperados
    expect(screen.getByTestId('git-source-refresh-button')).toBeInTheDocument();
    expect(screen.getByTestId('git-source-create-button')).toBeInTheDocument();
  });

  it('should open create dialog when create button is clicked', async () => {
    // Configurar MSW para retornar 404 (nenhuma fonte Git configurada)
    server.use(
      http.get('/api/git-source', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    render(<GitSourcePage />);

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Nenhuma fonte Git configurada')).toBeInTheDocument();
    });

    // Clicar no botão de criar usando o data-testid específico
    const createButton = screen.getByTestId('git-source-empty-create-button');

    fireEvent.click(createButton);

    // O diálogo de criação deve estar aberto
    await waitFor(() => {
      expect(
        screen.getByText('Configure uma nova fonte Git para integrar com repositórios.')
      ).toBeInTheDocument();
    });
  });

  it('should show loading state when isLoading is true', async () => {
    // Configurar MSW para atrasar a resposta, garantindo que o estado de loading seja mostrado
    server.use(
      http.get('/api/git-source', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return HttpResponse.json(mockGitSource);
      })
    );

    render(<GitSourcePage />);

    // Deve mostrar o estado de carregamento
    expect(screen.getByText('Carregando fonte Git...')).toBeInTheDocument();
  });
});
