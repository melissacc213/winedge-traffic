import {
  Box,
  Button,
  Card,
  Group,
  Progress,
  rem,
  Stack,
  Text,
} from "@mantine/core";
import { useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconCheck,IconCloudUpload, IconPlus } from "@tabler/icons-react";
import { useEffect,useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ModelUploadDialog } from "@/components/model-config-editor";
import { PageLayout } from "@/components/page-layout/page-layout";
import { getOverlayColor } from "@/lib/theme-utils";

import { useModelUpload } from "../../hooks/use-model-upload";
import type { Model } from "../../lib/store/model-store";
import { ModelsTable } from "../../pages/models-page/models-table";

// Create custom styles for the full-page dropzone
const useStyles = () => {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const colorScheme = computedColorScheme;
  
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
    height: "100%",
    position: "relative" as const,
  },
  dropzoneContent: {
    backgroundColor: colorScheme === "dark" ? getThemeColor("gray.9") : "white",
    border: `2px dashed ${colorScheme === "dark" ? getThemeColor("gray.6") : getThemeColor("gray.3")}`,
    borderRadius: "12px",
    boxShadow: `0 8px 24px ${getThemeColor("ui.shadow")}`,
    padding: rem(40),
    textAlign: "center" as const,
    transition: "all 0.2s ease",
    width: rem(320),
  },
  fullPageDropzone: {
    alignItems: "center",
    backgroundColor: getOverlayColor(theme, "backdrop", colorScheme === "dark"),
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    left: 0,
    pointerEvents: "all" as const,
    position: "absolute" as const,
    right: 0,
    top: 0,
    zIndex: 999,
  },
  uploadIcon: {
    color: colorScheme === "dark" ? getThemeColor("gray.5") : getThemeColor("gray.5"),
    height: rem(48),
    marginBottom: rem(12),
    width: rem(48),
  },
});
};

export function ModelsPage() {
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const { t } = useTranslation(["models", "common"]);
  const computedColorScheme = useComputedColorScheme();
  const colorScheme = computedColorScheme;
  
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
          color="blue"
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
            "application/octet-stream": [
              ".pt",
              ".pth",
              ".bin",
              ".onnx",
              ".tflite",
            ],
            "application/x-zip-compressed": [".zip"],
            "application/zip": [".zip", ".onnx"],
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
              "application/octet-stream": [
                ".pt",
                ".pth",
                ".bin",
                ".onnx",
                ".tflite",
              ],
              "application/x-zip-compressed": [".zip"],
              "application/zip": [".zip", ".onnx"],
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
          description: editingModel.description || "",
          id: 1,
          labels: [
            {
              color: "#FF6B6B",
              confidence: 0.7,
              enabled: true,
              id: "1",
              name: "Vehicle"
            }
          ],
          name: editingModel.name,
          task: editingModel.type
        } : undefined}
        onModelConfigured={(config) => {
          console.log(editingModel ? 'Model updated:' : 'Model created:', config);
          // Show success notification
          notifications.show({
            color: 'green',
            icon: <IconCheck size={16} />,
            message: editingModel 
              ? `${config.name} configuration has been updated`
              : `${config.name} with ${config.labels.length} labels has been configured`,
            title: editingModel ? 'Model Updated Successfully' : 'Model Created Successfully'
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
