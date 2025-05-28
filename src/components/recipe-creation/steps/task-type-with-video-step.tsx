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
  Modal,
  Center,
  rem,
} from "@mantine/core";
import { Icons } from "../../icons";
import { Dropzone } from "@mantine/dropzone";
import { useRecipeStore } from "../../../lib/store/recipe-store";
import { useUploadVideo } from "../../../lib/queries/recipe";
import useImage from "use-image";
import { useTheme } from "../../../providers/theme-provider";
import type { TaskType, FrameData } from "../../../types/recipe";

const STAGE_WIDTH = 500;
const STAGE_HEIGHT = 300;

export function TaskTypeWithVideoStep() {
  const { t } = useTranslation(["recipes", "common"]);
  const { formValues, setTaskType, setVideo, updateForm } = useRecipeStore();
  const mantineTheme = useMantineTheme();
  const { theme, colorScheme } = useTheme();

  // Modal states
  const [showVideoChangeModal, setShowVideoChangeModal] = useState(false);
  const [showTaskChangeModal, setShowTaskChangeModal] = useState(false);
  const [pendingTaskType, setPendingTaskType] = useState<TaskType | null>(null);

  // Theme color utility function
  const getThemeColor = (colorPath: string): string => {
    // Parse the color path (e.g., "blue.5" -> theme.colors.blue[5])
    const [colorName, index] = colorPath.split(".");

    // Special handling for theme's other properties
    if (colorName === "ui") {
      return theme.other?.ui?.[index] || colorPath;
    }

    if (colorName === "backgrounds") {
      return theme.other?.backgrounds?.[index] || colorPath;
    }

    if (colorName === "taskTypes") {
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
      label: t("recipes:creation.taskType.types.trafficStatistics", "Traffic Statistics"),
      icon: <Icons.ChartBar size={20} />,
      color: "teal",
      description: t(
        "recipes:creation.taskType.descriptions.trafficStatistics",
        "Analyze and collect traffic flow statistics"
      ),
    },
    {
      id: "trainDetection" as TaskType,
      label: t("recipes:creation.taskType.types.trainDetection", "Train Detection"),
      icon: <Icons.Train size={20} />,
      color: "blue",
      description: t("recipes:creation.taskType.descriptions.trainDetection", "Detect and track trains in railway environments"),
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

  // Check if step is complete
  const isStepComplete = !!(
    formValues.taskType &&
    formValues.videoId &&
    formValues.extractedFrame
  );

  return (
    <Box>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper p="md" radius="md" withBorder>
            <Stack gap="sm">
              <div>
                <Title order={4} fw={600}>{t("recipes:creation.taskType.title", "Select Task Type")}</Title>
                <Text size="sm" c="dimmed" mt="xs">
                  {t("recipes:creation.taskType.description", "Choose the type of analysis task for this recipe")}
                </Text>
              </div>
              <Stack gap="sm">
                {taskTypes.map((item) => (
                  <Paper
                    key={item.id}
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                      cursor: "pointer",
                      borderWidth: 2,
                      borderColor:
                        formValues.taskType === item.id
                          ? mantineTheme.colors[item.color][5]
                          : "transparent",
                      backgroundColor:
                        formValues.taskType === item.id
                          ? colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : mantineTheme.colors[item.color][0]
                          : undefined,
                      transition: "all 200ms ease",
                    }}
                    onClick={() => {
                      if (formValues.extractedFrame && item.id !== formValues.taskType) {
                        setPendingTaskType(item.id);
                        setShowTaskChangeModal(true);
                      } else {
                        setTaskType(item.id);
                      }
                    }}
                  >
                    <Group wrap="nowrap" align="flex-start">
                      <Box
                        style={{
                          width: rem(20),
                          height: rem(20),
                          borderRadius: '50%',
                          border: `2px solid ${formValues.taskType === item.id ? mantineTheme.colors[item.color][5] : mantineTheme.colors.gray[4]}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {formValues.taskType === item.id && (
                          <Box
                            style={{
                              width: rem(10),
                              height: rem(10),
                              borderRadius: '50%',
                              backgroundColor: mantineTheme.colors[item.color][5],
                            }}
                          />
                        )}
                      </Box>
                      <ThemeIcon
                        color={item.color}
                        variant={
                          formValues.taskType === item.id ? "filled" : "light"
                        }
                        size="md"
                        radius="md"
                      >
                        {item.icon}
                      </ThemeIcon>
                      <Box style={{ flex: 1 }}>
                        <Text fw={formValues.taskType === item.id ? 600 : 500} size="sm">
                          {item.label}
                        </Text>
                        <Text size="xs" c="dimmed" mt={2}>
                          {item.description}
                        </Text>
                      </Box>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper p="md" radius="md" withBorder h="100%">
            <Stack h="100%">
              <div>
                <Title order={4} fw={600}>
                  {t("recipes:creation.importVideo.title", "Import Video")}
                </Title>
                <Text size="sm" c="dimmed" mt="xs">
                  {formValues.taskType
                    ? t("recipes:creation.importVideo.description", "Please select a task type first")
                    : t("recipes:creation.importVideo.selectTaskFirst", "Please select a task type first")}
                </Text>
              </div>

              {!formValues.taskType ? (
                <Center style={{ flex: 1, minHeight: 200 }}>
                  <Stack align="center" gap="sm">
                    <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                      <Icons.Video size={32} />
                    </ThemeIcon>
                    <Text size="sm" fw={500} c="dimmed" ta="center">
                      {t("recipes:creation.importVideo.selectTaskToBegin", "Select a task type to begin video import")}
                    </Text>
                  </Stack>
                </Center>
              ) : videoUrl ? (
                <Card withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text fw={600}>
                          {capturedFrame ? t("recipes:creation.importVideo.capturedFrame", "Captured Frame") : t("recipes:creation.importVideo.videoPreview", "Video Preview")}
                        </Text>
                        {capturedFrame && (
                          <Text size="sm" c="dimmed">
                            {t("recipes:creation.importVideo.time", "Time")}: {capturedFrame.frameTime.toFixed(2)}s
                          </Text>
                        )}
                      </Group>
                      <Group gap="xs">
                        {capturedFrame && (
                          <Button
                            size="xs"
                            variant="subtle"
                            onClick={() => setCapturedFrame(null)}
                          >
                            {t("recipes:creation.importVideo.backToVideo", "Back to Video")}
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="subtle"
                          leftSection={<Icons.Refresh size={14} />}
                          onClick={() => {
                            if (formValues.extractedFrame) {
                              setShowVideoChangeModal(true);
                            } else {
                              setSelectedVideoFile(null);
                              setCapturedFrame(null);
                              setVideoUrl(null);
                              setVideo("", null);
                              updateForm({
                                extractedFrame: null,
                                extractedFrameTime: null,
                              });
                            }
                          }}
                        >
                          {t("recipes:creation.importVideo.changeVideo", "Change Video")}
                        </Button>
                      </Group>
                    </Group>

                    {/* Show either video or captured frame */}
                    {capturedFrame ? (
                      <Box
                        style={{
                          position: "relative",
                          width: "100%",
                          maxWidth: STAGE_WIDTH,
                          margin: "0 auto",
                        }}
                      >
                        <Stage
                          width={STAGE_WIDTH}
                          height={STAGE_HEIGHT}
                          style={{
                            background:
                              colorScheme === "dark"
                                ? getThemeColor("gray.8")
                                : getThemeColor("gray.1"),
                            cursor: "grab",
                            border: `2px solid ${colorScheme === "dark" ? getThemeColor("gray.6") : getThemeColor("gray.3")}`,
                            borderRadius: 8,
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
                      </Box>
                    ) : (
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        style={{
                          width: "100%",
                          maxWidth: STAGE_WIDTH,
                          height: "auto",
                          maxHeight: STAGE_HEIGHT,
                          backgroundColor:
                            colorScheme === "dark"
                              ? getThemeColor("gray.9")
                              : "#000",
                          borderRadius: 8,
                          boxShadow: `0 2px 8px ${getThemeColor("ui.shadow")}`,
                          margin: "0 auto",
                          display: "block",
                        }}
                      />
                    )}

                    {/* Controls */}
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Button
                          leftSection={<Icons.ChevronLeft size={16} />}
                          size="sm"
                          variant="outline"
                          onClick={() => stepFrame("backward")}
                          disabled={!!capturedFrame}
                        >
                          {t("recipes:creation.importVideo.prevFrame", "Prev Frame")}
                        </Button>
                        <Button
                          rightSection={<Icons.ChevronRight size={16} />}
                          size="sm"
                          variant="outline"
                          onClick={() => stepFrame("forward")}
                          disabled={!!capturedFrame}
                        >
                          {t("recipes:creation.importVideo.nextFrame", "Next Frame")}
                        </Button>
                      </Group>

                      <Button
                        size="sm"
                        variant={capturedFrame ? "outline" : "filled"}
                        onClick={handleCaptureFrame}
                        disabled={!!capturedFrame}
                        leftSection={capturedFrame ? <Icons.Check size={16} /> : undefined}
                      >
                        {capturedFrame 
                          ? t("recipes:creation.importVideo.frameCaptured", "Frame Captured")
                          : t("recipes:creation.importVideo.captureFrame", "Capture Frame")}
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              ) : (
                <Dropzone
                  onDrop={(files) => handleFileChange(files[0])}
                  accept={["video/mp4"]}
                  maxSize={500 * 1024 * 1024}
                  disabled={!formValues.taskType}
                  styles={{
                    root: {
                      border: `2px dashed ${colorScheme === "dark" ? getThemeColor("gray.6") : getThemeColor("gray.3")}`,
                      borderRadius: "12px",
                      padding: "30px",
                      backgroundColor:
                        colorScheme === "dark"
                          ? getThemeColor("gray.8")
                          : getThemeColor("gray.0"),
                      cursor: formValues.taskType ? "pointer" : "not-allowed",
                      opacity: formValues.taskType ? 1 : 0.6,
                    },
                  }}
                >
                  <Group
                    align="center"
                    justify="center"
                    style={{ flexDirection: "column", minHeight: 200 }}
                    gap="sm"
                  >
                    <ThemeIcon size={64} radius="xl" variant="light" color="blue">
                      <Icons.Video size={32} />
                    </ThemeIcon>
                    <Stack gap="xs" align="center">
                      <Text size="sm" fw={500}>
                        {t(
                          "recipes:creation.importVideo.dragDrop",
                          "Drag & drop video here"
                        )}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {t("recipes:creation.importVideo.or", "or")}
                      </Text>
                      <Button variant="filled" color="blue" size="sm">
                        {t("recipes:creation.importVideo.browse", "Browse Files")}
                      </Button>
                    </Stack>
                  </Group>
                </Dropzone>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Confirmation Modals */}
      <Modal
        opened={showVideoChangeModal}
        onClose={() => setShowVideoChangeModal(false)}
        title="Change Video?"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Changing the video will remove the captured frame. Are you sure you
            want to continue?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setShowVideoChangeModal(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                setSelectedVideoFile(null);
                setCapturedFrame(null);
                setVideoUrl(null);
                setVideo("", null);
                updateForm({
                  extractedFrame: null,
                  extractedFrameTime: null,
                });
                setShowVideoChangeModal(false);
              }}
            >
              Change Video
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={showTaskChangeModal}
        onClose={() => {
          setShowTaskChangeModal(false);
          setPendingTaskType(null);
        }}
        title="Change Task Type?"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Changing the task type will remove the captured frame and video. Are
            you sure you want to continue?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => {
                setShowTaskChangeModal(false);
                setPendingTaskType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (pendingTaskType) {
                  setTaskType(pendingTaskType);
                  setSelectedVideoFile(null);
                  setCapturedFrame(null);
                  setVideoUrl(null);
                  setVideo("", null);
                  updateForm({
                    extractedFrame: null,
                    extractedFrameTime: null,
                  });
                }
                setShowTaskChangeModal(false);
                setPendingTaskType(null);
              }}
            >
              Change Task Type
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}