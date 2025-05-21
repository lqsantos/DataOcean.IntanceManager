'use client';

import { Check, ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import type { GitTreeItem } from '@/types/template';

interface GitDirectoryBrowserProps {
  treeItems: GitTreeItem[];
  isLoading: boolean;
  selectedPath?: string;
  onSelectPath: (path: string) => void;
  onExpandDirectory: (path: string) => void;
  'data-testid'?: string;
  className?: string;
  height?: string;
}

export function GitDirectoryBrowser({
  treeItems,
  isLoading,
  selectedPath,
  onSelectPath,
  onExpandDirectory,
  'data-testid': dataTestId = 'git-directory-browser',
  className = '',
  height = 'h-[300px]',
}: GitDirectoryBrowserProps) {
  return (
    <div
      className={`${height} overflow-auto rounded-md border p-3 ${className}`}
      data-testid={dataTestId}
      data-browser-state={isLoading ? 'loading' : treeItems.length === 0 ? 'empty' : 'loaded'}
    >
      <h3 className="mb-2 text-sm font-medium" data-testid={`${dataTestId}-title`}>
        Estrutura de Diretórios
      </h3>
      {isLoading ? (
        <div
          className="flex h-32 items-center justify-center"
          data-testid={`${dataTestId}-loading`}
        >
          <Spinner size="md" />
        </div>
      ) : treeItems.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500" data-testid={`${dataTestId}-empty`}>
          Nenhum item encontrado.
        </div>
      ) : (
        <div className="space-y-1 pl-2" data-testid={`${dataTestId}-items-container`}>
          {treeItems.map((item) => (
            <TreeItem
              key={item.path}
              item={item}
              selectedPath={selectedPath}
              onSelectPath={onSelectPath}
              onExpandDirectory={onExpandDirectory}
              level={0}
              dataTestIdPrefix={dataTestId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeItemProps {
  item: GitTreeItem;
  selectedPath?: string;
  onSelectPath: (path: string) => void;
  onExpandDirectory: (path: string) => void;
  level: number;
  children?: GitTreeItem[];
  dataTestIdPrefix: string;
}

function TreeItem({
  item,
  selectedPath,
  onSelectPath,
  onExpandDirectory,
  level,
  children,
  dataTestIdPrefix,
}: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedPath === item.path;
  const isDirectory = item.type === 'directory';
  const isHelmChart = item.isHelmChart;
  const paddingLeft = `${level * 12}px`;

  // Create a URL-safe ID from the path for testing
  const safePathId = item.path.replace(/\//g, '-').replace(/^-/, '');

  const handleToggle = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
      onExpandDirectory(item.path);
    }
  };

  const handleSelect = () => {
    if (isDirectory && isHelmChart) {
      onSelectPath(item.path);
    }
  };

  return (
    <div data-testid={`${dataTestIdPrefix}-item-container-${safePathId}`}>
      <div
        className={`flex items-center rounded-sm p-1 ${
          isHelmChart
            ? 'cursor-pointer hover:bg-blue-50'
            : isDirectory
              ? 'cursor-pointer hover:bg-gray-50'
              : ''
        } ${isSelected ? 'bg-blue-100' : ''}`}
        style={{ paddingLeft }}
        onClick={handleSelect}
        data-testid={`${dataTestIdPrefix}-item-${safePathId}`}
        data-item-type={isDirectory ? 'directory' : 'file'}
        data-is-helm-chart={isHelmChart ? 'true' : 'false'}
        data-is-selected={isSelected ? 'true' : 'false'}
        data-is-expanded={isDirectory && isExpanded ? 'true' : 'false'}
        data-item-path={item.path}
        data-item-name={item.name}
      >
        <div className="flex items-center" onClick={isDirectory ? handleToggle : undefined}>
          {isDirectory ? (
            <button
              className="mr-1 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              data-testid={`${dataTestIdPrefix}-toggle-${safePathId}`}
              aria-label={isExpanded ? 'Recolher diretório' : 'Expandir diretório'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="ml-5" />
          )}

          {isDirectory ? (
            <Folder
              className={`mr-2 h-4 w-4 ${isHelmChart ? 'text-blue-500' : 'text-gray-500'}`}
              data-testid={`${dataTestIdPrefix}-folder-icon-${safePathId}`}
            />
          ) : (
            <File
              className="mr-2 h-4 w-4 text-gray-500"
              data-testid={`${dataTestIdPrefix}-file-icon-${safePathId}`}
            />
          )}

          <span
            className={`text-sm ${isHelmChart ? 'font-medium text-blue-700' : ''}`}
            data-testid={`${dataTestIdPrefix}-name-${safePathId}`}
          >
            {item.name}
          </span>

          {isHelmChart && (
            <span
              className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600"
              data-testid={`${dataTestIdPrefix}-helm-badge-${safePathId}`}
            >
              Helm Chart
            </span>
          )}

          {isSelected && (
            <Check
              className="ml-2 h-4 w-4 text-blue-600"
              data-testid={`${dataTestIdPrefix}-selected-check-${safePathId}`}
            />
          )}
        </div>
      </div>

      {isDirectory && isExpanded && children && (
        <div className="pl-4" data-testid={`${dataTestIdPrefix}-children-${safePathId}`}>
          {children.map((childItem) => (
            <TreeItem
              key={childItem.path}
              item={childItem}
              selectedPath={selectedPath}
              onSelectPath={onSelectPath}
              onExpandDirectory={onExpandDirectory}
              level={level + 1}
              dataTestIdPrefix={dataTestIdPrefix}
            />
          ))}
        </div>
      )}
    </div>
  );
}
