import { Center, Loader, Text, Stack, Box, Transition, useMantineTheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../providers/theme-provider';
import { Icons } from '../icons';

interface AppLoaderProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  showLogo?: boolean;
}

export function AppLoader({
  text,
  size = 'xl',
  fullScreen = true,
  showLogo = true,
}: AppLoaderProps) {
  const { t } = useTranslation(['common']);
  const { theme, colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  const displayText = text || t('common:status.loading', 'Loading...');
  const isDark = colorScheme === 'dark';

  const content = <Loader size={size} />;

  if (fullScreen) {
    return (
      <Center 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: isDark ? theme.colors.dark[8] : theme.white,
          zIndex: 9999,
        }}
      >
        <Transition
          mounted={true}
          transition="fade"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <div style={styles}>
              {content}
            </div>
          )}
        </Transition>
      </Center>
    );
  }

  return (
    <Center style={{ height: '100%', width: '100%', minHeight: 400 }}>
      {content}
    </Center>
  );
}