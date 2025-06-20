/**
 * Column Resize Handle Component
 * Provides visual feedback and interaction for column resizing
 */

import React from 'react';

import { cn } from '@/lib/utils';

interface ColumnResizeHandleProps {
  column: string;
  isResizing: boolean;
  onStartResize: (clientX: number) => void;
  className?: string;
}

export const ColumnResizeHandle: React.FC<ColumnResizeHandleProps> = ({
  column,
  isResizing,
  onStartResize,
  className,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStartResize(e.clientX);
  };

  return (
    <div
      className={cn(
        'absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100',
        'hover:bg-blue-400 hover:opacity-100',
        isResizing && 'bg-blue-500 opacity-100',
        className
      )}
      onMouseDown={handleMouseDown}
      title={`Resize ${column} column`}
    >
      {/* Visual indicator line */}
      <div
        className={cn(
          'h-full w-px bg-current transition-colors',
          isResizing ? 'bg-blue-500' : 'bg-gray-300'
        )}
      />
    </div>
  );
};
