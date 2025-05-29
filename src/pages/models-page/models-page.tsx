import { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Progress,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useTheme } from "@/providers/theme-provider";
import { Dropzone } from "@mantine/dropzone";
import { useTranslation } from "react-i18next";
import { IconCloudUpload, IconUpload, IconPlus, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useModelUpload } from "../../hooks/use-model-upload";
import { ModelsTable } from "../../pages/models-page/models-table";
import { PageLayout } from "@/components/page-layout/page-layout";
import { ModelUploadDialog } from "@/components/model-config-editor";
import type { Model } from "../../lib/store/model-store";

// Create custom styles for the full-page dropzone
const useStyles = () => {
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
  
  return ({
  container: {
    position: "relative" as const,
    height: "100%",
  },
  fullPageDropzone: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: theme.other.overlay.backdrop,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "all" as const,
  },
  dropzoneContent: {
    backgroundColor: colorScheme === "dark" ? getThemeColor("gray.9") : "white",
    borderRadius: "12px",
    padding: rem(40),
    border: `2px dashed ${colorScheme === "dark" ? getThemeColor("gray.6") : getThemeColor("gray.3")}`,
    boxShadow: `0 8px 24px ${getThemeColor("ui.shadow")}`,
    textAlign: "center" as const,
    width: rem(320),
    transition: "all 0.2s ease",
  },
  uploadIcon: {
    width: rem(48),
    height: rem(48),
    color: colorScheme === "dark" ? getThemeColor("gray.5") : getThemeColor("gray.5"),
    marginBottom: rem(12),
  },
});
};

export function ModelsPage() {
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const { t } = useTranslation(["models", "common"]);
  const { theme, colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  
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
  
  const styles = useStyles();
  const openRef = useRef<() => void>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const {
    models,
    isLoading,
    uploadProgress,
    isUploading,
    handleDrop,
    handleDelete,
    handleDownload,
    resetUpload,
  } = useModelUpload();

  // Handle drag events on the entire page
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;

      if (dragCounter === 1 && e.dataTransfer?.types?.includes("Files")) {
        setIsDragActive(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;

      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDragActive(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragActive(false);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleManualUpload = () => {
    // Instead of opening dropzone, open create model modal
    setEditingModel(null); // Clear any previous editing model
    setCreateModalOpened(true);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setCreateModalOpened(true);
  };

  return (
    <PageLayout
      title={t("models:page.title")}
      description={t("models:page.description")}
      actions={
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleManualUpload}
          disabled={isUploading}
        >
          {t("models:actions.create")}
        </Button>
      }
    >
      <Box style={styles.container}>
        {/* Hidden Dropzone for file handling */}
        <Dropzone
          openRef={openRef}
          onDrop={(files) => {
            setIsDragActive(false);
            handleDrop(files);
          }}
          onReject={(files) => {
            console.log("rejected files", files);
            setIsDragActive(false);
          }}
          style={{ display: "none" }}
          maxSize={500 * 1024 * 1024}
          accept={{
            "application/zip": [".zip", ".onnx"],
            "application/octet-stream": [
              ".pt",
              ".pth",
              ".bin",
              ".onnx",
              ".tflite",
            ],
            "application/x-zip-compressed": [".zip"],
          }}
          disabled={isUploading}
        />

        {/* Full-page dropzone overlay */}
        {isDragActive && (
          <Dropzone
            onDrop={(files) => {
              setIsDragActive(false);
              handleDrop(files);
            }}
            onReject={(files) => {
              console.log("rejected files", files);
              setIsDragActive(false);
            }}
            multiple
            maxSize={500 * 1024 * 1024}
            accept={{
              "application/zip": [".zip", ".onnx"],
              "application/octet-stream": [
                ".pt",
                ".pth",
                ".bin",
                ".onnx",
                ".tflite",
              ],
              "application/x-zip-compressed": [".zip"],
            }}
            style={styles.fullPageDropzone}
          >
            <div style={styles.dropzoneContent}>
              <IconCloudUpload style={styles.uploadIcon} stroke={1.5} />
              <Stack align="center" gap={10} mt="md">
                <Text size="xl" fw={700}>
                  {t("models:upload.dropzone_text")}
                </Text>
                <Text size="sm" c="dimmed">
                  {t("models:upload.dropzone_hint")}
                </Text>
                <Text size="xs" c="dimmed" mt="xs">
                  {t("models:upload.supported_formats", {
                    formats: ".pt, .pth, .onnx, .bin, .tflite, .zip",
                  })}
                </Text>
              </Stack>
            </div>
          </Dropzone>
        )}

        <Stack gap="lg">
          {/* Upload Progress Section */}
          {isUploading && (
            <Card withBorder shadow="sm" p="md">
              <Group justify="space-between" mb={5}>
                <Text size="sm" fw={500}>
                  {uploadProgress.fileName}
                </Text>
                <Text size="sm" c="dimmed">
                  {Math.round(uploadProgress.progress)}%
                </Text>
              </Group>
              <Progress
                value={uploadProgress.progress}
                size="md"
                radius="xl"
                color={uploadProgress.progress < 100 ? "blue" : "green"}
              />
              {uploadProgress.progress === 100 && !uploadProgress.error && (
                <Text size="sm" c={colorScheme === "dark" ? "teal.4" : "teal.7"} mt={5}>
                  {t("models:upload.processing")}
                </Text>
              )}
              {uploadProgress.error && (
                <Text size="sm" c={colorScheme === "dark" ? "red.4" : "red.7"} mt={5}>
                  {uploadProgress.error}
                </Text>
              )}
              <Button
                variant="subtle"
                color="red"
                size="xs"
                mt="xs"
                onClick={resetUpload}
              >
                {t("common:action.cancel")}
              </Button>
            </Card>
          )}

          {/* Models Table */}
          <ModelsTable
            models={models}
            isLoading={isLoading}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onEdit={handleEdit}
          />
        </Stack>
      </Box>
      
      {/* Create/Edit Model Modal */}
      <ModelUploadDialog 
        opened={createModalOpened} 
        onClose={() => {
          setCreateModalOpened(false);
          setEditingModel(null);
        }}
        title={editingModel ? t("models:actions.editTitle") : t("models:actions.createTitle")}
        isEditMode={!!editingModel}
        initialConfig={editingModel ? {
          id: 1,
          name: editingModel.name,
          description: editingModel.description || "",
          task: editingModel.type,
          labels: [
            {
              id: "1",
              name: "Vehicle",
              color: "#FF6B6B",
              confidence: 0.7,
              enabled: true
            }
          ]
        } : undefined}
        onModelConfigured={(config) => {
          console.log(editingModel ? 'Model updated:' : 'Model created:', config);
          // Show success notification
          notifications.show({
            title: editingModel ? 'Model Updated Successfully' : 'Model Created Successfully',
            message: editingModel 
              ? `${config.name} configuration has been updated`
              : `${config.name} with ${config.labels.length} labels has been configured`,
            color: 'green',
            icon: <IconCheck size={16} />
          });
          // Here you can integrate with your model storage system
          // For example: 
          // if (editingModel) {
          //   updateModelInBackend(editingModel.id, config);
          // } else {
          //   saveModelToBackend(config);
          // }
          setCreateModalOpened(false);
          setEditingModel(null);
        }}
      />
    </PageLayout>
  );
}
