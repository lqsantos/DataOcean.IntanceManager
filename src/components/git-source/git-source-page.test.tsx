// src/components/git-source/git-source-page.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { GitSourcePage } from './git-source-page';

// Mock dos hooks e contextos
vi.mock('@/hooks/use-git-source', () => {
  const mockGitSource = {
    id: '1',
    name: 'GitHub Source',
    provider: 'github',
    organization: 'acme-org',
    status: 'active',
    url: 'https://api.github.com',
    token: 'hidden-token',
    personalAccessToken: 'token123',
    repositoryCount: 25,
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-16T14:45:00Z',
  };

  return {
    useGitSource: vi.fn().mockReturnValue({
      gitSource: mockGitSource,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refreshGitSource: vi.fn(),
      createGitSource: vi.fn().mockImplementation(async (data) => ({ ...data, id: '2' })),
      updateGitSource: vi.fn().mockImplementation(async (id, data) => ({ id, ...data })),
      activateGitSource: vi.fn().mockImplementation(async (id) => ({
        id,
        status: 'active',
      })),
      deactivateGitSource: vi.fn().mockImplementation(async (id) => ({
        id,
        status: 'inactive',
      })),
      deleteGitSource: vi.fn(),
    }),
  };
});

vi.mock('@/contexts/pat-modal-context', () => ({
  usePATModal: vi.fn().mockReturnValue({
    status: { configured: true, lastUpdated: '2023-06-15T10:30:00Z' },
    open: vi.fn(),
    isOpen: false,
  }),
}));

// Mock dos componentes filhos
vi.mock('./git-source-card', () => ({
  GitSourceCard: ({ onEdit, onDelete, onToggleStatus, gitSource }: any) => (
    <div data-testid="mock-git-source-card">
      <button data-testid="mock-edit-button" onClick={() => onEdit(gitSource)}>
        Edit
      </button>
      <button data-testid="mock-delete-button" onClick={() => onDelete(gitSource)}>
        Delete
      </button>
      <button data-testid="mock-toggle-button" onClick={() => onToggleStatus(gitSource)}>
        Toggle Status
      </button>
    </div>
  ),
}));

vi.mock('./git-source-form', () => ({
  GitSourceForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="mock-git-source-form">
      <button
        data-testid="mock-submit-form"
        onClick={() =>
          onSubmit({
            name: 'New Git Source',
            provider: 'github',
            url: 'https://api.github.com',
            organization: 'new-org',
          })
        }
      >
        Submit Form
      </button>
      <button data-testid="mock-cancel-form" onClick={onCancel}>
        Cancel Form
      </button>
    </div>
  ),
}));

vi.mock('./delete-git-source-dialog', () => ({
  DeleteGitSourceDialog: ({ onDelete, onCancel, isOpen, gitSource }: any) =>
    isOpen ? (
      <div data-testid="mock-delete-dialog">
        <button
          data-testid="mock-confirm-delete"
          onClick={() => gitSource && onDelete(gitSource.id)}
        >
          Confirm Delete
        </button>
        <button data-testid="mock-cancel-delete" onClick={onCancel}>
          Cancel Delete
        </button>
      </div>
    ) : null,
}));

// Mock dos componentes UI
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid={props['data-testid'] || 'dialog-content'}>{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Plus: ({ className }: any) => <span data-testid="icon-plus" className={className} />,
  RefreshCw: ({ className }: any) => <span data-testid="icon-refresh" className={className} />,
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('GitSourcePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with git source data', () => {
    render(<GitSourcePage />);

    expect(screen.getByTestId('git-source-page')).toBeInTheDocument();
    expect(screen.getByTestId('mock-git-source-card')).toBeInTheDocument();
    expect(screen.getByTestId('git-source-refresh-button')).toBeInTheDocument();
    expect(screen.getByTestId('git-source-create-button')).toBeInTheDocument();
  });

  it('should open create dialog when create button is clicked', async () => {
    // Sobrescrever o mock para retornar null (sem fonte Git configurada)
    const useGitSourceMock = vi.spyOn(require('@/hooks/use-git-source'), 'useGitSource');

    useGitSourceMock.mockReturnValue({
      gitSource: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refreshGitSource: vi.fn(),
      createGitSource: vi.fn().mockImplementation(async (data) => ({ ...data, id: '2' })),
      updateGitSource: vi.fn(),
      activateGitSource: vi.fn(),
      deactivateGitSource: vi.fn(),
      deleteGitSource: vi.fn(),
    });

    render(<GitSourcePage />);

    // Deve mostrar a mensagem de "nenhuma fonte configurada"
    expect(screen.getByText('Nenhuma fonte Git configurada')).toBeInTheDocument();

    // Clicar no botão de criar
    const createButton = screen.getByTestId('git-source-empty-create-button');

    fireEvent.click(createButton);

    // O diálogo de criação deve estar aberto
    expect(screen.getByTestId('git-source-create-dialog')).toBeInTheDocument();

    // Restaurar o mock original
    useGitSourceMock.mockRestore();
  });

  it('should open edit dialog when edit button is clicked', () => {
    render(<GitSourcePage />);

    const editButton = screen.getByTestId('mock-edit-button');

    fireEvent.click(editButton);

    expect(screen.getByTestId('git-source-edit-dialog')).toBeInTheDocument();
  });

  it('should open delete dialog when delete button is clicked', () => {
    render(<GitSourcePage />);

    const deleteButton = screen.getByTestId('mock-delete-button');

    fireEvent.click(deleteButton);

    expect(screen.getByTestId('mock-delete-dialog')).toBeInTheDocument();
  });

  it('should call createGitSource when submitting create form', async () => {
    const { useGitSource } = require('@/hooks/use-git-source');
    const mockCreateGitSource = vi.fn().mockResolvedValue({
      id: '2',
      name: 'New Git Source',
      provider: 'github',
    });

    useGitSource.mockReturnValue({
      gitSource: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refreshGitSource: vi.fn(),
      createGitSource: mockCreateGitSource,
      updateGitSource: vi.fn(),
      activateGitSource: vi.fn(),
      deactivateGitSource: vi.fn(),
      deleteGitSource: vi.fn(),
    });

    render(<GitSourcePage />);

    // Abrir diálogo de criação
    const createButton = screen.getByTestId('git-source-empty-create-button');

    fireEvent.click(createButton);

    // Submeter o formulário
    const submitButton = screen.getByTestId('mock-submit-form');

    await act(async () => {
      fireEvent.click(submitButton);
      // Aguardar promessa assíncrona
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockCreateGitSource).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Git Source',
        provider: 'github',
      })
    );

    // Verificar se o toast foi chamado
    const { toast } = require('sonner');

    expect(toast.success).toHaveBeenCalledWith('Fonte Git criada com sucesso!');
  });

  it('should call updateGitSource when submitting edit form', async () => {
    render(<GitSourcePage />);

    // Abrir diálogo de edição
    const editButton = screen.getByTestId('mock-edit-button');

    fireEvent.click(editButton);

    // Submeter o formulário de edição
    const submitButton = screen.getByTestId('mock-submit-form');

    await act(async () => {
      fireEvent.click(submitButton);
      // Aguardar promessa assíncrona
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verificar se o toast foi chamado
    const { toast } = require('sonner');

    expect(toast.success).toHaveBeenCalledWith('Fonte Git atualizada com sucesso!');
  });

  it('should call deleteGitSource when confirming deletion', async () => {
    const { useGitSource } = require('@/hooks/use-git-source');
    const mockDeleteGitSource = vi.fn().mockResolvedValue(undefined);

    useGitSource.mockReturnValue({
      gitSource: {
        id: '1',
        name: 'GitHub Source',
        provider: 'github',
      },
      isLoading: false,
      isRefreshing: false,
      error: null,
      refreshGitSource: vi.fn(),
      createGitSource: vi.fn(),
      updateGitSource: vi.fn(),
      activateGitSource: vi.fn(),
      deactivateGitSource: vi.fn(),
      deleteGitSource: mockDeleteGitSource,
    });

    render(<GitSourcePage />);

    // Abrir diálogo de exclusão
    const deleteButton = screen.getByTestId('mock-delete-button');

    fireEvent.click(deleteButton);

    // Confirmar exclusão
    const confirmButton = screen.getByTestId('mock-confirm-delete');

    await act(async () => {
      fireEvent.click(confirmButton);
      // Aguardar promessa assíncrona
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockDeleteGitSource).toHaveBeenCalledWith('1');

    // Verificar se o toast foi chamado
    const { toast } = require('sonner');

    expect(toast.success).toHaveBeenCalledWith('Fonte Git excluída com sucesso!');
  });

  it('should call toggleGitSource when toggle button is clicked', async () => {
    const { useGitSource } = require('@/hooks/use-git-source');
    const mockDeactivateGitSource = vi.fn().mockResolvedValue({
      id: '1',
      status: 'inactive',
    });

    useGitSource.mockReturnValue({
      gitSource: {
        id: '1',
        name: 'GitHub Source',
        provider: 'github',
        status: 'active',
      },
      isLoading: false,
      isRefreshing: false,
      error: null,
      refreshGitSource: vi.fn(),
      createGitSource: vi.fn(),
      updateGitSource: vi.fn(),
      activateGitSource: vi.fn(),
      deactivateGitSource: mockDeactivateGitSource,
      deleteGitSource: vi.fn(),
    });

    render(<GitSourcePage />);

    // Clicar no botão de toggle status
    const toggleButton = screen.getByTestId('mock-toggle-button');

    await act(async () => {
      fireEvent.click(toggleButton);
      // Aguardar promessa assíncrona
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockDeactivateGitSource).toHaveBeenCalledWith('1');

    // Verificar se o toast foi chamado
    const { toast } = require('sonner');

    expect(toast.success).toHaveBeenCalledWith('Fonte Git desativada com sucesso!');
  });

  it('should show loading state when isLoading is true', () => {
    const { useGitSource } = require('@/hooks/use-git-source');

    useGitSource.mockReturnValue({
      gitSource: null,
      isLoading: true,
      isRefreshing: false,
      error: null,
      refreshGitSource: vi.fn(),
      createGitSource: vi.fn(),
      updateGitSource: vi.fn(),
      activateGitSource: vi.fn(),
      deactivateGitSource: vi.fn(),
      deleteGitSource: vi.fn(),
    });

    render(<GitSourcePage />);

    // Deve mostrar o estado de carregamento
    expect(screen.getByText('Carregando fonte Git...')).toBeInTheDocument();
  });
});
