import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Stack, Text, Title, Paper, Group } from '@mantine/core';
import { Icons } from '../icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean; // Don't crash parent components
  showDetails?: boolean; // Show error details in development
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset error boundary when resetKeys change
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => key !== prevProps.resetKeys?.[idx])) {
        this.resetErrorBoundary();
      }
    }
    
    // Reset when any props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, showDetails = process.env.NODE_ENV === 'development' } = this.props;

    if (hasError && error) {
      // If there's a custom fallback, use it
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI
      return (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <Icons.AlertTriangle size={48} color="red" />
            
            <Title order={3}>Something went wrong</Title>
            
            <Text c="dimmed" ta="center" maw={500}>
              We encountered an unexpected error. The issue has been logged and we'll look into it.
            </Text>

            {showDetails && error && (
              <Alert
                variant="light"
                color="red"
                title="Error Details"
                icon={<Icons.AlertCircle />}
                styles={{ root: { width: '100%' } }}
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>{error.message}</Text>
                  {this.state.errorInfo && (
                    <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </Stack>
              </Alert>
            )}

            <Group>
              <Button
                variant="light"
                onClick={this.resetErrorBoundary}
                leftSection={<Icons.Refresh size={16} />}
              >
                Try Again
              </Button>
              
              <Button
                variant="subtle"
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </Button>
            </Group>

            {errorCount > 2 && (
              <Text size="xs" c="dimmed">
                This error has occurred {errorCount} times. You may need to refresh the page.
              </Text>
            )}
          </Stack>
        </Paper>
      );
    }

    return children;
  }
}

// Convenience wrapper for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Props
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}