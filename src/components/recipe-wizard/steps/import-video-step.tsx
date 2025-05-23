import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Image,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import type { FileWithPath } from "@mantine/dropzone";
import { useTranslation } from "react-i18next";
import type { UseFormReturnType } from "@mantine/form";
import type { RecipeFormValues } from "@/hooks/use-recipe-form";
import {
  IconUpload,
  IconX,
  IconCheck,
  IconPlayerPlay,
  IconPlayerPause,
  IconPhotoEdit,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../../providers/theme-provider";

interface ImportVideoStepProps {
  form: UseFormReturnType<RecipeFormValues>;
}

export function ImportVideoStep({ form }: ImportVideoStepProps) {
  const { t } = useTranslation(["recipe", "common"]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExtractingFrame, setIsExtractingFrame] = useState(false);
  const mantineTheme = useMantineTheme();
  const { theme, colorScheme } = useTheme();
  
  // Theme color utility function
  const getThemeColor = (colorPath: string): string => {
    // Parse the color path (e.g., "blue.5" -> theme.colors.blue[5])
    const [colorName, index] = colorPath.split('.');
    
    // Special handling for theme's other properties
    if (colorName === 'ui') {
      return theme.other?.ui?.[index] || colorPath;
    }
    
    if (colorName === 'backgrounds') {
      return theme.other?.backgrounds?.[index] || colorPath;
    }
    
    // Standard color from theme colors
    return theme.colors?.[colorName]?.[Number(index)] || colorPath;
  };

  // Handle file upload
  const handleDrop = (files: FileWithPath[]) => {
    if (files.length > 0) {
      const file = files[0];
      form.setFieldValue("videoFile", file);
      form.setFieldValue("videoUrl", URL.createObjectURL(file));
      form.setFieldValue("videoName", file.name);
      form.setFieldValue("extractedFrame", null);
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Extract current frame from video
  const extractFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    setIsExtractingFrame(true);

    // Pause the video
    video.pause();
    setIsPlaying(false);

    // Draw the current frame on the canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/jpeg");
      form.setFieldValue("extractedFrame", dataUrl);
      form.setFieldValue("extractedFrameTime", video.currentTime);
    }

    setIsExtractingFrame(false);
  };

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Stack gap="lg">
      <Paper 
        withBorder 
        p="md"
        style={{
          backgroundColor: colorScheme === 'dark' ? getThemeColor("gray.9") : "white",
          borderColor: colorScheme === 'dark' ? getThemeColor("gray.7") : undefined
        }}>
        <Title order={4} mb="md">
          {t("recipe:steps.import_video.title")}
        </Title>

        {!form.values.videoFile ? (
          <Dropzone
            onDrop={handleDrop}
            accept={["video/mp4", "video/x-m4v", "video/*"]}
            maxSize={100 * 1024 * 1024} // 100MB
            p="xl"
          >
            <Group
              justify="center"
              gap="xl"
              style={{ minHeight: 220, pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconCheck size={50} stroke={1.5} color="green" />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={50} stroke={1.5} color="red" />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconUpload size={50} stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  {t("recipe:steps.import_video.dropzone_text")}
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  {t("recipe:steps.import_video.dropzone_hint")}
                </Text>
              </div>
            </Group>
          </Dropzone>
        ) : (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>{form.values.videoName}</Text>
              <Button
                variant="outline"
                color="red"
                size="xs"
                onClick={() => {
                  form.setFieldValue("videoFile", null);
                  form.setFieldValue("videoUrl", "");
                  form.setFieldValue("videoName", "");
                  form.setFieldValue("extractedFrame", null);
                }}
              >
                {t("common:action.remove")}
              </Button>
            </Group>

            <Box style={{ position: "relative" }}>
              <video
                ref={videoRef}
                src={form.values.videoUrl}
                controls={false}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  backgroundColor: colorScheme === 'dark' ? getThemeColor("gray.9") : "#000",
                }}
              />

              <Group justify="center" mt="xs">
                <Button
                  variant="filled"
                  leftSection={
                    isPlaying ? (
                      <IconPlayerPause size={20} />
                    ) : (
                      <IconPlayerPlay size={20} />
                    )
                  }
                  onClick={togglePlay}
                >
                  {isPlaying
                    ? t("common:action.pause")
                    : t("common:action.play")}
                </Button>

                <Button
                  variant="filled"
                  color="teal"
                  leftSection={<IconPhotoEdit size={20} />}
                  onClick={extractFrame}
                  loading={isExtractingFrame}
                  disabled={isExtractingFrame}
                >
                  {t("recipe:steps.import_video.extract_frame")}
                </Button>
              </Group>

              <Text size="sm" mt="xs" style={{ textAlign: "center" }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </Box>
          </Stack>
        )}
      </Paper>

      {form.values.extractedFrame && (
        <Paper 
        withBorder 
        p="md"
        style={{
          backgroundColor: colorScheme === 'dark' ? getThemeColor("gray.9") : "white",
          borderColor: colorScheme === 'dark' ? getThemeColor("gray.7") : undefined
        }}>
          <Title order={4} mb="md">
            {t("recipe:steps.import_video.extracted_frame")}
          </Title>
          <Box>
            <Image
              src={form.values.extractedFrame}
              alt="Extracted frame"
              style={{ maxHeight: "400px", width: "auto", margin: "0 auto" }}
            />
            <Text size="sm" mt="xs" style={{ textAlign: "center" }}>
              {t("recipe:steps.import_video.frame_time")}:{" "}
              {formatTime(form.values.extractedFrameTime || 0)}
            </Text>
          </Box>
        </Paper>
      )}

      {/* Hidden canvas for frame extraction */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Stack>
  );
}
