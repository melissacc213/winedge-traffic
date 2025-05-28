import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  Center,
  ActionIcon,
  Tooltip,
  Progress,
  FileButton,
  Alert,
  Flex,
  Paper,
  Divider,
  Transition
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconVolume,
  IconVolumeOff,
  IconMaximize,
  IconUpload,
  IconVideo,
  IconClock,
  IconEye,
  IconSettings,
  IconRefresh
} from '@tabler/icons-react';
import { useTheme } from '@/providers/theme-provider';
import { VideoPlayer } from '@/components/video-player';

interface TaskVideoStreamProps {
  taskId?: string;
  title?: string;
  streamUrl?: string;
  file?: File | null;
  showUpload?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  height?: number;
  onFileUpload?: (file: File) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onFrameCapture?: (timestamp: number) => void;
  onStreamError?: (error: string) => void;
}

export function TaskVideoStream({
  taskId,
  title = "Task Video Stream",
  streamUrl,
  file,
  showUpload = true,
  showControls = true,
  autoPlay = false,
  height = 400,
  onFileUpload,
  onTimeUpdate,
  onFrameCapture,
  onStreamError
}: TaskVideoStreamProps) {
  const { colorScheme, theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileResetRef = useRef<() => void>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(file || null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isDark = colorScheme === 'dark';

  // Theme-aware styles
  const cardBg = isDark ? theme.colors.gray[9] : 'white';
  const borderColor = isDark ? theme.colors.gray[6] : theme.colors.gray[3];
  const textColor = isDark ? theme.colors.gray[0] : theme.colors.gray[9];
  const mutedTextColor = isDark ? theme.colors.gray[4] : theme.colors.gray[6];
  const surfaceBg = isDark ? theme.colors.gray[8] : theme.colors.gray[0];
  const videoBg = isDark ? theme.colors.gray[9] : theme.colors.gray[1];

  // Video control handlers
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const handleFileUpload = useCallback((file: File | null) => {
    if (file) {
      setUploadedFile(file);
      setError(null);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleClearFile = useCallback(() => {
    setUploadedFile(null);
    fileResetRef.current?.();
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback((videoDuration: number) => {
    setDuration(videoDuration);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    if (onStreamError) {
      onStreamError(errorMessage);
    }
  }, [onStreamError]);

  const handleFrameCapture = useCallback(() => {
    if (onFrameCapture) {
      onFrameCapture(currentTime);
    }
  }, [currentTime, onFrameCapture]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Paper
      shadow="sm"
      radius="lg"
      withBorder
      style={{
        backgroundColor: cardBg,
        borderColor: borderColor,
        overflow: 'hidden'
      }}
    >
      <Stack gap="lg" p="lg">
        {/* Header */}
        <Box>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text 
                size="xl" 
                fw={700} 
                c={textColor}
                mb={4}
              >
                {title}
              </Text>
              {taskId && (
                <Text size="sm" c={mutedTextColor} fw={500}>
                  Task ID: {taskId}
                </Text>
              )}
            </Box>
            
            <Group gap="xs">
              <Badge 
                variant={isDark ? 'light' : 'filled'}
                color="blue" 
                leftSection={<IconVideo size={14} />}
                size="lg"
                radius="md"
              >
                {uploadedFile ? 'Uploaded' : streamUrl ? 'Live Stream' : 'Ready'}
              </Badge>
              {duration > 0 && (
                <Badge 
                  variant={isDark ? 'light' : 'filled'}
                  color="teal" 
                  leftSection={<IconClock size={14} />}
                  size="lg"
                  radius="md"
                >
                  {formatTime(duration)}
                </Badge>
              )}
            </Group>
          </Group>
        </Box>

        {/* Upload controls */}
        {showUpload && (
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: surfaceBg,
              border: `1px dashed ${borderColor}`
            }}
          >
            <Group justify="center" gap="md">
              <FileButton
                resetRef={fileResetRef}
                onChange={handleFileUpload}
                accept="video/mp4,video/webm,video/ogg,video/avi,video/mov"
              >
                {(props) => (
                  <Button
                    {...props}
                    leftSection={<IconUpload size={18} />}
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    size="md"
                    radius="md"
                  >
                    Upload Video File
                  </Button>
                )}
              </FileButton>
              
              {uploadedFile && (
                <Button
                  variant="light"
                  color="red"
                  size="md"
                  onClick={handleClearFile}
                  leftSection={<IconRefresh size={18} />}
                  radius="md"
                >
                  Clear File
                </Button>
              )}
            </Group>
          </Paper>
        )}

        {/* Error display */}
        <Transition mounted={!!error} transition="slide-down" duration={200}>
          {(styles) => (
            <Alert 
              color="red" 
              variant={isDark ? "light" : "filled"}
              radius="md"
              style={styles}
            >
              {error}
            </Alert>
          )}
        </Transition>

        {/* Video Player */}
        <Paper
          shadow="md"
          radius="lg"
          style={{
            position: 'relative',
            backgroundColor: videoBg,
            overflow: 'hidden',
            border: `2px solid ${borderColor}`
          }}
        >
          <VideoPlayer
            ref={videoRef}
            src={!uploadedFile ? streamUrl : undefined}
            file={uploadedFile}
            height={height}
            showControls={false}
            autoPlay={autoPlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleError}
          />
          
          {/* Custom overlay controls */}
          {showControls && (
            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: `linear-gradient(transparent, ${theme.other.overlay.gradient})`,
                padding: theme.spacing?.md || '16px',
                backdropFilter: 'blur(4px)'
              }}
            >
              <Stack spacing="xs">
                {/* Progress bar */}
                <Progress
                  value={progress}
                  size="md"
                  color={isDark ? "blue.4" : "blue.6"}
                  radius="xl"
                  style={{ 
                    opacity: duration > 0 ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                />
                
                {/* Control buttons */}
                <Flex justify="space-between" align="center">
                  <Group gap="md">
                    <Tooltip label={isPlaying ? "Pause" : "Play"} position="top">
                      <ActionIcon
                        onClick={handlePlayPause}
                        size="xl"
                        variant="filled"
                        color="blue"
                        radius="xl"
                        style={{
                          backgroundColor: isDark ? theme.colors.blue[6] : theme.colors.blue[5],
                          boxShadow: `0 4px 12px ${theme.other.overlay.blueShadow}`
                        }}
                      >
                        {isPlaying ? <IconPlayerPause size={24} /> : <IconPlayerPlay size={24} />}
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="Stop" position="top">
                      <ActionIcon
                        onClick={handleStop}
                        size="lg"
                        variant="light"
                        color="gray"
                        radius="xl"
                        style={{
                          backgroundColor: theme.other.overlay.lightButton,
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        <IconPlayerStop size={20} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label={isMuted ? "Unmute" : "Mute"} position="top">
                      <ActionIcon
                        onClick={handleMuteToggle}
                        size="lg"
                        variant="light"
                        color="gray"
                        radius="xl"
                        style={{
                          backgroundColor: theme.other.overlay.lightButton,
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        {isMuted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
                      </ActionIcon>
                    </Tooltip>
                    
                    <Box
                      style={{
                        backgroundColor: theme.other.overlay.controls,
                        padding: '6px 12px',
                        borderRadius: theme.radius?.md || '8px',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Text size="sm" c="white" fw={500}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </Text>
                    </Box>
                  </Group>
                  
                  <Group gap="xs">
                    {onFrameCapture && (
                      <Tooltip label="Capture Frame" position="top">
                        <ActionIcon
                          onClick={handleFrameCapture}
                          size="lg"
                          variant="light"
                          color="teal"
                          radius="xl"
                          style={{
                            backgroundColor: theme.other.overlay.lightButton,
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <IconEye size={20} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    
                    <Tooltip label="Fullscreen" position="top">
                      <ActionIcon
                        onClick={handleFullscreen}
                        size="lg"
                        variant="light"
                        color="gray"
                        radius="xl"
                        style={{
                          backgroundColor: theme.other.overlay.lightButton,
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        <IconMaximize size={20} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Flex>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* File info */}
        {uploadedFile && (
          <Paper
            p="sm"
            radius="md"
            style={{
              backgroundColor: surfaceBg,
              border: `1px solid ${borderColor}`
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap="md">
                <Badge variant="dot" color="green" size="lg">
                  Active File
                </Badge>
                <Text size="sm" c={textColor} fw={500}>
                  {uploadedFile.name}
                </Text>
              </Group>
              <Text size="sm" c={mutedTextColor}>
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </Text>
            </Group>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}