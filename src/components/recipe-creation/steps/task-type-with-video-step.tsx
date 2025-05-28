import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect } from "react";
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
import useImage from "use-image";
import { useTheme } from "../../../providers/theme-provider";
import type { TaskType, FrameData } from "../../../types/recipe";
import { UnifiedVideoPlayer } from "../../video-player/unified-video-player";

const STAGE_WIDTH = 500;
const STAGE_HEIGHT = 300;

export function TaskTypeWithVideoStep() {
  const { t } = useTranslation(["recipes", "common"]);
  const { formValues, setTaskType, setVideo, updateForm, setExtractedFrame, clearVideoData } = useRecipeStore();
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
  const [capturedFrame, setCapturedFrame] = useState<FrameData | null>(() => {
    try {
      return formValues.extractedFrame ? JSON.parse(formValues.extractedFrame) : null;
    } catch {
      return null;
    }
  });

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

  const handleFrameCaptured = (frame: FrameData) => {
    setCapturedFrame(frame);
    setExtractedFrame(
      JSON.stringify(frame),
      frame.frameTime,
      `frame_${Date.now()}.jpg`
    );
  };

  const handleFileChange = (file: File) => {
    setSelectedVideoFile(file);
    // Generate a temporary ID for the video
    const videoId = `video-${Date.now()}`;
    setVideo(videoId, file);
  };

  // Check if step is complete
  const isStepComplete = !!(
    formValues.taskType &&
    formValues.videoId &&
    formValues.extractedFrame
  );

  return (
    <Box>
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
                            ? mantineTheme.colors.dark[6]
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
              ) : selectedVideoFile ? (
                <Box>
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
                              clearVideoData();
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
                            border: `1px solid ${colorScheme === "dark" ? getThemeColor("gray.7") : getThemeColor("gray.3")}`,
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
                      <UnifiedVideoPlayer
                        file={selectedVideoFile}
                        width={STAGE_WIDTH}
                        height={STAGE_HEIGHT}
                        onFrameCaptured={handleFrameCaptured}
                      />
                    )}

                  </Stack>
                </Box>
              ) : (
                <Dropzone
                  onDrop={(files) => handleFileChange(files[0])}
                  accept={{
                    'video/mp4': ['.mp4'],
                    'video/x-matroska': ['.mkv'],
                    'video/webm': ['.webm']
                  }}
                  maxSize={500 * 1024 * 1024}
                  disabled={!formValues.taskType}
                  styles={(theme) => ({
                    root: {
                      border: `1px dashed ${colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[4]}`,
                      borderRadius: "8px",
                      padding: "24px",
                      backgroundColor: colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
                      cursor: formValues.taskType ? "pointer" : "not-allowed",
                      opacity: formValues.taskType ? 1 : 0.6,
                      transition: "all 0.2s ease",
                      "&:hover": formValues.taskType ? {
                        borderColor: colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[5],
                        backgroundColor: colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1],
                      } : {},
                    },
                    inner: {
                      backgroundColor: 'transparent !important',
                    },
                  })}
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
                      <Text size="xs" c="dimmed">
                        Supports MP4, MKV, and WebM formats
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
                clearVideoData();
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
                  clearVideoData();
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