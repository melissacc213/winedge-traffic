import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import {
  Stack,
  Text,
  Paper,
  Group,
  Button,
  Box,
  ThemeIcon,
  Card,
  Grid,
  Radio,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconChartBar,
  IconTrain,
  IconUpload,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Dropzone } from "@mantine/dropzone";
import { useRecipeStore } from "../../../lib/store/recipe-store";
import { useUploadVideo } from "../../../lib/queries/recipe";
import useImage from "use-image";
import { useTheme } from "../../../providers/theme-provider";
import type { TaskType, FrameData } from "../../../types/recipe";

const STAGE_WIDTH = 600;
const STAGE_HEIGHT = 400;

export function TaskTypeWithVideoStep() {
  const { t } = useTranslation(["recipes", "common"]);
  const { formValues, setTaskType, setVideo, updateForm } = useRecipeStore();
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
    
    if (colorName === 'taskTypes') {
      const path = theme.other?.taskTypes?.[index];
      if (path) {
        // If we have a nested path like "blue.5", recursively resolve it
        return getThemeColor(path);
      }
      return colorPath;
    }
    
    // Standard color from theme colors
    return theme.colors?.[colorName]?.[Number(index)] || colorPath;
  };

  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(
    formValues.videoFile || null
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<FrameData | null>(
    formValues.extractedFrame ? JSON.parse(formValues.extractedFrame) : null
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uploadVideo = useUploadVideo();
  const [konvaImage] = useImage(capturedFrame?.imageDataUrl || "");

  const taskTypes = [
    {
      id: "trafficStatistics" as TaskType,
      label: t("recipes:creation.taskType.types.trafficStatistics"),
      icon: <IconChartBar size={24} />,
      color: "teal",
      description: t(
        "recipes:creation.taskType.descriptions.trafficStatistics"
      ),
    },
    {
      id: "trainDetection" as TaskType,
      label: t("recipes:creation.taskType.types.trainDetection"),
      icon: <IconTrain size={24} />,
      color: "indigo",
      description: t("recipes:creation.taskType.descriptions.trainDetection"),
    },
  ];

  const handleCaptureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = STAGE_WIDTH;
      canvas.height = STAGE_HEIGHT;
      ctx.drawImage(video, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      const imageDataUrl = canvas.toDataURL("image/png");
      const frame: FrameData = {
        imageDataUrl,
        frameTime: video.currentTime,
        objects: [],
      };
      setCapturedFrame(frame);
      updateForm({
        extractedFrame: JSON.stringify(frame),
        extractedFrameTime: frame.frameTime,
      });
    }
  };

  const stepFrame = (direction: "forward" | "backward") => {
    const video = videoRef.current;
    if (!video) return;
    const fps = 25;
    const delta = 1 / fps;
    video.currentTime += direction === "forward" ? delta : -delta;
  };

  const handleFileChange = (file: File) => {
    setSelectedVideoFile(file);
    const localUrl = URL.createObjectURL(file);
    setVideoUrl(localUrl);
    uploadVideo.mutate(file, {
      onSuccess: (videoId) => {
        setVideo(videoId, file);
      },
    });
  };

  return (
    <Paper withBorder p="md" radius="md">
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <Title order={3}>{t("recipes:creation.taskType.title")}</Title>
            <Text size="sm" c="dimmed">
              {t("recipes:creation.taskType.description")}
            </Text>
            <Radio.Group
              value={formValues.taskType}
              onChange={(val) => setTaskType(val as TaskType)}
            >
              <Stack>
                {taskTypes.map((item) => (
                  <Paper
                    withBorder
                    key={item.id}
                    p="md"
                    radius="md"
                    onClick={() => setTaskType(item.id)}
                    style={{
                      cursor: "pointer",
                      borderColor:
                        formValues.taskType === item.id ? getThemeColor(`${mantineTheme.primaryColor}.5`) : undefined,
                    }}
                  >
                    <Group>
                      <ThemeIcon color={item.color} variant="light">
                        {item.icon}
                      </ThemeIcon>
                      <Box style={{ flex: 1 }}>
                        <Text fw={500}>{item.label}</Text>
                        <Text size="xs" c="dimmed">
                          {item.description}
                        </Text>
                      </Box>
                      <Radio value={item.id} />
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Radio.Group>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack>
            <Group justify="space-between">
              <div>
                <Title order={3}>
                  {t("recipes:creation.importVideo.title")}
                </Title>
                <Text size="sm" c="dimmed">
                  {t("recipes:creation.importVideo.description")}
                </Text>
              </div>
              {videoUrl && (
                <Button
                  variant="outline"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => {
                    setSelectedVideoFile(null);
                    setCapturedFrame(null);
                    setVideo("", null);
                  }}
                >
                  {t("common:button.change")}
                </Button>
              )}
            </Group>

            {videoUrl && capturedFrame ? (
              <Card withBorder radius="md" p="lg">
                <Stage
                  width={STAGE_WIDTH}
                  height={STAGE_HEIGHT}
                  style={{
                    background: colorScheme === 'dark' ? getThemeColor("gray.8") : getThemeColor("gray.1"),
                    cursor: "grab",
                  }}
                >
                  <Layer>
                    {konvaImage && (
                      <KonvaImage
                        image={konvaImage}
                        width={STAGE_WIDTH}
                        height={STAGE_HEIGHT}
                      />
                    )}
                  </Layer>
                </Stage>
              </Card>
            ) : videoUrl ? (
              <Card withBorder radius="md" p="lg">
                <Stack
                  gap="md"
                  p="md"
                  style={{
                    borderRadius: 12,
                    backgroundColor: colorScheme === 'dark' ? getThemeColor("gray.8") : getThemeColor("gray.0"),
                    boxShadow: `0 4px 12px ${getThemeColor("ui.shadow")}`,
                  }}
                >
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    style={{
                      width: STAGE_WIDTH,
                      height: STAGE_HEIGHT,
                      backgroundColor: colorScheme === 'dark' ? getThemeColor("gray.9") : "#000",
                      borderRadius: 8,
                      boxShadow: `0 2px 8px ${getThemeColor("ui.shadow")}`,
                    }}
                  />

                  <Group justify="space-between" mt="sm">
                    <Group gap="xs">
                      <Button
                        leftSection={<IconChevronLeft size={16} />}
                        size="sm"
                        variant="outline"
                        onClick={() => stepFrame("backward")}
                      >
                        Prev Frame
                      </Button>
                      <Button
                        rightSection={<IconChevronRight size={16} />}
                        size="sm"
                        variant="outline"
                        onClick={() => stepFrame("forward")}
                      >
                        Next Frame
                      </Button>
                    </Group>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCaptureFrame}
                    >
                      {t(
                        "recipes:creation.importVideo.captureNow",
                        "Capture Frame Now"
                      )}
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ) : (
              <Dropzone
                onDrop={(files) => handleFileChange(files[0])}
                accept={["video/mp4"]}
                maxSize={500 * 1024 * 1024}
                styles={{
                  root: {
                    border: `2px dashed ${colorScheme === 'dark' ? getThemeColor("gray.6") : getThemeColor("gray.3")}`,
                    borderRadius: "12px",
                    padding: "40px",
                    backgroundColor: colorScheme === 'dark' ? getThemeColor("gray.8") : getThemeColor("gray.0"),
                    cursor: "pointer",
                  },
                }}
              >
                <Group
                  align="center"
                  justify="center"
                  style={{ flexDirection: "column", minHeight: 240 }}
                  gap="sm"
                >
                  <ThemeIcon size={64} radius="xl" variant="light" color="blue">
                    <IconUpload size={32} />
                  </ThemeIcon>
                  <Text size="md" fw={500}>
                    {t(
                      "recipes:creation.importVideo.dragDrop",
                      "Drag & drop video here"
                    )}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("recipes:creation.importVideo.or", "or")}
                  </Text>
                  <Button variant="light" color="blue" size="sm">
                    {t("recipes:creation.importVideo.browse", "Browse Files")}
                  </Button>
                </Group>
              </Dropzone>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
