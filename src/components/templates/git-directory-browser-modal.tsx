'use client';

import { ChevronRight, File, FolderOpen, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface GitDirectoryBrowserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeItems: Array<{
    path: string;
    name: string;
    type: 'tree' | 'blob';
    isChartDirectory?: boolean;
  }>;
  isLoading: boolean;
  onSelectPath: (path: string) => void;
  onFetchDirectory?: (path: string) => Promise<void>;
}

export function GitDirectoryBrowserModal({
  open,
  onOpenChange,
  treeItems,
  isLoading,
  onSelectPath,
  onFetchDirectory,
}: GitDirectoryBrowserModalProps) {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  const [loadingPaths, setLoadingPaths] = useState<Record<string, boolean>>({});
  const [loadedItems, setLoadedItems] = useState<Record<string, typeof treeItems>>({});
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    setIsModalLoading(isLoading);
  }, [isLoading]);

  // Limpar estado quando o modal for fechado
  useEffect(() => {
    if (!open) {
      setExpandedPaths({});
      setLoadingPaths({});
    }
  }, [open]);

  // Salva os itens iniciais como itens de raiz
  useEffect(() => {
    if (treeItems.length > 0) {
      setLoadedItems((prev) => ({
        ...prev,
        '': treeItems,
      }));
    }
  }, [treeItems]);

  const handleToggleExpand = useCallback(
    async (path: string, isExpanded: boolean) => {
      // Se está expandindo um diretório que ainda não foi carregado
      if (!isExpanded && onFetchDirectory && !loadedItems[path]) {
        try {
          setLoadingPaths((prev) => ({ ...prev, [path]: true }));
          await onFetchDirectory(path);

          // O callback onFetchDirectory vai atualizar os treeItems,
          // mas precisamos marcá-los como já carregados para este path
          setLoadedItems((prev) => ({
            ...prev,
            [path]: treeItems.filter((item) => {
              const pathParts = item.path.split('/');
              const parentPath =
                pathParts.length <= 1 ? '' : pathParts.slice(0, -1).join('/');

              return parentPath === path;
            }),
          }));
        } catch (error) {
          console.error('Erro ao carregar conteúdo do diretório:', error);
        } finally {
          setLoadingPaths((prev) => ({ ...prev, [path]: false }));
        }
      }

      // Atualiza o estado de expandido/colapsado
      setExpandedPaths((prev) => ({
        ...prev,
        [path]: !prev[path],
      }));
    },
    [onFetchDirectory, treeItems, loadedItems]
  );

  const handleSelectDirectory = useCallback(
    (path: string, isDirectory: boolean, isChartDirectory: boolean) => {
      // Permite selecionar qualquer diretório
      if (isDirectory) {
        setSelectedPath(path);
      }
    },
    []
  );

  // Organiza os itens em uma estrutura hierárquica considerando os já carregados
  const getChildItems = useCallback(
    (parentPath: string): typeof treeItems => {
      // Primeiro, verifica se temos itens já carregados para este parentPath
      if (loadedItems[parentPath]) {
        return loadedItems[parentPath];
      }

      // Caso contrário, filtra dos treeItems atuais
      return treeItems.filter((item) => {
        const pathParts = item.path.split('/');
        const itemParentPath =
          pathParts.length <= 1 ? '' : pathParts.slice(0, -1).join('/');

        return itemParentPath === parentPath;
      });
    },
    [treeItems, loadedItems]
  );

  const renderTreeItem = useCallback(
    (item: (typeof treeItems)[0], level = 0) => {
      const isExpanded = expandedPaths[item.path];
      const isSelected = selectedPath === item.path;
      const isDirectory = item.type === 'tree';
      const isLoading = loadingPaths[item.path];

      // Obtém os itens filhos do diretório atual
      const childItems = isDirectory ? getChildItems(item.path) : [];

      // Ordena: primeiro diretórios, depois arquivos
      const sortedChildItems = [...childItems].sort((a, b) => {
        if (a.type === 'tree' && b.type !== 'tree') {return -1;}

        if (a.type !== 'tree' && b.type === 'tree') {return 1;}

        return a.name.localeCompare(b.name);
      });

      return (
        <div key={item.path} className="flex flex-col">
          <div
            className={cn(
              'flex cursor-pointer items-center rounded px-1.5 py-1 text-xs hover:bg-gray-100',
              isSelected && 'border-l-2 border-blue-500 bg-blue-50',
              isLoading && 'opacity-70'
            )}
            onClick={() => {
              if (isDirectory && !isLoading) {
                handleToggleExpand(item.path, isExpanded);
              }

              if (!isLoading) {
                handleSelectDirectory(item.path, isDirectory, !!item.isChartDirectory);
              }
            }}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {isDirectory ? (
              <>
                {isLoading ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin text-amber-500" />
                ) : (
                  <ChevronRight
                    className={cn(
                      'mr-1.5 h-3 w-3 transition-transform',
                      isExpanded && 'rotate-90 transform'
                    )}
                  />
                )}
                <FolderOpen 
                  className={cn(
                    'mr-1.5 h-3 w-3',
                    isLoading ? 'text-amber-300' : 'text-amber-500'
                  )}
                />
              </>
            ) : (
              <>
                <span className="mr-1.5 w-3"></span>
                <File className="mr-1.5 h-3 w-3 text-gray-500" />
              </>
            )}

            <span className={cn('text-xs', isLoading && 'text-muted-foreground')}>{item.name}</span>

            {item.isChartDirectory && (
              <Badge variant="secondary" className="ml-1.5 h-4 py-0 text-[10px]">
                Chart
              </Badge>
            )}
          </div>

          {isDirectory && isExpanded && (
            <div className="flex flex-col">
              {sortedChildItems.length === 0 ? (
                <div
                  className="px-2 py-1 text-xs text-muted-foreground"
                  style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                >
                  {isLoading ? 'Carregando...' : 'Pasta vazia'}
                </div>
              ) : (
                sortedChildItems.map((childItem) =>
                  renderTreeItem(childItem, level + 1)
                )
              )}
            </div>
          )}
        </div>
      );
    },
    [
      expandedPaths,
      selectedPath,
      loadingPaths,
      getChildItems,
      handleToggleExpand,
      handleSelectDirectory,
    ]
  );

  // Obtém itens da raiz
  const rootItems = getChildItems('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center text-base">
            <FolderOpen className="mr-1.5 h-4 w-4" /> Navegador de Diretórios
          </DialogTitle>
          <DialogDescription className="text-xs">
            Navegue e selecione o diretório que contém o chart Helm
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div className="relative">
            <ScrollArea className={cn('h-[300px] rounded-md border p-2', isModalLoading && 'opacity-60')}>
              {isModalLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                  <Spinner size="md" />
                </div>
              ) : null}
              
              {rootItems.length === 0 && !isModalLoading ? (
                <div className="flex h-full flex-col items-center justify-center space-y-2 text-xs text-muted-foreground">
                  <p>Nenhum diretório encontrado</p>
                  <p className="text-[10px]">Total de itens: {treeItems.length}</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {rootItems
                    .sort((a, b) => {
                      if (a.type === 'tree' && b.type !== 'tree') {return -1;}

                      if (a.type !== 'tree' && b.type === 'tree') {return 1;}

                      return a.name.localeCompare(b.name);
                    })
                    .map((item) => renderTreeItem(item))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="rounded-md bg-muted/20 p-1.5">
            <div className="flex items-center text-xs">
              <FolderOpen className="mr-1.5 h-3 w-3" />
              <span className="text-xs font-medium">Caminho selecionado:</span>
              <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs">
                {selectedPath || 'Nenhum caminho selecionado'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-7 text-xs">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSelectPath(selectedPath);
              onOpenChange(false);
            }}
            disabled={
              !selectedPath ||
              !treeItems.find((item) => item.path === selectedPath && item.isChartDirectory)
            }
            className="h-7 text-xs"
          >
            Selecionar Caminho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
