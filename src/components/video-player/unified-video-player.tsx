import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useCallback,useEffect, useRef, useState } from "react";

import type { FrameData } from "../../types/recipe";
import { Icons } from "../icons";

interface UnifiedVideoPlayerProps {
  file: File | null;
  onFrameCaptured?: (frame: FrameData) => void;
  width?: number;
  height?: number;
  fastMode?: boolean; // Enable ultra-fast conversion mode
}

type LoadingState =
  | "idle"
  | "loading-ffmpeg"
  | "processing-video"
  | "ready"
  | "error";

interface LoadingStatus {
  state: LoadingState;
  progress: number;
  message: string;
}

// Video cache to store processed videos with cleanup tracking
interface CachedVideo {
  url: string;
  timestamp: number;
}

const videoCache = new Map<string, CachedVideo>();
const MAX_CACHE_SIZE = 10; // Maximum number of videos to cache
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function UnifiedVideoPlayer({
  file,
  onFrameCaptured,
  width = 500,
  height = 300,
  fastMode = false,
}: UnifiedVideoPlayerProps) {
  // Unified loading state
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
    message: "",
    progress: 0,
    state: "idle",
  });

  // Video state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';

  // Refs
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegLoadedRef = useRef(false);
  const currentFileRef = useRef<File | null>(null);

  // Initialize FFmpeg once
  useEffect(() => {
    const initFFmpeg = async () => {
      if (ffmpegLoadedRef.current) return;

      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

        // Set up event listeners
        ffmpeg.on("log", () => {});

        ffmpeg.on("progress", ({ progress }) => {
          setLoadingStatus((prev) => ({
            ...prev,
            progress: Math.round(progress * 100),
          }));
        });

        // Load FFmpeg
        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript"
          ),
        });

        ffmpegLoadedRef.current = true;
      } catch (error) {
        console.error("Failed to initialize FFmpeg:", error);
      }
    };

    initFFmpeg();
  }, []);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up expired cache entries on unmount
      const now = Date.now();
      videoCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION) {
          URL.revokeObjectURL(value.url);
          videoCache.delete(key);
        }
      });
    };
  }, []);

  // Process video when file changes
  useEffect(() => {
    if (!file) {
      setVideoUrl(null);
      setLoadingStatus({ message: "", progress: 0, state: "idle" });
      currentFileRef.current = null;
      return;
    }

    // Skip if it's the same file
    if (currentFileRef.current === file) {
      return;
    }

    currentFileRef.current = file;
    processVideo(file);
  }, [file]);

  const processVideo = async (videoFile: File) => {
    try {
      // Create a unique key for this file
      const fileKey = `${videoFile.name}_${videoFile.size}_${videoFile.lastModified}`;

      // Check if we have a cached URL for this file
      const cached = videoCache.get(fileKey);
      if (cached) {
        // Check if cache is still valid
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          setVideoUrl(cached.url);
          setLoadingStatus({
            message: "Video loaded from cache",
            progress: 100,
            state: "ready",
          });
          return;
        } else {
          // Cache expired, clean it up
          URL.revokeObjectURL(cached.url);
          videoCache.delete(fileKey);
        }
      }

      // Update loading state
      setLoadingStatus({
        message: "Initializing video processor...",
        progress: 0,
        state: "loading-ffmpeg",
      });

      // Ensure FFmpeg is loaded
      if (!ffmpegLoadedRef.current) {
        // Wait for FFmpeg to load
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (ffmpegLoadedRef.current) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
        });
      }

      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("FFmpeg not initialized");

      // For MP4 files, try direct loading first
      if (videoFile.type === "video/mp4" || videoFile.name.endsWith(".mp4")) {
        try {
          const url = URL.createObjectURL(videoFile);

          // Test if video can be played directly
          const testVideo = document.createElement("video");
          testVideo.src = url;

          await new Promise((resolve, reject) => {
            testVideo.onloadedmetadata = () => resolve(true);
            testVideo.onerror = () => reject(new Error("Cannot play directly"));
            setTimeout(() => reject(new Error("Loading timeout")), 3000);
          });

          // If successful, cache and use direct URL
          manageCacheSize();
          videoCache.set(fileKey, { timestamp: Date.now(), url });
          setVideoUrl(url);
          setLoadingStatus({
            message: "Video loaded successfully",
            progress: 100,
            state: "ready",
          });
          return;
        } catch (e) {}
      }

      // Process with FFmpeg
      setLoadingStatus({
        message: "Processing video file...",
        progress: 10,
        state: "processing-video",
      });

      const inputName = videoFile.name;

      // Write file to FFmpeg
      setLoadingStatus((prev) => ({
        ...prev,
        message: "Reading video file...",
        progress: 20,
      }));

      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      // Convert to MP4
      setLoadingStatus((prev) => ({
        ...prev,
        message: "Converting video format...",
        progress: 30,
      }));

      // Optimized conversion parameters based on speed preference
      let ffmpegArgs: string[];

      if (fastMode) {
        // Ultra-fast mode: prioritize speed over quality
        ffmpegArgs = [
          "-i",
          inputName,
          "-c:v",
          "libx264", // H.264 codec
          "-preset",
          "ultrafast", // Fastest possible preset
          "-crf",
          "28", // Lower quality for faster encoding
          "-c:a",
          "aac", // AAC audio
          "-b:a",
          "64k", // Lower audio bitrate
          "-vf",
          "scale=trunc(iw/2)*2:trunc(ih/2)*2", // Ensure even dimensions
          "-movflags",
          "+faststart", // Web optimization
          "-threads",
          "0", // Use all CPU threads
          "-tune",
          "fastdecode", // Fast decoding
          "-f",
          "mp4", // Force MP4 format
          "output.mp4",
        ];
      } else {
        // Balanced mode: good quality with optimized speed
        ffmpegArgs = [
          "-i",
          inputName,
          "-c:v",
          "libx264", // Use H.264 codec for maximum compatibility
          "-preset",
          "veryfast", // Fast encoding preset
          "-crf",
          "23", // Constant Rate Factor for good quality/speed balance
          "-c:a",
          "aac", // AAC audio codec
          "-b:a",
          "128k", // Audio bitrate
          "-vf",
          "scale=trunc(iw/2)*2:trunc(ih/2)*2", // Ensure even dimensions
          "-movflags",
          "+faststart", // Optimize for web streaming
          "-threads",
          "0", // Use all available CPU threads
          "-tune",
          "fastdecode", // Optimize for fast decoding
          "output.mp4",
        ];
      }

      await ffmpeg.exec(ffmpegArgs);

      // Read output
      setLoadingStatus((prev) => ({
        ...prev,
        message: "Finalizing video...",
        progress: 90,
      }));

      const data = await ffmpeg.readFile("output.mp4");
      const videoBlob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(videoBlob);

      // Cache the processed video URL
      manageCacheSize();
      videoCache.set(fileKey, { timestamp: Date.now(), url });

      setVideoUrl(url);
      setLoadingStatus({
        message: "Video ready!",
        progress: 100,
        state: "ready",
      });
    } catch (error) {
      console.error("Video processing error:", error);
      setLoadingStatus({
        message: "Failed to process video. Please try another file.",
        progress: 0,
        state: "error",
      });
    }
  };

  // Manage cache size to prevent memory leaks
  const manageCacheSize = () => {
    if (videoCache.size >= MAX_CACHE_SIZE) {
      // Find and remove the oldest entry
      let oldestKey = "";
      let oldestTime = Date.now();

      videoCache.forEach((value, key) => {
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          oldestKey = key;
        }
      });

      if (oldestKey) {
        const cached = videoCache.get(oldestKey);
        if (cached) {
          URL.revokeObjectURL(cached.url);
        }
        videoCache.delete(oldestKey);
      }
    }
  };

  const handleCaptureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !onFrameCaptured) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);

    const frame: FrameData = {
      frameTime: video.currentTime,
      imageDataUrl: canvas.toDataURL("image/jpeg", 0.95),
      objects: [],
    };

    onFrameCaptured(frame);
  }, [width, height, onFrameCaptured]);

  // Render empty state
  if (!file) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ minHeight: height }}>
        <Center h={height}>
          <Stack align="center" gap="md">
            <ThemeIcon size={64} radius="xl" variant="light" color="gray">
              <Icons.Video size={32} />
            </ThemeIcon>
            <Stack align="center" gap="xs">
              <Text fw={600} size="lg">
                No Video Selected
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Please upload a video file to continue
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Paper>
    );
  }

  // Render loading state
  if (
    loadingStatus.state === "loading-ffmpeg" ||
    loadingStatus.state === "processing-video"
  ) {
    const isIndeterminate = loadingStatus.progress === 0;

    return (
      <Paper p="xl" radius="md" withBorder style={{ minHeight: height }}>
        <Center h={height}>
          <Stack align="center" gap="lg" w="100%" maw={400}>
            <ThemeIcon size={64} radius="xl" variant="light" color="blue">
              <Loader size={32} />
            </ThemeIcon>

            <Stack align="center" gap="xs" w="100%">
              <Text fw={600} size="lg">
                {loadingStatus.state === "loading-ffmpeg"
                  ? "Preparing Video Player"
                  : "Processing Video"}
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {loadingStatus.message}
              </Text>
            </Stack>

            <Box w="100%">
              {isIndeterminate ? (
                <Progress value={0} size="lg" radius="xl" animated striped color="blue" />
              ) : (
                <Progress
                  value={loadingStatus.progress}
                  size="lg"
                  radius="xl"
                  animated
                  striped
                  color="blue"
                />
              )}
              <Text size="xs" ta="center" mt="xs" c="dimmed">
                {isIndeterminate
                  ? "Processing..."
                  : `${loadingStatus.progress}% complete`}
              </Text>
            </Box>
          </Stack>
        </Center>
      </Paper>
    );
  }

  // Render error state
  if (loadingStatus.state === "error") {
    return (
      <Paper p="xl" radius="md" withBorder style={{ minHeight: height }}>
        <Center h={height}>
          <Stack align="center" gap="md">
            <ThemeIcon size={64} radius="xl" variant="light" color="red">
              <Icons.AlertCircle size={32} />
            </ThemeIcon>
            <Stack align="center" gap="xs">
              <Text fw={600} size="lg" c="red">
                Processing Failed
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {loadingStatus.message}
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Paper>
    );
  }

  // Render video player
  return (
    <Stack gap="sm">
      <Paper
        p={0}
        radius="md"
        withBorder
        style={{
          backgroundColor: isDark
            ? theme.colors.dark[8]
            : theme.colors.gray[0],
          overflow: "hidden",
        }}
      >
        {videoUrl && (
          <Box pos="relative">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              width={width}
              height={height}
              style={{
                backgroundColor: isDark
                  ? theme.colors.dark[9]
                  : theme.colors.gray[1],
                display: "block",
                height: "auto",
                maxHeight: height,
                objectFit: "contain",
                width: "100%",
              }}
              onLoadedMetadata={() => {
                // Video loaded successfully
              }}
              onTimeUpdate={() => {
                // Time update handled by browser
              }}
              onSeeked={() => {
                // Seeking completed
              }}
              crossOrigin="anonymous"
            />
          </Box>
        )}
      </Paper>

      {/* Controls */}
      <Paper p="sm" radius="md" withBorder>
        <Group justify="end" align="center">
          {/* <Group gap="xs">
            <Text size="sm" fw={600}>
              Video Controls
            </Text>
            <Text size="xs" c="dimmed">
              {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
            </Text>
          </Group> */}

          <Tooltip label="Capture current frame" withArrow>
            <Button
              size="sm"
              leftSection={<Icons.Camera size={16} />}
              onClick={handleCaptureFrame}
              disabled={!videoUrl || !onFrameCaptured}
              variant="filled"
            >
              Capture Frame
            </Button>
          </Tooltip>
        </Group>
      </Paper>
    </Stack>
  );
}
