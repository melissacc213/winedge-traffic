import { Center, Loader, Text, Box, Paper, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface PageLoaderProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullPage?: boolean;
  height?: string | number;
  withBorder?: boolean;
}

export function PageLoader({
  text,
  size = 'md',
  fullPage = false,
  height = fullPage ? '100vh' : 400,
  withBorder = false,
}: PageLoaderProps) {
  const { t } = useTranslation(['common']);
  const displayText = text || t('common:status.loading', 'Loading...');

  const loader = (
    <Center style={{ height: height, width: '100%' }}>
      <Stack align="center" spacing="sm">
        <Loader size={size} />
        {displayText && (
          <Text size="sm" color="dimmed">
            {displayText}
          </Text>
        )}
      </Stack>
    </Center>
  );

  if (withBorder) {
    return <Paper withBorder p="xl">{loader}</Paper>;
  }

  return loader;
}

interface SectionLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  height?: string | number;
  overlay?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function SectionLoader({
  size = 'md',
  text,
  height = '100%',
  overlay = false,
  style,
  className,
}: SectionLoaderProps) {
  const { t } = useTranslation(['common']);
  const displayText = text || t('common:status.loading', 'Loading...');

  return (
    <Box
      style={{
        height,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: overlay ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        backgroundColor: overlay ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
        zIndex: overlay ? 10 : 1,
        backdropFilter: overlay ? 'blur(2px)' : 'none',
        ...style,
      }}
      className={className}
    >
      <Stack align="center" spacing="sm">
        <Loader size={size} />
        {displayText && (
          <Text size="sm" color="dimmed">
            {displayText}
          </Text>
        )}
      </Stack>
    </Box>
  );
}