/**
 * ErrorBoundary component for DefaultValuesSection
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */

import { AlertCircle } from 'lucide-react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { logError } from '@/utils/errorLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Wrap this around components that might throw errors to prevent the entire UI from crashing
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log the error to our error logging service
    logError(error, `Error in DefaultValuesSection: ${info.componentStack}`);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-md border border-red-200 p-4">
          <div className="mb-4 border-b pb-3">
            <h3 className="flex items-center gap-2 text-lg font-medium text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error in Blueprint Values Section
            </h3>
          </div>
          <div className="space-y-4">
            <Alert variant="destructive">
              <div className="mb-2 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                <AlertTitle>Something went wrong</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  An error occurred while rendering this component. Please try again or contact
                  support if the problem persists.
                </p>
                {this.state.error && (
                  <pre className="mb-4 max-h-40 overflow-auto rounded bg-red-50 p-2 text-xs">
                    {this.state.error.message}
                  </pre>
                )}
                <Button onClick={this.resetError}>Try Again</Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * This wrapper allows the class component to access hooks
 */
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />;
}
