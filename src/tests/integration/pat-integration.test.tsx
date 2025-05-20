// src/tests/integration/pat-integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

import { PATModal } from '@/components/pat/pat-modal';
import { PATModalProvider, usePATModal } from '@/contexts/pat-modal-context';
import { patData } from '@/mocks/data/pat';
import { server } from '@/mocks/server';

// Mock para o toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Adicionando um delay para simular o tempo de resposta da API
const API_DELAY = 1000; // Aumentando o delay para garantir que os testes detectem o estado de loading

// Componente wrapper para testar
function TestWrapper({ children }: { children: ReactNode }) {
  return <PATModalProvider>{children}</PATModalProvider>;
}

// Componente que usa o contexto PAT
function PatModalTrigger() {
  const { open } = usePATModal();

  return (
    <button onClick={open} data-testid="pat-trigger-button">
      Abrir Modal PAT
    </button>
  );
}

describe('PAT Integration', () => {
  beforeEach(() => {
    // Resetar o estado mockado do PAT
    Object.assign(patData, {
      configured: false,
      lastUpdated: null,
      token: null,
    });
  });

  it('should allow configuring a new PAT token', async () => {
    // Mock da API para retornar status inicial
    server.use(
      http.get('/api/pat/status', () => {
        return HttpResponse.json({
          configured: patData.configured,
          lastUpdated: patData.lastUpdated,
        });
      }),
      http.post('/api/pat', async ({ request }) => {
        const body = await request.json();

        // Usar um delay maior para garantir que o estado de loading seja detectado
        await new Promise((resolve) => setTimeout(resolve, API_DELAY));

        patData.configured = true;
        patData.token = body.token;
        patData.lastUpdated = new Date().toISOString();

        return HttpResponse.json(
          {
            configured: true,
            lastUpdated: patData.lastUpdated,
          },
          { status: 201 }
        );
      })
    );

    // Renderizar os componentes necessários
    render(
      <TestWrapper>
        <PatModalTrigger />
        <PATModal />
      </TestWrapper>
    );

    const user = userEvent.setup({ delay: 1 }); // Slow down user interactions

    // Abrir o modal
    const openButton = screen.getByTestId('pat-trigger-button');

    await user.click(openButton);

    // Verificar se o modal foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
    });

    // Digitar um token e enviar
    const tokenInput = screen.getByTestId('pat-form-token');
    const submitButton = screen.getByTestId('pat-form-submit');

    await user.type(tokenInput, 'my-secure-token-12345');

    // Clicar no botão e verificar que o token está sendo enviado
    await user.click(submitButton);

    // Wait for API call to be in progress - we should see loading state
    // The timeout needs to be less than the API_DELAY to catch the loading state
    await waitFor(
      () => {
        // Esperar até que o texto do botão mude para "Configurando..."
        const submitText = screen.getByTestId('pat-form-submit-text');

        expect(submitText).toHaveTextContent('Configurando...');
      },
      { timeout: 500 } // Timeout menor que o API_DELAY
    );

    // Wait for the token configuration to complete
    await waitFor(
      () => {
        expect(patData.configured).toBe(true);
        expect(patData.token).toBe('my-secure-token-12345');
        expect(screen.queryByTestId('pat-modal')).not.toBeInTheDocument();
      },
      { timeout: API_DELAY * 2 }
    );
  });

  it('should allow updating an existing PAT token', async () => {
    // Inicializar com um token já configurado
    const initialDate = '2023-06-15T10:30:00Z';

    Object.assign(patData, {
      configured: true,
      lastUpdated: initialDate,
      token: 'existing-token-12345',
    });

    // Mock da API
    server.use(
      http.get('/api/pat/status', () => {
        return HttpResponse.json({
          configured: patData.configured,
          lastUpdated: patData.lastUpdated,
        });
      }),
      http.put('/api/pat/:id', async ({ request }) => {
        const body = await request.json();

        // Usar um delay maior para garantir que o estado de loading seja detectado
        await new Promise((resolve) => setTimeout(resolve, API_DELAY));

        patData.token = body.token;
        patData.lastUpdated = new Date().toISOString();

        return HttpResponse.json({
          configured: true,
          lastUpdated: patData.lastUpdated,
        });
      })
    );

    // Renderizar os componentes necessários
    render(
      <TestWrapper>
        <PatModalTrigger />
        <PATModal />
      </TestWrapper>
    );

    const user = userEvent.setup({ delay: 1 }); // Slow down user interactions

    // Abrir o modal
    const openButton = screen.getByTestId('pat-trigger-button');

    await user.click(openButton);

    // Verificar se o modal foi aberto com a informação de atualização
    await waitFor(() => {
      expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
      expect(screen.getByTestId('pat-modal-title')).toHaveTextContent('Atualizar Token de Acesso');
    });

    // Digitar um novo token e enviar
    const tokenInput = screen.getByTestId('pat-form-token');
    const submitButton = screen.getByTestId('pat-form-submit');

    await user.type(tokenInput, 'updated-token-678910');

    // Verificar o texto do botão antes do clique
    expect(screen.getByTestId('pat-form-submit-text')).toHaveTextContent('Atualizar');

    // Clicar no botão e verificar que o token está sendo enviado
    await user.click(submitButton);

    // Wait for API call to be in progress - we should see loading state
    await waitFor(
      () => {
        // Esperar até que o texto do botão mude para "Atualizando..."
        const submitText = screen.getByTestId('pat-form-submit-text');

        expect(submitText).toHaveTextContent('Atualizando...');
      },
      { timeout: 500 } // Timeout menor que o API_DELAY
    );

    // Wait for the token configuration to complete
    await waitFor(
      () => {
        expect(patData.token).toBe('updated-token-678910');
        expect(patData.lastUpdated).not.toBe(initialDate);
        expect(screen.queryByTestId('pat-modal')).not.toBeInTheDocument();
      },
      { timeout: API_DELAY * 2 }
    );
  });

  it('should handle API error when configuring a PAT', async () => {
    // Mock da API para retornar erro
    server.use(
      http.get('/api/pat/status', () => {
        return HttpResponse.json({
          configured: false,
          lastUpdated: null,
        });
      }),
      http.post('/api/pat', async () => {
        // Adicionar um delay para garantir que o estado de loading seja mostrado
        await new Promise((resolve) => setTimeout(resolve, API_DELAY));

        return new HttpResponse(JSON.stringify({ message: 'Erro de validação do token' }), {
          status: 400,
        });
      })
    );

    // Renderizar os componentes necessários
    render(
      <TestWrapper>
        <PatModalTrigger />
        <PATModal />
      </TestWrapper>
    );

    const user = userEvent.setup({ delay: 1 }); // Slow down user interactions

    // Abrir o modal
    const openButton = screen.getByTestId('pat-trigger-button');

    await user.click(openButton);

    // Verificar se o modal foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
    });

    // Digitar um token inválido e enviar
    const tokenInput = screen.getByTestId('pat-form-token');
    const submitButton = screen.getByTestId('pat-form-submit');

    await user.type(tokenInput, 'invalid-token-12345'); // Usar token mais longo para passar na validação do form

    // Clicar no botão e verificar que o token está sendo enviado
    await user.click(submitButton);

    // Wait for API call to be in progress - we should see loading state
    await waitFor(
      () => {
        // Esperar até que o texto do botão mude para "Configurando..."
        const submitText = screen.getByTestId('pat-form-submit-text');

        expect(submitText).toHaveTextContent('Configurando...');
      },
      { timeout: 500 } // Timeout menor que o API_DELAY
    );

    // Verificar se a mensagem de erro foi exibida após a requisição
    await waitFor(
      () => {
        expect(screen.getByTestId('pat-modal-error')).toBeInTheDocument();
        expect(screen.getByTestId('pat-modal-error-message')).toHaveTextContent(
          'Erro de validação do token'
        );
      },
      { timeout: API_DELAY * 2 }
    );

    // Modal deve continuar aberto após erro
    expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
  });

  it('should toggle token visibility', async () => {
    // Mock da API para retornar status inicial
    server.use(
      http.get('/api/pat/status', () => {
        return HttpResponse.json({
          configured: false,
          lastUpdated: null,
        });
      })
    );

    // Renderizar os componentes necessários
    render(
      <TestWrapper>
        <PatModalTrigger />
        <PATModal />
      </TestWrapper>
    );

    const user = userEvent.setup();

    // Abrir o modal
    const openButton = screen.getByTestId('pat-trigger-button');

    await user.click(openButton);

    // Verificar se o modal foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
    });

    const tokenInput = screen.getByTestId('pat-form-token');
    const toggleButton = screen.getByTestId('pat-form-toggle-visibility');

    // Verificar que token começa escondido
    expect(tokenInput).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('pat-eye-icon')).toBeInTheDocument();

    // Mostrar token
    await user.click(toggleButton);
    expect(tokenInput).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('pat-eye-off-icon')).toBeInTheDocument();

    // Esconder token novamente
    await user.click(toggleButton);
    expect(tokenInput).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('pat-eye-icon')).toBeInTheDocument();
  });

  it('should close modal when cancel button is clicked', async () => {
    // Mock da API para retornar status inicial
    server.use(
      http.get('/api/pat/status', () => {
        return HttpResponse.json({
          configured: false,
          lastUpdated: null,
        });
      })
    );

    // Renderizar os componentes necessários
    render(
      <TestWrapper>
        <PatModalTrigger />
        <PATModal />
      </TestWrapper>
    );

    const user = userEvent.setup();

    // Abrir o modal
    const openButton = screen.getByTestId('pat-trigger-button');

    await user.click(openButton);

    // Verificar se o modal foi aberto
    await waitFor(() => {
      expect(screen.getByTestId('pat-modal')).toBeInTheDocument();
    });

    // Clicar no botão cancelar
    const cancelButton = screen.getByTestId('pat-form-cancel');

    await user.click(cancelButton);

    // Modal deve ter sido fechado
    expect(screen.queryByTestId('pat-modal')).not.toBeInTheDocument();
  });
});
