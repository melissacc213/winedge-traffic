import { useState, useCallback } from 'react';
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
  Title
} from '@mantine/core';
import { IconUpload, IconCheck, IconX, IconFileZip } from '@tabler/icons-react';
import { useTheme } from '@/providers/theme-provider';
import { ModelParser } from '@/lib/model-parser';
import { ModelConfigEditor } from './model-config-editor';
import type { ModelConfig } from '@/types/model';

interface ModelUploadDialogProps {
  opened: boolean;
  onClose: () => void;
  onModelConfigured?: (config: ModelConfig) => void;
  title?: string;
}

export function ModelUploadDialog({
  opened,
  onClose,
  onModelConfigured,
  title = "Upload & Configure Model"
}: ModelUploadDialogProps) {
  const { colorScheme, theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isDark = colorScheme === 'dark';
  const surfaceBg = isDark ? theme.colors.gray[8] : theme.colors.gray[0];

  const handleFileUpload = useCallback(async (file: File | null) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
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
        setError(result.error || 'Failed to parse model file');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleSaveConfig = useCallback(() => {
    if (modelConfig && onModelConfigured) {
      onModelConfigured(modelConfig);
      handleClose();
    }
  }, [modelConfig, onModelConfigured]);

  const handleExportConfig = useCallback(() => {
    if (!modelConfig) return;
    
    const exported = ModelParser.exportModelConfig(modelConfig);
    
    // Create and download label file
    const labelBlob = new Blob([exported.labelFile], { type: 'text/plain' });
    const labelUrl = URL.createObjectURL(labelBlob);
    const labelLink = document.createElement('a');
    labelLink.href = labelUrl;
    labelLink.download = 'model.label';
    labelLink.click();
    URL.revokeObjectURL(labelUrl);
    
    // Create and download config file
    const configBlob = new Blob([exported.configFile], { type: 'application/json' });
    const configUrl = URL.createObjectURL(configBlob);
    const configLink = document.createElement('a');
    configLink.href = configUrl;
    configLink.download = 'model_info.json';
    configLink.click();
    URL.revokeObjectURL(configUrl);
  }, [modelConfig]);

  const handleClose = useCallback(() => {
    setModelConfig(null);
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  }, [onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      size="xl"
      centered
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 3
      }}
      styles={{
        content: { 
          backgroundColor: isDark ? theme.colors.gray[9] : 'white',
          border: `1px solid ${isDark ? theme.colors.gray[7] : theme.colors.gray[3]}`
        },
        header: {
          backgroundColor: isDark ? theme.colors.gray[9] : 'white',
          borderBottom: `1px solid ${isDark ? theme.colors.gray[7] : theme.colors.gray[3]}`
        }
      }}
    >
      <Stack gap="lg">
        {!modelConfig ? (
          <>
            {/* Upload Section */}
            <Paper
              p="xl"
              radius="md"
              style={{
                backgroundColor: surfaceBg,
                border: `2px dashed ${isDark ? theme.colors.gray[6] : theme.colors.gray[4]}`,
                textAlign: 'center'
              }}
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: isDark ? theme.colors.blue[9] : theme.colors.blue[0],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconFileZip size={30} color={theme.colors.blue[6]} />
                </Box>
                
                <div>
                  <Title order={4} mb="xs">Upload Model Archive</Title>
                  <Text size="sm" c="dimmed">
                    Select a .zip file containing model.label and model_info.json
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
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                      size="lg"
                      loading={isUploading}
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
                    <Text size="sm" fw={500}>Parsing model file...</Text>
                    <Text size="sm" c="dimmed">{uploadProgress}%</Text>
                  </Group>
                  <Progress value={uploadProgress} color="blue" size="md" radius="xl" />
                </Stack>
              </Paper>
            )}

            {/* Error Display */}
            {error && (
              <Alert
                color="red"
                title="Upload Failed"
                icon={<IconX size={16} />}
                variant={isDark ? 'light' : 'filled'}
              >
                {error}
              </Alert>
            )}
          </>
        ) : (
          <>
            {/* Success Message */}
            <Alert
              color="green"
              title="Model Loaded Successfully"
              icon={<IconCheck size={16} />}
              variant="light"
            >
              Model configuration loaded with {modelConfig.labels.length} labels. 
              You can now customize the settings below.
            </Alert>

            {/* Model Configuration Editor */}
            <ModelConfigEditor
              config={modelConfig}
              onConfigChange={setModelConfig}
              onExport={handleExportConfig}
            />

            {/* Action Buttons */}
            <Group justify="flex-end" gap="sm">
              <Button variant="light" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="filled"
                color="blue"
                onClick={handleSaveConfig}
              >
                Use This Configuration
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}