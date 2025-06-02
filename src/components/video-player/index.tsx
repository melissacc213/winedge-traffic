import { Box, Center, Loader,Text, useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { forwardRef,useEffect, useRef, useState } from 'react';

import { getVideoPlayerColors } from '@/lib/theme-utils';


interface VideoPlayerProps {
  src?: string;
  file?: File | null;
  height?: number;
  width?: number;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onError?: (error: string) => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  src,
  file,
  height = 300,
  width,
  showControls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  onTimeUpdate,
  onLoadedMetadata,
  onError
}, ref) => {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(src);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const colors = getVideoPlayerColors(theme, isDark);

  // Handle file input
  useEffect(() => {
    if (file) {
      setIsLoading(true);
      setError(null);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (src) {
      setVideoSrc(src);
    }
  }, [file, src]);

  // Handle video events
  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (videoRef.current && onLoadedMetadata) {
      onLoadedMetadata(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    const errorMessage = 'Failed to load video';
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  if (error) {
    return (
      <Box
        style={{
          alignItems: 'center',
          backgroundColor: colors.controlsBackground,
          border: `1px solid ${colors.controlsBorder}`,
          borderRadius: '8px',
          display: 'flex',
          height,
          justifyContent: 'center',
          width: width || '100%'
        }}
      >
        <Text c={isDark ? 'red.4' : 'red.6'} size="sm">
          {error}
        </Text>
      </Box>
    );
  }

  if (isLoading || !videoSrc) {
    return (
      <Box
        style={{
          alignItems: 'center',
          backgroundColor: colors.controlsBackground,
          border: `1px solid ${colors.controlsBorder}`,
          borderRadius: '8px',
          display: 'flex',
          height,
          justifyContent: 'center',
          width: width || '100%'
        }}
      >
        <Center>
          <Loader size="md" color={isDark ? 'blue.4' : 'blue.6'} />
        </Center>
      </Box>
    );
  }

  return (
    <Box
      style={{
        backgroundColor: colors.controlsBackground,
        border: `1px solid ${colors.controlsBorder}`,
        borderRadius: '8px',
        height,
        overflow: 'hidden',
        width: width || '100%'
      }}
    >
      <video
        ref={(element) => {
          if (videoRef) {
            (videoRef as any).current = element;
          }
          if (ref) {
            if (typeof ref === 'function') {
              ref(element);
            } else {
              ref.current = element;
            }
          }
        }}
        src={videoSrc}
        width="100%"
        height="100%"
        controls={showControls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onLoadStart={handleLoadStart}
        style={{
          backgroundColor: colors.background,
          height: '100%',
          objectFit: 'contain',
          width: '100%'
        }}
      />
    </Box>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export * from './ffmpeg-video-player';
export * from './unified-video-player';