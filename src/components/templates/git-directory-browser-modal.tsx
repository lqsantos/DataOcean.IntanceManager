'use client';

import { ChevronRight, FolderOpen } from 'lucide-react';
import { useState } from 'react';

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
}

export function GitDirectoryBrowserModal({
  open,
  onOpenChange,
  treeItems,
  isLoading,
  onSelectPath,
}: GitDirectoryBrowserModalProps) {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  // Organiza os itens em uma estrutura hierárquica
  const organizeItemsIntoTree = (items: typeof treeItems) => {
    const directoryTree: Record<string, typeof treeItems> = {};

    // Filtrar apenas diretórios
    const directories = items.filter((item) => item.type === 'tree');

    // Agrupar por diretórios pais
    directories.forEach((dir) => {
      const pathParts = dir.path.split('/');
      const parentPath = pathParts.slice(0, -1).join('/');

      if (!directoryTree[parentPath]) {
        directoryTree[parentPath] = [];
      }

      directoryTree[parentPath].push(dir);
    });

    return directoryTree;
  };

  const tree = organizeItemsIntoTree(treeItems);
  const rootItems = tree[''] || [];

  const handleToggleExpand = (path: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleSelectDirectory = (path: string) => {
    setSelectedPath(path);
  };

  const renderDirectory = (item: (typeof treeItems)[0], level = 0) => {
    const isExpanded = expandedPaths[item.path];
    const isSelected = selectedPath === item.path;
    const childItems = tree[item.path] || [];

    return (
      <div key={item.path} className="flex flex-col">
        <div
          className={cn(
            'flex cursor-pointer items-center rounded px-1.5 py-0.5 text-xs hover:bg-gray-100',
            isSelected && 'border-l-2 border-blue-500 bg-blue-50',
            level > 0 && `ml-${level * 3}`
          )}
          onClick={() => {
            handleSelectDirectory(item.path);
            handleToggleExpand(item.path);
          }}
          style={{ marginLeft: `${level * 12}px` }}
        >
          <ChevronRight
            className={cn(
              'mr-1.5 h-3 w-3 transition-transform',
              isExpanded && 'rotate-90 transform'
            )}
          />
          <FolderOpen className="mr-1.5 h-3 w-3 text-amber-500" />
          <span className="text-xs">{item.name}</span>
          {item.isChartDirectory && (
            <Badge variant="secondary" className="ml-1.5 h-4 py-0 text-[10px]">
              Chart
            </Badge>
          )}
        </div>

        {isExpanded && childItems.map((child) => renderDirectory(child, level + 1))}
      </div>
    );
  };

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
          <ScrollArea className="h-[300px] rounded-md border p-2">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner size="sm" />
              </div>
            ) : rootItems.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Nenhum diretório encontrado
              </div>
            ) : (
              <div className="space-y-0.5">{rootItems.map((item) => renderDirectory(item))}</div>
            )}
          </ScrollArea>

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
            disabled={!selectedPath}
            className="h-7 text-xs"
          >
            Selecionar Caminho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
