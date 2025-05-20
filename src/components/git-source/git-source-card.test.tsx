// src/components/git-source/git-source-card.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { GitSource } from '@/types/git-source';

import { GitSourceCard } from './git-source-card';

// Mock dos componentes UI
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span data-testid={`badge-${variant || 'default'}`} className={className} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, size, variant, ...props }: any) => (
    <button
      onClick={onClick}
      data-testid={props['data-testid'] || `button-${variant || 'default'}-${size || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="card-title" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className, ...props }: any) => (
    <div data-testid="card-footer" className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: ({ className, ...props }: any) => (
    <hr data-testid="separator" className={className} {...props} />
  ),
}));

vi.mock('lucide-react', () => ({
  Database: ({ className }: any) => <span data-testid="icon-database" className={className} />,
  Edit: ({ className }: any) => <span data-testid="icon-edit" className={className} />,
  GitBranch: ({ className }: any) => <span data-testid="icon-git-branch" className={className} />,
  Trash2: ({ className }: any) => <span data-testid="icon-trash" className={className} />,
}));

describe('GitSourceCard', () => {
  const mockGitSource: GitSource = {
    id: '1',
    name: 'GitHub Demo',
    provider: 'github',
    status: 'active',
    organization: 'acme-org',
    personalAccessToken: 'token123',
    repositoryCount: 25,
    notes: 'Some notes about this source',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-16T14:45:00Z',
  };

  const mockGitlabSource: GitSource = {
    id: '2',
    name: 'GitLab Demo',
    provider: 'gitlab',
    status: 'inactive',
    namespace: 'acme-namespace',
    personalAccessToken: 'token456',
    repositoryCount: 15,
    createdAt: '2023-06-15T10:30:00Z',
  };

  const mockAzureSource: GitSource = {
    id: '3',
    name: 'Azure DevOps Demo',
    provider: 'azure-devops',
    status: 'active',
    organization: 'acme',
    project: 'main-project',
    personalAccessToken: 'token789',
    repositoryCount: 10,
    createdAt: '2023-06-15T10:30:00Z',
  };

  // Mock das funções de callback
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onToggleStatus = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render GitHub source card with correct information', () => {
    render(
      <GitSourceCard
        gitSource={mockGitSource}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    );

    // Verifica o nome da fonte Git
    expect(screen.getByTestId('git-source-card-name')).toHaveTextContent('GitHub Demo');

    // Verifica o status
    expect(screen.getByTestId('badge-default')).toHaveTextContent('Ativo');

    // Verifica a organização
    expect(screen.getByTestId('git-source-card-namespace')).toHaveTextContent('acme-org');

    // Verifica a contagem de repositórios
    expect(screen.getByTestId('git-source-card-repo-count')).toHaveTextContent('25');

    // Verifica as notas
    expect(screen.getByTestId('git-source-card-notes')).toHaveTextContent(
      'Some notes about this source'
    );

    // Verifica datas formatadas
    expect(screen.getByTestId('git-source-card-created-at')).toBeInTheDocument();
    expect(screen.getByTestId('git-source-card-updated-at')).toBeInTheDocument();

    // Verifica botões
    expect(screen.getByTestId('git-source-card-toggle-status')).toHaveTextContent('Desativar');
    expect(screen.getByTestId('git-source-card-edit')).toHaveTextContent('Editar');
    expect(screen.getByTestId('git-source-card-delete')).toHaveTextContent('Excluir');
  });

  it('should render GitLab source card with correct information', () => {
    render(
      <GitSourceCard
        gitSource={mockGitlabSource}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    );

    // Verifica o nome da fonte Git
    expect(screen.getByTestId('git-source-card-name')).toHaveTextContent('GitLab Demo');

    // Verifica o status
    expect(screen.getByTestId('badge-secondary')).toHaveTextContent('Inativo');

    // Verifica o namespace
    expect(screen.getByTestId('git-source-card-namespace')).toHaveTextContent('acme-namespace');

    // Verifica botão de toggle status
    expect(screen.getByTestId('git-source-card-toggle-status')).toHaveTextContent('Ativar');
  });

  it('should render Azure DevOps source card with correct information', () => {
    render(
      <GitSourceCard
        gitSource={mockAzureSource}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    );

    // Verifica o nome da fonte Git
    expect(screen.getByTestId('git-source-card-name')).toHaveTextContent('Azure DevOps Demo');

    // Verifica a organização e projeto
    expect(screen.getByTestId('git-source-card-namespace')).toHaveTextContent(
      'acme / main-project'
    );
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <GitSourceCard
        gitSource={mockGitSource}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    );

    const editButton = screen.getByTestId('git-source-card-edit');

    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockGitSource);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <GitSourceCard
        gitSource={mockGitSource}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    );

    const deleteButton = screen.getByTestId('git-source-card-delete');

    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockGitSource);
  });

  it('should call onToggleStatus when toggle button is clicked', () => {
    render(
      <GitSourceCard
        gitSource={mockGitSource}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    );

    const toggleButton = screen.getByTestId('git-source-card-toggle-status');

    fireEvent.click(toggleButton);

    expect(onToggleStatus).toHaveBeenCalledTimes(1);
    expect(onToggleStatus).toHaveBeenCalledWith(mockGitSource);
  });
});
