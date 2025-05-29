import { ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { Icons } from '../icons';
import { useNavigate } from 'react-router-dom';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  feature: string;
  resetPath?: string;
}

export function FeatureErrorBoundary({ 
  children, 
  feature,
  resetPath 
}: FeatureErrorBoundaryProps) {
  const navigate = useNavigate();

  return (
    <ErrorBoundary
      fallback={
        <Alert
          icon={<Icons.AlertCircle size={16} />}
          title={`Error in ${feature}`}
          color="red"
          variant="light"
          styles={{ root: { maxWidth: 600, margin: '0 auto' } }}
        >
          <Stack gap="sm">
            <Text size="sm">
              An error occurred while loading this feature. Please try again or contact support if the problem persists.
            </Text>
            <Button.Group>
              <Button
                variant="light"
                size="sm"
                onClick={() => window.location.reload()}
                leftSection={<Icons.Refresh size={14} />}
              >
                Reload Page
              </Button>
              {resetPath && (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => navigate(resetPath)}
                >
                  Go Back
                </Button>
              )}
            </Button.Group>
          </Stack>
        </Alert>
      }
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error(`Error in ${feature}:`, error);
        
        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
          // trackError(error, { feature, errorInfo });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}