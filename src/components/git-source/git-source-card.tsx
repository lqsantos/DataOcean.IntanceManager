'use client';

import { Database, Edit, GitBranch, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { GitSource } from '@/types/git-source';

interface GitSourceCardProps {
  gitSource: GitSource;
  onEdit: (gitSource: GitSource) => void;
  onDelete: (gitSource: GitSource) => void;
  onToggleStatus: (gitSource: GitSource) => Promise<void>;
}

export function GitSourceCard({ gitSource, onEdit, onDelete, onToggleStatus }: GitSourceCardProps) {
  // Formato para exibição das datas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Ícones específicos para cada provedor
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" />
          </svg>
        );
      case 'gitlab':
        return (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M23.3114 10.8124L23.293 10.7866L20.2154 1.37336C20.1624 1.22256 20.0648 1.09223 19.9349 0.999583C19.805 0.906938 19.6486 0.85518 19.4878 0.851502C19.3269 0.847825 19.1683 0.892325 19.0342 0.979076C18.9002 1.06583 18.7968 1.19087 18.7365 1.33834L16.4711 8.52582H7.52871L5.26345 1.33834C5.20316 1.19087 5.09968 1.06583 4.96565 0.979076C4.83162 0.892325 4.67297 0.847825 4.51209 0.851502C4.35121 0.85518 4.19487 0.906938 4.06496 0.999583C3.93506 1.09223 3.83738 1.22256 3.78444 1.37336L0.706863 10.7866L0.688438 10.8124C0.0430957 12.3983 -0.00413463 14.1354 0.559027 15.7575C1.12219 17.3795 2.26645 18.7794 3.78444 19.7402L3.80296 19.7498L3.8268 19.768L8.5014 22.7792L10.7988 24.2105L12.3754 25.2001C12.5773 25.3262 12.8092 25.3937 13.046 25.3937C13.2829 25.3937 13.5148 25.3262 13.7167 25.2001L15.2932 24.2105L17.5907 22.7792L22.2941 19.7498C23.8048 18.7854 24.9423 17.3851 25.5012 15.7654C26.06 14.1458 26.0115 12.4129 25.3678 10.8304L23.3114 10.8124Z" />
          </svg>
        );
      case 'azure-devops':
        return (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22.2819 8.9463L13.3334 0L0 13.3333L2.46929 15.8026L3.16762 15.1041L12.7576 15.1051L22.2819 8.9463ZM13.3334 3.05723L18.7356 8.45946L12.1187 12.6667H5.91385L13.3334 3.05723ZM0 16.0001L5.12489 21.125L21.1249 21.1249L12.7039 16.0001H0ZM14.7082 18.6667H7.58322V16.0001H14.7082V18.6667Z" />
          </svg>
        );
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  return (
    <Card className="hover-scale group w-full transition-all" data-testid="git-source-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            {getProviderIcon(gitSource.provider)}
          </div>
          <span data-testid="git-source-card-name">{gitSource.name}</span>
        </CardTitle>
        <Badge
          variant={gitSource.status === 'active' ? 'default' : 'secondary'}
          className="px-2 py-0"
          data-testid="git-source-card-status"
        >
          {gitSource.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="space-y-3">
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-muted-foreground">
              {gitSource.provider === 'github' && 'Owner GitHub'}
              {gitSource.provider === 'gitlab' && 'Namespace GitLab'}
              {gitSource.provider === 'azure-devops' && 'Organização / Projeto'}
            </span>
            <span data-testid="git-source-card-namespace">
              {gitSource.provider === 'github' && gitSource.organization}
              {gitSource.provider === 'gitlab' && gitSource.namespace}
              {gitSource.provider === 'azure-devops' &&
                `${gitSource.organization || '-'} / ${gitSource.project || '-'}`}
            </span>
          </div>

          {gitSource.repositoryCount !== undefined && (
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">
                Repositórios Encontrados
              </span>
              <div className="flex items-center gap-1">
                <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                <span data-testid="git-source-card-repo-count">{gitSource.repositoryCount}</span>
              </div>
            </div>
          )}

          {gitSource.notes && (
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Notas</span>
              <p className="text-muted-foreground" data-testid="git-source-card-notes">
                {gitSource.notes}
              </p>
            </div>
          )}

          <Separator className="my-1" />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Criado em:</span>
              <div data-testid="git-source-card-created-at">{formatDate(gitSource.createdAt)}</div>
            </div>
            {gitSource.updatedAt && (
              <div>
                <span className="text-muted-foreground">Atualizado em:</span>
                <div data-testid="git-source-card-updated-at">
                  {formatDate(gitSource.updatedAt)}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(gitSource)}
          data-testid="git-source-card-toggle-status"
        >
          {gitSource.status === 'active' ? 'Desativar' : 'Ativar'}
        </Button>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(gitSource)}
            data-testid="git-source-card-edit"
          >
            <Edit className="mr-1 h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(gitSource)}
            data-testid="git-source-card-delete"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Excluir
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
