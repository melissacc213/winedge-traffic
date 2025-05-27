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
} from "@mantine/core";
import {
  IconChartBar,
  IconTrain,
  IconUpload,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconVideo,
  IconCheck,
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

  // Check if step is complete
  const isStepComplete = !!(
    formValues.taskType &&
    formValues.videoId &&
    formValues.extractedFrame
  );

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
              value={formValues.taskType || ""}
              onChange={(val) => {
                if (formValues.extractedFrame && val !== formValues.taskType) {
                  setPendingTaskType(val as TaskType);
                  setShowTaskChangeModal(true);
                } else {
                  setTaskType(val as TaskType);
                }
              }}
            >
              <Stack gap="sm">
                {taskTypes.map((item) => (
                  <Radio.Card
                    key={item.id}
                    value={item.id}
                    radius="md"
                    p="md"
                    style={{
                      cursor: "pointer",
                      border:
                        formValues.taskType === item.id
                          ? `2px solid ${mantineTheme.colors[item.color][5]}`
                          : undefined,
                      backgroundColor:
                        formValues.taskType === item.id
                          ? colorScheme === "dark"
                            ? mantineTheme.colors.dark[6]
                            : mantineTheme.colors.gray[0]
                          : undefined,
                      transition: "all 200ms ease",
                    }}
                  >
                    <Group wrap="nowrap">
                      <Radio.Indicator />
                      <ThemeIcon
                        color={item.color}
                        variant={
                          formValues.taskType === item.id ? "filled" : "light"
                        }
                        size="lg"
                      >
                        {item.icon}
                      </ThemeIcon>
                      <Box style={{ flex: 1 }}>
                        <Text fw={formValues.taskType === item.id ? 600 : 500}>
                          {item.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {item.description}
                        </Text>
                      </Box>
                    </Group>
                  </Radio.Card>
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
                  {formValues.taskType
                    ? t("recipes:creation.importVideo.description")
                    : "Please select a task type first"}
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
                    updateForm({
                      extractedFrame: null,
                      extractedFrameTime: null,
                    });
                  }}
                >
                  {t("common:button.change")}
                </Button>
              )}
            </Group>

            {!formValues.taskType ? (
              <Card
                withBorder
                radius="md"
                p="xl"
                style={{
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    colorScheme === "dark"
                      ? getThemeColor("gray.8")
                      : getThemeColor("gray.0"),
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                    <IconVideo size={32} />
                  </ThemeIcon>
                  <Text size="lg" fw={500} c="dimmed" ta="center">
                    Select a task type to begin video import
                  </Text>
                </Stack>
              </Card>
            ) : videoUrl ? (
              <Card withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Text fw={500}>
                        {capturedFrame ? "Captured Frame" : "Video Preview"}
                      </Text>
                      {capturedFrame && (
                        <Text size="sm" c="dimmed">
                          Time: {capturedFrame.frameTime.toFixed(2)}s
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
                          Back to Video
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<IconRefresh size={14} />}
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
                        Change Video
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
                        leftSection={<IconChevronLeft size={16} />}
                        size="sm"
                        variant="outline"
                        onClick={() => stepFrame("backward")}
                        disabled={!!capturedFrame}
                      >
                        Prev Frame
                      </Button>
                      <Button
                        rightSection={<IconChevronRight size={16} />}
                        size="sm"
                        variant="outline"
                        onClick={() => stepFrame("forward")}
                        disabled={!!capturedFrame}
                      >
                        Next Frame
                      </Button>
                    </Group>

                    <Button
                      size="sm"
                      variant={capturedFrame ? "outline" : "filled"}
                      onClick={handleCaptureFrame}
                      disabled={!!capturedFrame}
                    >
                      Capture Frame
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
                    padding: "40px",
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

      {/* Step Completion Status */}
      <Box
        mt="md"
        pt="md"
        style={{
          borderTop: `1px solid ${colorScheme === "dark" ? getThemeColor("gray.7") : getThemeColor("gray.2")}`,
        }}
      >
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Step Requirements:
          </Text>
          <Group gap="md">
            <Group gap="xs">
              <ThemeIcon
                size="sm"
                radius="xl"
                color={formValues.taskType ? "green" : "gray"}
                variant={formValues.taskType ? "filled" : "light"}
              >
                {formValues.taskType ? (
                  <IconCheck size={14} />
                ) : (
                  <Text size="xs">1</Text>
                )}
              </ThemeIcon>
              <Text size="sm" c={formValues.taskType ? "green" : "dimmed"}>
                Task Type Selected
              </Text>
            </Group>
            <Group gap="xs">
              <ThemeIcon
                size="sm"
                radius="xl"
                color={formValues.videoId ? "green" : "gray"}
                variant={formValues.videoId ? "filled" : "light"}
              >
                {formValues.videoId ? (
                  <IconCheck size={14} />
                ) : (
                  <Text size="xs">2</Text>
                )}
              </ThemeIcon>
              <Text size="sm" c={formValues.videoId ? "green" : "dimmed"}>
                Video Uploaded
              </Text>
            </Group>
            <Group gap="xs">
              <ThemeIcon
                size="sm"
                radius="xl"
                color={formValues.extractedFrame ? "green" : "gray"}
                variant={formValues.extractedFrame ? "filled" : "light"}
              >
                {formValues.extractedFrame ? (
                  <IconCheck size={14} />
                ) : (
                  <Text size="xs">3</Text>
                )}
              </ThemeIcon>
              <Text
                size="sm"
                c={formValues.extractedFrame ? "green" : "dimmed"}
              >
                Frame Captured
              </Text>
            </Group>
          </Group>
        </Group>
      </Box>

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
    </Paper>
  );
}
