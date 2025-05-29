import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { 
  Box, 
  Button, 
  Group, 
  Text, 
  Stack, 
  Paper, 
  Progress, 
  Loader,
  ActionIcon,
  Tooltip,
  Badge,
  Center,
  ThemeIcon,
  useMantineTheme
} from '@mantine/core';
import { useTheme } from '../../providers/theme-provider';
import { Icons } from '../icons';
import type { FrameData } from '../../types/recipe';

interface FFmpegVideoPlayerProps {
  file: File | null;
  onFrameCaptured?: (frame: FrameData) => void;
  width?: number;
  height?: number;
  fastMode?: boolean; // Enable ultra-fast conversion mode
}

export function FFmpegVideoPlayer({ 
  file, 
  onFrameCaptured,
  width = 500,
  height = 300,
  fastMode = false
}: FFmpegVideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcoding, setTranscoding] = useState(false);
  const [transcodeProgress, setTranscodeProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  const { colorScheme, theme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === 'dark';
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const currentFileRef = useRef<File | null>(null);

  // Auto-load FFmpeg when file is provided
  useEffect(() => {
    if (file && !loaded && !loading) {
      loadFFmpeg();
    }
  }, [file, loaded, loading]);

  // Reset state when file changes
  useEffect(() => {
    if (file && file !== currentFileRef.current) {
      currentFileRef.current = file;
      setVideoReady(false);
      setIsProcessingFile(false);
      setTranscodeProgress(0);
      
      // Clear any existing video
      if (videoRef.current) {
        videoRef.current.src = '';
      }
    }
  }, [file]);

  // Load video files after FFmpeg is ready
  useEffect(() => {
    // Only process if we have a file, FFmpeg is loaded, and we haven't processed this file yet
    if (file && 
        loaded && 
        !transcoding && 
        !loading && 
        !videoReady && 
        !isProcessingFile &&
        file === currentFileRef.current) {
      
      setIsProcessingFile(true);
      
      if (file.name.endsWith('.mp4')) {
        // For MP4 files, check if they need transcoding based on codec
        const checkAndLoadMP4 = async () => {
          try {
            // Try to load directly first
            const url = URL.createObjectURL(file);
            if (videoRef.current) {
              videoRef.current.src = url;
              
              // Set up event handlers
              videoRef.current.onloadedmetadata = () => {
                setVideoReady(true);
                setIsProcessingFile(false);
              };
              
              videoRef.current.onerror = () => {
                // If direct loading fails, process it
                transcode();
              };
            }
          } catch (error) {
            console.error('Error loading video:', error);
            // Fall back to processing
            transcode();
          }
        };
        
        checkAndLoadMP4();
      } else {
        // For non-MP4 files, always transcode
        transcode();
      }
    }
  }, [file, loaded, transcoding, loading, videoReady, isProcessingFile]);

  // Load FFmpeg core automatically in background
  const loadFFmpeg = async () => {
    if (loading || loaded) return;
    
    setLoading(true);
    setLoadingMessage('Processing video...');
    
    try {
      // Use the latest multi-threaded core for better performance
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
      const ffmpeg = ffmpegRef.current;
      
      // Listen to log event like in the example
      ffmpeg.on("log", ({ message }) => {
        // Extract more detailed progress information from logs
        const progressMatch = message.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d+)/);
        if (progressMatch && messageRef.current) {
          const time = `${progressMatch[1]}:${progressMatch[2]}:${progressMatch[3]}`;
          setLoadingMessage(`Converting: ${time} processed`);
        }
      });
      
      setLoadingMessage('Loading FFmpeg...');
      
      // Load with multi-threaded core and worker for maximum performance
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
      });
      
      setLoaded(true);
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      setLoadingMessage('Failed to load FFmpeg');
    } finally {
      setLoading(false);
    }
  };

  const transcode = async () => {
    if (!file || !loaded || transcoding || videoReady) {
      return;
    }
    
    setTranscoding(true);
    setTranscodeProgress(0);
    setLoadingMessage('Processing video...');
    
    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = file.name;
      let totalDuration = 0;
      
      // Add progress listener
      ffmpeg.on('progress', ({ progress, time }) => {
        // Progress is a value between 0 and 1
        const percent = Math.round(progress * 100);
        setTranscodeProgress(percent);
        
        // Parse time from log messages
        if (time) {
          const seconds = time / 1000000; // Convert from microseconds
          setLoadingMessage(`Converting: ${seconds.toFixed(1)}s processed`);
        }
      });
      
      // Also parse log messages for more detailed progress
      ffmpeg.on('log', ({ message }) => {
        // Extract time from log message like "time=00:01:51.48"
        const timeMatch = message.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d+)/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const seconds = parseFloat(timeMatch[3]);
          const currentTime = hours * 3600 + minutes * 60 + seconds;
          
          // If we don't know total duration, estimate based on current progress
          if (totalDuration === 0 && currentTime > 0) {
            // Estimate total duration (this is approximate)
            totalDuration = currentTime * 2; // Rough estimate
          }
          
          if (totalDuration > 0) {
            const percent = Math.min(95, Math.round((currentTime / totalDuration) * 100));
            setTranscodeProgress(percent);
          }
        }
      });
      
      setLoadingMessage('Reading video file...');
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      setLoadingMessage('Converting to MP4...');
      
      // Different conversion parameters based on speed preference
      let ffmpegArgs: string[];
      
      if (fastMode) {
        // Ultra-fast mode: prioritize speed over quality
        ffmpegArgs = [
          "-i", inputName,
          "-c:v", "libx264",           // H.264 codec
          "-preset", "ultrafast",      // Fastest possible preset
          "-crf", "28",               // Lower quality for faster encoding
          "-c:a", "aac",              // AAC audio
          "-b:a", "64k",              // Lower audio bitrate
          "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", // Ensure even dimensions
          "-movflags", "+faststart",   // Web optimization
          "-threads", "0",            // Use all CPU threads
          "-tune", "fastdecode",      // Fast decoding
          "-f", "mp4",               // Force MP4 format
          "output.mp4"
        ];
      } else {
        // Balanced mode: good quality with optimized speed
        ffmpegArgs = [
          "-i", inputName,
          "-c:v", "libx264",           // Use H.264 codec for maximum compatibility
          "-preset", "veryfast",       // Fast encoding preset
          "-crf", "23",               // Constant Rate Factor for good quality/speed balance
          "-c:a", "aac",              // AAC audio codec
          "-b:a", "128k",             // Audio bitrate
          "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", // Ensure even dimensions
          "-movflags", "+faststart",   // Optimize for web streaming
          "-threads", "0",            // Use all available CPU threads
          "-tune", "fastdecode",      // Optimize for fast decoding
          "output.mp4"
        ];
      }
      
      await ffmpeg.exec(ffmpegArgs);
      
      setLoadingMessage('Finalizing...');
      setTranscodeProgress(98);
      
      const fileData = await ffmpeg.readFile("output.mp4");
      const data = new Uint8Array(fileData as ArrayBuffer);
      
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(
          new Blob([data.buffer], { type: "video/mp4" })
        );
        setVideoReady(true);
      }
      
      setLoadingMessage('Video ready!');
      setTranscodeProgress(100);
      setIsProcessingFile(false); // Mark processing as complete
      // Clean up listeners
      ffmpeg.off('progress');
      
      setLoadingMessage('');
      setIsProcessingFile(false);
      setTranscodeProgress(100);
    } catch (error: any) {
      console.error('Transcoding failed:', error);
      setLoadingMessage(error.message || 'Failed to process video');
      setIsProcessingFile(false);
      
      // Try direct loading for MP4 files if transcode fails
      if (file.name.endsWith('.mp4') && videoRef.current) {
        const url = URL.createObjectURL(file);
        videoRef.current.src = url;
      }
    } finally {
      // Clean up listeners
      ffmpegRef.current.off('progress');
      
      setTimeout(() => {
        setTranscoding(false);
        setTranscodeProgress(0);
      }, 500);
    }
  };

  const handleCaptureFrame = () => {
    const video = videoRef.current;
    
    if (!video || !onFrameCaptured) return;

    try {
      // Create a canvas to capture the frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);
      const imageDataUrl = canvas.toDataURL('image/png');

      const frame: FrameData = {
        imageDataUrl,
        frameTime: video.currentTime,
        objects: [],
      };

      onFrameCaptured(frame);
    } catch (err) {
      console.error('Frame capture failed:', err);
    }
  };

  const stepFrame = (direction: 'forward' | 'backward') => {
    const video = videoRef.current;
    if (!video) return;

    const stepSize = 1 / 30; // 1 frame at 30fps
    const newTime = direction === 'forward' 
      ? video.currentTime + stepSize 
      : video.currentTime - stepSize;
    
    video.currentTime = Math.max(0, Math.min(newTime, duration));
  };

  // Show placeholder when no file is provided
  if (!file) {
    return (
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <ThemeIcon size={64} radius="xl" variant="light" color="gray">
            <Icons.Video size={32} />
          </ThemeIcon>
          
          <Stack align="center" gap="xs">
            <Text fw={600} size="lg">Video Player</Text>
            <Text size="sm" c="dimmed" ta="center">
              Upload a video file to start processing
            </Text>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  // Show unified loading state
  if ((loading || transcoding) && !videoReady) {
    const isIndeterminate = transcoding && transcodeProgress === 0;
    
    return (
      <>
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <ThemeIcon size={64} radius="xl" variant="light" color="blue">
              <Loader size={32} />
            </ThemeIcon>
            
            <Stack align="center" gap="xs">
              <Group gap="xs" align="center">
                <Text fw={600} size="lg">
                  Processing Video
                </Text>
                {fastMode && (
                  <Badge size="xs" color="orange" variant="light">
                    FAST MODE
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed" ta="center">
                {loadingMessage || 'Please wait while we prepare your video'}
              </Text>
              {fastMode && (
                <Text size="xs" c="dimmed" ta="center">
                  Using ultra-fast conversion settings
                </Text>
              )}
            </Stack>
            
            {/* Progress bar */}
            <Box w="100%" maw={300}>
              <Progress 
                value={isIndeterminate ? undefined : (loading ? 30 : transcodeProgress)} 
                size="lg" 
                radius="xl"
                animated={!isIndeterminate}
                striped={!isIndeterminate}
                indeterminate={isIndeterminate ? true : undefined}
                color="blue"
              />
              <Text size="xs" ta="center" mt="xs" c="dimmed">
                {isIndeterminate ? 'Processing...' : loading ? 'Initializing...' : `${transcodeProgress}% complete`}
              </Text>
            </Box>
          </Stack>
        </Paper>
        
        {/* Hidden video element to allow loading during processing */}
        <video 
          ref={videoRef}
          style={{ display: 'none' }}
          width={width}
          height={height}
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video) {
              setDuration(video.duration);
              setVideoReady(true);
            }
          }}
        />
      </>
    );
  }

  // Main video player UI
  return (
    <Stack gap="md">
      {/* Video Container */}
      <Paper p="sm" radius="md" withBorder style={{ backgroundColor: isDark ? mantineTheme.colors.dark[8] : mantineTheme.colors.gray[0] }}>
        <Box pos="relative">
          <video 
            ref={videoRef} 
            controls
            width={width}
            height={height}
            onLoadedMetadata={() => {
              const video = videoRef.current;
              if (video) {
                setDuration(video.duration);
                setVideoReady(true);
              }
            }}
            onTimeUpdate={() => {
              const video = videoRef.current;
              if (video) {
                setCurrentTime(video.currentTime);
              }
            }}
            style={{
              width: '100%',
              maxWidth: width,
              height: 'auto',
              borderRadius: 8,
              backgroundColor: theme.other.backgrounds.videoPlayer,
            }}
          />
          
        </Box>
      </Paper>

      {/* Frame Control Panel */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm">Frame Controls</Text>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {currentTime.toFixed(2)}s
              </Text>
              <Text size="xs" c="dimmed">/</Text>
              <Text size="xs" c="dimmed">
                {duration.toFixed(2)}s
              </Text>
            </Group>
          </Group>

          <Group justify="space-between">
            {/* Frame Navigation */}
            <Group gap="xs">
              <Tooltip label="Previous frame">
                <ActionIcon
                  variant="light"
                  size="lg"
                  onClick={() => stepFrame('backward')}
                  disabled={!videoReady}
                >
                  <Icons.ChevronLeft size={18} />
                </ActionIcon>
              </Tooltip>
              
              <Tooltip label="Next frame">
                <ActionIcon
                  variant="light"
                  size="lg"
                  onClick={() => stepFrame('forward')}
                  disabled={!videoReady}
                >
                  <Icons.ChevronRight size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
            
            {/* Capture Button */}
            <Tooltip label="Capture current frame">
              <Button
                leftSection={<Icons.Camera size={18} />}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                size="sm"
                onClick={handleCaptureFrame}
                disabled={!videoReady || !onFrameCaptured}
              >
                Capture Frame
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}