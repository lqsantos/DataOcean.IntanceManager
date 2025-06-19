/**
 * TableView component
 * Provides a hierarchical table interface for editing blueprint values
 * This file now serves as a wrapper around the refactored components
 */

import React from 'react';

import { TableView as RefactoredTableView } from './TableComponents';
import type { TableViewProps } from './TableComponents/TableView';

// Re-export the component with the same interface for backward compatibility
const TableViewWrapper: React.FC<TableViewProps> = (props) => {
  return <RefactoredTableView {...props} />;
};

// Add display name
TableViewWrapper.displayName = 'TableView';

// Export the wrapper as TableView for backward compatibility
export { TableViewWrapper as TableView };
