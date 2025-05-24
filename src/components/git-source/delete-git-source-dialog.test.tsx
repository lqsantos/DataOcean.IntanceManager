// src/components/git-source/delete-git-source-dialog.test.tsx
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/tests/test-utils';
import type { GitSource } from '@/types/git-source';

import { DeleteGitSourceDialog } from './delete-git-source-dialog';

// Mock dos componentes da UI
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  AlertDialogCancel: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'alert-dialog-cancel'}
      {...props}
    >
      {children}
    </button>
  ),
  AlertDialogContent: ({ children, ...props }: any) => (
    <div data-testid={props['data-testid'] || 'alert-dialog-content'} {...props}>
      {children}
    </div>
  ),
  AlertDialogDescription: ({ children }: any) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: any) => <div data-testid="alert-dialog-footer">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div data-testid="alert-dialog-header">{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div data-testid="alert-dialog-title">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || `button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Loader2: ({ className }: any) => <span data-testid="loader" className={className} />,
  Trash2: ({ className }: any) => <span data-testid="trash-icon" className={className} />,
  XIcon: ({ className }: any) => <span data-testid="x-icon" className={className} />,
}));

describe('DeleteGitSourceDialog', () => {
  const mockGitSource: GitSource = {
    id: '1',
    name: 'GitHub Demo',
    provider: 'github',
    status: 'active',
    organization: 'acme-org',
    personalAccessToken: 'token123',
    repositoryCount: 25,
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-16T14:45:00Z',
  };

  const onDelete = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when gitSource is null', () => {
    const { container } = render(
      <DeleteGitSourceDialog
        gitSource={null}
        isOpen={true}
        isDeleting={false}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should not render dialog when isOpen is false', () => {
    const { container } = render(
      <DeleteGitSourceDialog
        gitSource={mockGitSource}
        isOpen={false}
        isDeleting={false}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render dialog with correct content when isOpen is true', () => {
    render(
      <DeleteGitSourceDialog
        gitSource={mockGitSource}
        isOpen={true}
        isDeleting={false}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    );

    // Check that the dialog content is rendered
    expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('alert-dialog-title')).toHaveTextContent(/excluir fonte git/i);

    // Check that the git source name is displayed in the description
    const description = screen.getByTestId('alert-dialog-description');

    expect(description).toHaveTextContent('GitHub Demo');

    // Check that buttons are rendered
    expect(screen.getByTestId('alert-dialog-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('delete-git-source-confirm-button')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <DeleteGitSourceDialog
        gitSource={mockGitSource}
        isOpen={true}
        isDeleting={false}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByTestId('alert-dialog-cancel');

    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('should call onDelete when confirm button is clicked', () => {
    render(
      <DeleteGitSourceDialog
        gitSource={mockGitSource}
        isOpen={true}
        isDeleting={false}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    );

    const confirmButton = screen.getByTestId('delete-git-source-confirm-button');

    fireEvent.click(confirmButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('should disable buttons and show loading state when isDeleting is true', () => {
    render(
      <DeleteGitSourceDialog
        gitSource={mockGitSource}
        isOpen={true}
        isDeleting={true}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByTestId('alert-dialog-cancel');
    const confirmButton = screen.getByTestId('delete-git-source-confirm-button');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should show "Excluir" text when isDeleting is false', () => {
    render(
      <DeleteGitSourceDialog
        gitSource={mockGitSource}
        isOpen={true}
        isDeleting={false}
        onDelete={onDelete}
        onCancel={onCancel}
      />
    );

    const confirmButton = screen.getByTestId('delete-git-source-confirm-button');

    expect(confirmButton).toHaveTextContent('Excluir');
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });
});
