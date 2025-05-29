import { useState, useCallback, useEffect } from "react";
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Paper,
  Alert,
  Progress,
  FileButton,
  Box,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconUpload, IconCheck, IconX, IconFileZip } from "@tabler/icons-react";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "react-i18next";
import { ModelParser } from "@/lib/model-parser";
import { ModelConfigEditor } from "./model-config-editor";
import type { ModelConfig } from "@/types/model";

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
  const { colorScheme, theme } = useTheme();
  const mantineTheme = useMantineTheme();
  const { t } = useTranslation(["models", "common"]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(
    isEditMode && initialConfig ? initialConfig : null
  );
  const [error, setError] = useState<string | null>(null);

  const isDark = colorScheme === "dark";
  const surfaceBg = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  
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

  const handleFileUpload = useCallback(async (file: File | null) => {
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
          backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
          border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          zIndex: 9999,
        },
        header: {
          backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
          borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        },
        root: {
          zIndex: 9999,
        },
      }}
    >
      <Stack gap="lg">
        {!modelConfig && shouldShowUploadScreen ? (
          <>

            {/* Upload Section */}
            <Paper
              p="xl"
              radius="md"
              style={{
                backgroundColor: surfaceBg,
                border: `2px dashed ${isDark ? theme.colors.dark[4] : theme.colors.gray[4]}`,
                textAlign: "center",
              }}
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: isDark
                      ? mantineTheme.colors.blue[9]
                      : mantineTheme.colors.blue[0],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconFileZip size={30} color={mantineTheme.colors.blue[6]} />
                </Box>

                <div>
                  <Title order={4} mb="xs">
                    Upload Model Archive
                  </Title>
                  <Text size="sm" c="dimmed" mb="xs">
                    Select a .zip file containing model.label and
                    model_info.json
                  </Text>
                </div>

                <FileButton
                  onChange={handleFileUpload}
                  accept=".zip"
                  disabled={isUploading}
                >
                  {(props) => (
                    <Button
                      {...props}
                      leftSection={<IconUpload size={16} />}
                      variant="filled"
                      size="lg"
                      loading={isUploading}
                      disabled={false}
                    >
                      Choose File
                    </Button>
                  )}
                </FileButton>
              </Stack>
            </Paper>

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
