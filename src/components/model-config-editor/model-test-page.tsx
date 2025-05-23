import { useState } from 'react';
import { Container, Stack, Title, Button, Group, Paper, Text, Alert } from '@mantine/core';
import { IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { ModelUploadDialog } from './model-upload-dialog';
import { ModelConfigEditor } from './model-config-editor';
import { ModelParser } from '@/lib/model-parser';
import type { ModelConfig } from '@/types/model';

export function ModelTestPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleModelConfigured = (config: ModelConfig) => {
    setModelConfig(config);
    notifications.show({
      title: 'Model Loaded Successfully',
      message: `Loaded ${config.labels.length} labels from ${config.name}`,
      color: 'green',
      icon: <IconCheck size={16} />
    });
  };

  const handleDirectFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      notifications.show({
        id: 'parsing',
        title: 'Parsing Model',
        message: 'Extracting model configuration...',
        loading: true
      });

      const result = await ModelParser.parseModelZip(file);
      
      if (result.success && result.config) {
        setModelConfig(result.config);
        notifications.update({
          id: 'parsing',
          title: 'Success!',
          message: `Loaded ${result.config.labels.length} labels`,
          color: 'green',
          icon: <IconCheck size={16} />,
          loading: false
        });
      } else {
        notifications.update({
          id: 'parsing',
          title: 'Parse Failed',
          message: result.error || 'Unknown error',
          color: 'red',
          icon: <IconX size={16} />,
          loading: false
        });
      }
    } catch (error) {
      notifications.update({
        id: 'parsing',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
        icon: <IconX size={16} />,
        loading: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!modelConfig) return;
    
    notifications.show({
      title: 'Configuration Saved',
      message: 'Model configuration has been saved',
      color: 'blue'
    });
  };

  const handleExport = () => {
    if (!modelConfig) return;
    
    try {
      const exported = ModelParser.exportModelConfig(modelConfig);
      
      // Download label file
      const labelBlob = new Blob([exported.labelFile], { type: 'text/plain' });
      const labelUrl = URL.createObjectURL(labelBlob);
      const labelLink = document.createElement('a');
      labelLink.href = labelUrl;
      labelLink.download = 'model.label';
      labelLink.click();
      URL.revokeObjectURL(labelUrl);
      
      // Download config file
      const configBlob = new Blob([exported.configFile], { type: 'application/json' });
      const configUrl = URL.createObjectURL(configBlob);
      const configLink = document.createElement('a');
      configLink.href = configUrl;
      configLink.download = 'model_info.json';
      configLink.click();
      URL.revokeObjectURL(configUrl);

      notifications.show({
        title: 'Files Exported',
        message: 'Configuration files have been downloaded',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      notifications.show({
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
        icon: <IconX size={16} />
      });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>Model Configuration Test</Title>
              <Text size="sm" c="dimmed" mt="xs">
                Test the model parsing and configuration system
              </Text>
            </div>
            
            <Group gap="sm">
              <input
                type="file"
                accept=".zip"
                onChange={handleDirectFileUpload}
                style={{ display: 'none' }}
                id="direct-upload"
                disabled={isLoading}
              />
              <Button
                component="label"
                htmlFor="direct-upload"
                variant="light"
                loading={isLoading}
              >
                Direct Upload
              </Button>
              
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={() => setIsUploadOpen(true)}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                Upload with Dialog
              </Button>
            </Group>
          </Group>
        </Paper>

        {modelConfig && (
          <>
            <Alert variant="light" color="blue">
              <Text size="sm">
                <strong>Model Loaded:</strong> {modelConfig.name} with {modelConfig.labels.length} labels
              </Text>
            </Alert>

            <ModelConfigEditor
              config={modelConfig}
              onConfigChange={setModelConfig}
              onExport={handleExport}
              onSave={handleSave}
            />
          </>
        )}

        <ModelUploadDialog
          opened={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onModelConfigured={handleModelConfigured}
        />
      </Stack>
    </Container>
  );
}