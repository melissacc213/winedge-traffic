import { Center, Loader, Transition, useComputedColorScheme,useMantineTheme } from '@mantine/core';

interface AppLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

export function AppLoader({
  size = 'xl',
  fullScreen = true,
}: AppLoaderProps) {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';

  const content = <Loader size={size} />;

  if (fullScreen) {
    return (
      <Center 
        style={{
          backgroundColor: isDark ? theme.colors.gray[9] : theme.white,
          inset: 0,
          position: 'fixed',
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
    <Center style={{ height: '100%', minHeight: 400, width: '100%' }}>
      {content}
    </Center>
  );
}