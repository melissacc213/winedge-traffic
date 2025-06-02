import {
  Alert,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, type FileRejection } from "@mantine/dropzone";
import { IconCheck, IconFileZip, IconUpload, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { ModelParser } from "@/lib/model-parser";
import type { ModelConfig } from "@/types/model";

import { ModelConfigEditor } from "./model-config-editor";

interface ModelUploadDialogProps {
  opened: boolean;
  onClose: () => void;
  onModelConfigured?: (config: ModelConfig) => void;
  title?: string;
  isEditMode?: boolean;
  initialConfig?: ModelConfig;
}

export function ModelUploadDialog({
  opened,
  onClose,
  onModelConfigured,
  title = "Upload & Configure Model",
  isEditMode = false,
  initialConfig,
}: ModelUploadDialogProps) {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(
    isEditMode && initialConfig ? initialConfig : null
  );
  const [error, setError] = useState<string | null>(null);

  const surfaceBg = isDark ? theme.colors.dark?.[6] || theme.colors.gray[7] : theme.colors.gray[0];
  
  // If in edit mode with initial config, we should show the editor directly
  const shouldShowUploadScreen = !isEditMode || !initialConfig;
  
  // Update modelConfig when modal opens or props change
  useEffect(() => {
    if (opened) {
      if (isEditMode && initialConfig) {
        setModelConfig(initialConfig);
      } else if (!isEditMode) {
        // Reset to null for create mode
        setModelConfig(null);
        setError(null);
        setUploadProgress(0);
        setIsUploading(false);
      }
    }
  }, [isEditMode, initialConfig, opened]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 10;
        });
      }, 100);

      // Parse the model file
      const result = await ModelParser.parseModelZip(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.config) {
        setModelConfig(result.config);
        setTimeout(() => setUploadProgress(0), 500);
      } else {
        setError(result.error || "Failed to parse model file");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileReject = useCallback((rejectedFiles: FileRejection[]) => {
    console.log("Rejected files:", rejectedFiles);
    if (rejectedFiles.length > 0) {
      const file = rejectedFiles[0];
      const errors = file.errors || [];
      if (errors.length > 0) {
        const errorMessages = errors.map((error) => error.message).join(", ");
        setError(`File rejected: ${errorMessages}`);
      } else {
        setError("File rejected. Please ensure you upload a valid .zip file under 100MB.");
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    // Reset all state when closing
    setModelConfig(null);
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  }, [onClose]);

  const handleSaveConfig = useCallback(() => {
    if (modelConfig && onModelConfigured) {
      onModelConfigured(modelConfig);
      handleClose();
    }
  }, [modelConfig, onModelConfigured, handleClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      size="xl"
      centered
      withinPortal
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 3,
      }}
      zIndex={9999}
      styles={{
        content: {
          backgroundColor: isDark ? theme.colors.dark?.[7] || theme.colors.gray[8] : theme.white,
          border: `1px solid ${isDark ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[3]}`,
          zIndex: 9999,
        },
        header: {
          backgroundColor: isDark ? theme.colors.dark?.[7] || theme.colors.gray[8] : theme.white,
          borderBottom: `1px solid ${isDark ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[3]}`,
        },
        root: {
          zIndex: 9999,
        },
      }}
    >
      <Stack gap="lg">
        {!modelConfig && shouldShowUploadScreen ? (
          <>

            {/* Upload Section - Dropzone */}
            <Dropzone
              onDrop={handleFileUpload}
              onReject={handleFileReject}
              maxSize={100 * 1024 * 1024} // 100MB
              accept={{
                "application/x-zip-compressed": [".zip"],
                "application/zip": [".zip"],
              }}
              disabled={isUploading}
              styles={{
                inner: {
                  pointerEvents: "all",
                },
                root: {
                  "&:hover": {
                    backgroundColor: isDark 
                      ? theme.colors.dark?.[5] || theme.colors.gray[6]
                      : theme.colors.gray[1],
                    borderColor: theme.colors.blue[6],
                  },
                  backgroundColor: surfaceBg,
                  border: `2px dashed ${isDark ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[4]}`,
                  borderRadius: theme.radius.md,
                  cursor: isUploading ? "not-allowed" : "pointer",
                  opacity: isUploading ? 0.6 : 1,
                  padding: theme.spacing.xl,
                  textAlign: "center",
                  transition: "all 0.2s ease",
                },
              }}
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    alignItems: "center",
                    backgroundColor: isDark
                      ? theme.colors.blue[9]
                      : theme.colors.blue[0],
                    borderRadius: "50%",
                    display: "flex",
                    height: 60,
                    justifyContent: "center",
                    width: 60,
                  }}
                >
                  <IconFileZip size={30} color={theme.colors.blue[6]} />
                </Box>

                <div>
                  <Title order={4} mb="xs">
                    Upload Model Archive
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    Drag & drop a .zip file here, or click to select
                  </Text>
                  <Text size="xs" c="dimmed">
                    Archive should contain model.label and model_info.json files
                  </Text>
                </div>

                <Button
                  leftSection={<IconUpload size={16} />}
                  variant="light"
                  size="lg"
                  loading={isUploading}
                  disabled={isUploading}
                  style={{ pointerEvents: "none" }} // Prevent button click since dropzone handles it
                >
                  {isUploading ? "Processing..." : "Drop files here or click to browse"}
                </Button>
              </Stack>
            </Dropzone>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <Paper p="md" radius="md" style={{ backgroundColor: surfaceBg }}>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Parsing model file...
                    </Text>
                    <Text size="sm" c="dimmed">
                      {uploadProgress}%
                    </Text>
                  </Group>
                  <Progress
                    value={uploadProgress}
                    color="blue"
                    size="md"
                    radius="xl"
                  />
                </Stack>
              </Paper>
            )}

            {/* Error Display */}
            {error && (
              <Alert
                color="red"
                title="Upload Failed"
                icon={<IconX size={16} />}
                variant={isDark ? "light" : "filled"}
              >
                {error}
              </Alert>
            )}
          </>
        ) : (
          <>
            {/* Success Message - only show for upload mode */}
            {!isEditMode && modelConfig && (
              <Alert
                color="green"
                title="Model Loaded Successfully"
                icon={<IconCheck size={16} />}
                variant="light"
              >
                Model configuration loaded with {modelConfig.labels?.length || 0}{" "}
                labels. You can now customize the settings below.
              </Alert>
            )}

            {/* Model Configuration Editor */}
            {modelConfig && (
              <ModelConfigEditor
                config={modelConfig}
                onConfigChange={setModelConfig}
              />
            )}

            {/* Action Buttons */}
            <Group justify="flex-end" gap="sm">
              <Button variant="light" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="filled" color="blue" onClick={handleSaveConfig}>
                {isEditMode ? "Save Changes" : "Use This Configuration"}
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
