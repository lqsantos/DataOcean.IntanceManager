'use client';

import { ChevronRight, File, FolderClosed, FolderOpen, Home, Loader2 } from 'lucide-react';
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
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentItems, setCurrentItems] = useState<typeof treeItems>([]);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setExpandedPaths({});
      setLoadingPaths({});
    }
  }, [open]);

  useEffect(() => {
    if (open && treeItems.length > 0 && currentPath === '' && currentItems.length === 0) {
      setCurrentItems(treeItems);
      setLoadedItems((prev) => ({
        ...prev,
        '': treeItems,
      }));
    }
  }, [open, treeItems, currentPath, currentItems.length]);

  useEffect(() => {
    setIsModalLoading(isLoading);

    if (!isLoading && pendingNavigation !== null) {
      const path = pendingNavigation;

      setPendingNavigation(null);

      if (loadedItems[path]) {
        console.log(`Using cached items for path: ${path}`, loadedItems[path]);
        setCurrentItems(loadedItems[path]);
      } else {
        console.log(`No cached items found for path: ${path}. Using treeItems:`, treeItems);
        setCurrentItems(treeItems);
        setLoadedItems((prev) => ({
          ...prev,
          [path]: treeItems,
        }));
      }
    }
  }, [isLoading, pendingNavigation, loadedItems, treeItems]);

  useEffect(() => {
    if (treeItems.length > 0 && isLoading === false && pendingNavigation === null) {
      console.log(`Caching ${treeItems.length} items for path: ${currentPath}`);
      setLoadedItems((prev) => ({
        ...prev,
        [currentPath]: treeItems,
      }));
      setCurrentItems(treeItems);
    }
  }, [treeItems, currentPath, isLoading, pendingNavigation]);

  const navigateToDirectory = useCallback(
    async (path: string) => {
      console.log(`Navigating to directory: ${path}`);
      setIsModalLoading(true);
      setCurrentPath(path);

      if (loadedItems[path]) {
        console.log(`Using cached items for ${path}`);
        setCurrentItems(loadedItems[path]);
        setIsModalLoading(false);

        return;
      }

      if (onFetchDirectory) {
        try {
          console.log(`Fetching items for ${path}`);
          setPendingNavigation(path);
          await onFetchDirectory(path);
        } catch (error) {
          console.error('Erro ao carregar conteúdo do diretório:', error);
          setPendingNavigation(null);
          setIsModalLoading(false);

          if (loadedItems[currentPath]) {
            setCurrentItems(loadedItems[currentPath]);
          }
        }
      } else {
        setIsModalLoading(false);
      }
    },
    [loadedItems, onFetchDirectory, currentPath]
  );

  const getBreadcrumbParts = useCallback(() => {
    if (!currentPath) {
      return [{ name: '/', path: '' }];
    }

    const parts = currentPath.split('/').filter(Boolean);

    return [
      { name: '/', path: '' },
      ...parts.map((part, index) => ({
        name: part,
        path: parts.slice(0, index + 1).join('/'),
      })),
    ];
  }, [currentPath]);

  const breadcrumbParts = getBreadcrumbParts();

  const handleBreadcrumbClick = useCallback(
    (path: string) => {
      console.log(`Breadcrumb clicked: ${path}`);

      // Defina isso como true para forçar uma busca, independentemente do cache
      const forceFetch = true;

      // Atualiza o path selecionado
      setSelectedPath('');

      if (onFetchDirectory) {
        // Se forceFetch for true, limpe o cache para este caminho
        if (forceFetch) {
          setLoadedItems((prev) => {
            const newCache = { ...prev };

            delete newCache[path];

            return newCache;
          });
        }

        // Sempre navegue diretamente, sem condição adicional
        navigateToDirectory(path);
      }
    },
    [navigateToDirectory, onFetchDirectory]
  );

  const handleSelectDirectory = useCallback(
    (path: string, isDirectory: boolean, isChartDirectory: boolean) => {
      if (isDirectory) {
        setSelectedPath(path);

        // Navegar com um único clique se for diretório
        navigateToDirectory(path);
      }
    },
    [navigateToDirectory]
  );

  const renderTreeItem = useCallback(
    (item: (typeof treeItems)[0], level = 0) => {
      const isSelected = selectedPath === item.path;
      const isDirectory = item.type === 'tree';
      const isLoading = loadingPaths[item.path];

      return (
        <div key={item.path} className="flex flex-col">
          <div
            className={cn(
              'flex cursor-pointer items-center rounded px-1.5 py-1 text-xs hover:bg-gray-100',
              isSelected && 'border-l-2 border-blue-500 bg-blue-50',
              isLoading && 'opacity-70'
            )}
            onClick={() => {
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
                  <FolderClosed className="mr-1.5 h-3 w-3 text-amber-500" />
                )}
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
        </div>
      );
    },
    [selectedPath, loadingPaths, handleSelectDirectory]
  );

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
          <div className="flex items-center overflow-x-auto rounded-md border bg-muted/10 p-1.5 text-xs">
            <div className="flex flex-wrap items-center gap-1">
              {breadcrumbParts.map((part, index) => (
                <div key={part.path} className="flex items-center">
                  {index > 0 && <ChevronRight className="mx-1 h-3 w-3 text-muted-foreground" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 py-0 text-xs hover:bg-muted"
                    onClick={() => handleBreadcrumbClick(part.path)}
                  >
                    {index === 0 ? <Home className="h-3 w-3" /> : part.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <ScrollArea
              className={cn('h-[250px] rounded-md border p-2', isModalLoading && 'opacity-60')}
            >
              {isModalLoading ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                  <Spinner size="md" />
                </div>
              ) : null}

              {currentItems.length === 0 && !isModalLoading ? (
                <div className="flex h-full flex-col items-center justify-center space-y-2 text-xs text-muted-foreground">
                  <p>Nenhum item encontrado neste diretório</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {currentItems
                    .sort((a, b) => {
                      if (a.type === 'tree' && b.type !== 'tree') {
                        return -1;
                      }

                      if (a.type !== 'tree' && b.type === 'tree') {
                        return 1;
                      }

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
