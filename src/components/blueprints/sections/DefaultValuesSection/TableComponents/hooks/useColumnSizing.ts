/**
 * Column Sizing Hook
 * Handles automatic column sizing based on content and manual column resizing
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface ColumnSizingState {
  field: number;
  type: number;
  value: number;
  exposed: number;
  overridable: number;
}

interface ColumnMeasurements {
  field: number;
  type: number;
  value: number;
  exposed: number;
  overridable: number;
}

interface UseColumnSizingOptions {
  enableAutoSizing?: boolean;
  enableResizing?: boolean;
  minColumnWidth?: number;
  maxColumnWidth?: number;
}

const DEFAULT_COLUMN_WIDTHS: ColumnSizingState = {
  field: 25,
  type: 6,
  value: 57,
  exposed: 6,
  overridable: 6,
};

const MIN_COLUMN_WIDTH = 8; // Minimum width percentage
const MAX_COLUMN_WIDTH = 70; // Maximum width percentage

export const useColumnSizing = (options: UseColumnSizingOptions = {}) => {
  const {
    enableAutoSizing = true,
    enableResizing = true,
    minColumnWidth = MIN_COLUMN_WIDTH,
    maxColumnWidth = MAX_COLUMN_WIDTH,
  } = options;

  const [columnWidths, setColumnWidths] = useState<ColumnSizingState>(DEFAULT_COLUMN_WIDTHS);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<keyof ColumnSizingState | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);
  const resizeStartPos = useRef<number>(0);
  const resizeStartWidths = useRef<ColumnSizingState>(DEFAULT_COLUMN_WIDTHS);
  const measurementCache = useRef<Map<string, number>>(new Map());

  /**
   * Measure content width for a given text and element type
   */
  const measureTextWidth = useCallback((text: string, className: string = ''): number => {
    const cacheKey = `${text}-${className}`;

    if (measurementCache.current.has(cacheKey)) {
      const cachedWidth = measurementCache.current.get(cacheKey);

      return cachedWidth || 100;
    }

    // Create a temporary element to measure text width
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return 100; // Fallback width
    }

    // Set font properties based on className or default
    if (className.includes('text-xs')) {
      context.font = '12px system-ui';
    } else if (className.includes('text-sm')) {
      context.font = '14px system-ui';
    } else {
      context.font = '14px system-ui';
    }

    const width = context.measureText(text).width;

    measurementCache.current.set(cacheKey, width);

    return width;
  }, []);

  /**
   * Calculate optimal column widths based on content
   */
  const calculateOptimalWidths = useCallback(
    (data: unknown[]): ColumnMeasurements => {
      if (!data || data.length === 0) {
        return { ...DEFAULT_COLUMN_WIDTHS };
      }

      const measurements: ColumnMeasurements = {
        field: 0,
        type: 0,
        value: 0,
        exposed: 0,
        overridable: 0,
      };

      // Sample a reasonable number of rows for performance
      const sampleSize = Math.min(data.length, 50);
      const sampleData = data.slice(0, sampleSize);

      sampleData.forEach((item: unknown) => {
        const typedItem = item as Record<string, unknown>;

        // Measure field name
        if (typedItem.name) {
          const fieldWidth = measureTextWidth(String(typedItem.name), 'text-sm font-medium');

          measurements.field = Math.max(measurements.field, fieldWidth);
        }

        // Measure type
        if (typedItem.type) {
          const typeWidth = measureTextWidth(String(typedItem.type), 'text-xs');

          measurements.type = Math.max(measurements.type, typeWidth);
        }

        // Measure value (convert to string and limit length for performance)
        if (typedItem.value !== undefined && typedItem.value !== null) {
          let valueStr = String(typedItem.value);

          if (valueStr.length > 100) {
            valueStr = `${valueStr.substring(0, 100)}...`;
          }
          const valueWidth = measureTextWidth(valueStr, 'text-sm');

          measurements.value = Math.max(measurements.value, valueWidth);
        }
      });

      // Add padding and convert to percentages
      const totalTableWidth = tableRef.current?.offsetWidth || 1000;
      const padding = 16; // Account for cell padding

      measurements.field = Math.min(((measurements.field + padding) / totalTableWidth) * 100, 40);
      measurements.type = Math.min(((measurements.type + padding) / totalTableWidth) * 100, 15);
      measurements.value = Math.min(((measurements.value + padding) / totalTableWidth) * 100, 60);
      measurements.exposed = 8; // Fixed size for toggles
      measurements.overridable = 8; // Fixed size for toggles

      // Ensure minimum widths
      measurements.field = Math.max(measurements.field, 15);
      measurements.type = Math.max(measurements.type, 6);
      measurements.value = Math.max(measurements.value, 30);

      // Ensure total doesn't exceed 100%
      const total = Object.values(measurements).reduce((sum, width) => sum + width, 0);

      if (total > 100) {
        const scale = 100 / total;

        Object.keys(measurements).forEach((key) => {
          measurements[key as keyof ColumnMeasurements] *= scale;
        });
      }

      return measurements;
    },
    [measureTextWidth]
  );

  /**
   * Auto-size columns based on current data
   */
  const autoSizeColumns = useCallback(
    (data: unknown[]) => {
      if (!enableAutoSizing) {
        return;
      }

      const optimalWidths = calculateOptimalWidths(data);

      setColumnWidths(optimalWidths);
    },
    [enableAutoSizing, calculateOptimalWidths]
  );

  /**
   * Start column resize operation
   */
  const startResize = useCallback(
    (column: keyof ColumnSizingState, clientX: number) => {
      if (!enableResizing) {
        return;
      }

      setIsResizing(true);
      setResizingColumn(column);
      resizeStartPos.current = clientX;
      resizeStartWidths.current = { ...columnWidths };

      // Prevent text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    },
    [enableResizing, columnWidths]
  );

  /**
   * Handle column resize
   */
  const handleResize = useCallback(
    (clientX: number) => {
      if (!isResizing || !resizingColumn) {
        return;
      }

      const deltaX = clientX - resizeStartPos.current;
      const tableWidth = tableRef.current?.offsetWidth || 1000;
      const deltaPercent = (deltaX / tableWidth) * 100;

      const newWidths = { ...resizeStartWidths.current };
      const currentColumn = resizingColumn;

      // Calculate new width for the resizing column
      let newWidth = newWidths[currentColumn] + deltaPercent;

      newWidth = Math.max(minColumnWidth, Math.min(maxColumnWidth, newWidth));

      // Find the next resizable column to adjust
      // Prefer to adjust the value column as it's most flexible
      let adjustColumn: keyof ColumnSizingState = 'value';

      if (currentColumn === 'value') {
        // If value is being resized, adjust field column
        adjustColumn = 'field';
      }

      const widthDiff = newWidth - newWidths[currentColumn];
      let adjustedWidth = newWidths[adjustColumn] - widthDiff;

      adjustedWidth = Math.max(minColumnWidth, adjustedWidth);

      // Apply the changes
      newWidths[currentColumn] = newWidth;
      newWidths[adjustColumn] = adjustedWidth;

      // Ensure total is roughly 100%
      const total = Object.values(newWidths).reduce((sum, width) => sum + width, 0);

      if (Math.abs(total - 100) > 1) {
        const scale = 100 / total;

        Object.keys(newWidths).forEach((key) => {
          newWidths[key as keyof ColumnSizingState] *= scale;
        });
      }

      setColumnWidths(newWidths);
    },
    [isResizing, resizingColumn, minColumnWidth, maxColumnWidth]
  );

  /**
   * End column resize operation
   */
  const endResize = useCallback(() => {
    setIsResizing(false);
    setResizingColumn(null);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  /**
   * Reset columns to default widths
   */
  const resetColumns = useCallback(() => {
    setColumnWidths({ ...DEFAULT_COLUMN_WIDTHS });
  }, []);

  /**
   * Set up event listeners for mouse events
   */
  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleResize(e.clientX);
    };

    const handleMouseUp = () => {
      endResize();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleResize, endResize]);

  /**
   * Convert column widths to CSS styles
   */
  const getColumnStyles = useCallback(() => {
    return {
      field: { width: `${columnWidths.field}%`, minWidth: `${minColumnWidth}%` },
      type: { width: `${columnWidths.type}%`, minWidth: `${minColumnWidth}%` },
      value: { width: `${columnWidths.value}%`, minWidth: `${minColumnWidth}%` },
      exposed: { width: `${columnWidths.exposed}%`, minWidth: `${minColumnWidth}%` },
      overridable: { width: `${columnWidths.overridable}%`, minWidth: `${minColumnWidth}%` },
    };
  }, [columnWidths, minColumnWidth]);

  return {
    columnWidths,
    columnStyles: getColumnStyles(),
    isResizing,
    resizingColumn,
    tableRef,
    startResize,
    autoSizeColumns,
    resetColumns,
    setColumnWidths,
  };
};
