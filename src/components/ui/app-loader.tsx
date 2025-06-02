import { Center, Loader, Transition } from '@mantine/core';
import { useTheme } from '../../providers/theme-provider';

interface AppLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

export function AppLoader({
  size = 'xl',
  fullScreen = true,
}: AppLoaderProps) {
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const content = <Loader size={size} />;

  if (fullScreen) {
    return (
      <Center 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: isDark ? theme.colors.dark?.[8] || theme.colors.gray[9] : theme.white,
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