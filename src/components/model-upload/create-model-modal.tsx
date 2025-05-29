import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Group,
  TextInput,
  Stack,
  Text,
  NumberInput,
  Paper,
  Box,
  Table,
  ScrollArea,
  Divider,
  useMantineTheme,
  ActionIcon,
  Card,
  Center,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Dropzone } from "@mantine/dropzone";
import { useTheme } from "../../providers/theme-provider";
import { 
  IconPlus, 
  IconTrash, 
  IconUpload, 
  IconX, 
  IconCheck, 
  IconEdit,
  IconCloudUpload,
} from "@tabler/icons-react";
import { useCreateModel } from "../../lib/queries/model";
import { notifications } from "@mantine/notifications";
import type { FileWithPath } from "@mantine/dropzone";

interface ModelParameter {
  id: string;
  key: string;
  name: string;
  value: string;
  nameZh?: string;
}

// Helper function to extract parameters from model file
const extractParametersFromFile = async (file: File): Promise<ModelParameter[]> => {
  return new Promise((resolve) => {
    // In a real implementation, this would parse the model file
    // For now, we'll simulate reading parameters from the file with defaults
    
    // Simulate file processing delay
    setTimeout(() => {
      // Default parameters
      resolve([
        { id: "1", key: "confidence", name: "Confidence", nameZh: "信心值", value: "0.8" },
        { id: "2", key: "width_threshold", name: "Width Threshold", nameZh: "寬度門檻值", value: "100" },
        { id: "3", key: "height_threshold", name: "Height Threshold", nameZh: "高度門檻值", value: "200" },
      ]);
    }, 500);
  });
};

interface CreateModelModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateModelModal({ opened, onClose }: CreateModelModalProps) {
  const { t } = useTranslation(["models", "common"]);
  const mantineTheme = useMantineTheme();
  const { theme, colorScheme } = useTheme();
  const createModelMutation = useCreateModel();
  
  const [modelFile, setModelFile] = useState<FileWithPath | null>(null);
  const [modelName, setModelName] = useState("");
  const [parameters, setParameters] = useState<ModelParameter[]>([
    { id: "1", key: "confidence", name: "Confidence", nameZh: "信心值", value: "0.8" },
    { id: "2", key: "width_threshold", name: "Width Threshold", nameZh: "寬度門檻值", value: "100" },
    { id: "3", key: "height_threshold", name: "Height Threshold", nameZh: "高度門檻值", value: "200" },
  ]);
  
  const [isEditingParam, setIsEditingParam] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
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
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!opened) {
      setModelFile(null);
      setModelName("");
      setParameters([]);
    }
  }, [opened]);
  
  const handleDrop = async (files: FileWithPath[]) => {
    if (files.length > 0) {
      const file = files[0];
      setModelFile(file);
      
      // Set a default model name based on the file name
      if (!modelName) {
        setModelName(file.name.split('.')[0]);
      }
      
      // Extract parameters from the model file
      try {
        const extractedParams = await extractParametersFromFile(file);
        setParameters(extractedParams);
        
        notifications.show({
          title: t("models:notification.parameter_extracted"),
          message: t("models:notification.parameter_extracted_message"),
          color: "blue",
        });
      } catch (error) {
        console.error("Error extracting parameters:", error);
        notifications.show({
          title: t("models:notification.parameter_extraction_failed"),
          message: t("models:notification.parameter_extraction_failed_message"),
          color: "red",
        });
      }
    }
  };
  
  const handleEditParameter = (id: string, value: string) => {
    setIsEditingParam(id);
    setEditValue(value);
  };
  
  const handleSaveParameter = () => {
    if (isEditingParam) {
      setParameters(prev => 
        prev.map(param => 
          param.id === isEditingParam 
            ? { ...param, value: editValue } 
            : param
        )
      );
      setIsEditingParam(null);
      setEditValue("");
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditingParam(null);
    setEditValue("");
  };
  
  const handleCreateModel = async () => {
    if (!modelFile) {
      notifications.show({
        title: t("models:notification.upload_error"),
        message: t("models:notification.no_file_selected"),
        color: "red",
      });
      return;
    }
    
    // Create model object with parameters
    const modelParams: Record<string, string> = {};
    parameters.forEach(param => {
      modelParams[param.key] = param.value;
    });
    
    const modelData = {
      name: modelName || modelFile.name.split('.')[0],
      type: modelFile.name.split('.').pop() || "unknown",
      size: modelFile.size,
      description: "Custom model with parameters",
      parameters: modelParams,
    };
    
    try {
      // Call the mutation
      await createModelMutation.mutateAsync(modelData);
      
      // Show success notification
      notifications.show({
        title: t("models:notification.upload_success"),
        message: t("models:notification.upload_success_message", {
          name: modelData.name,
        }),
        color: "green",
      });
      
      // Reset form and close modal
      setModelFile(null);
      setModelName("");
      setParameters([]);
      onClose();
    } catch (error) {
      // Show error notification
      notifications.show({
        title: t("models:notification.upload_error"),
        message: error instanceof Error ? error.message : t("models:notification.upload_failed"),
        color: "red",
      });
    }
  };
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("models:create.title")}
      size="lg"
      centered
      withCloseButton
      withinPortal
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        header: {
          marginBottom: 10,
        },
        title: {
          fontWeight: 600,
          fontSize: '1.2rem'
        },
      }}
    >
      <Stack gap="md">
        {/* Model Upload Section */}
        <Box>
          <Text fw={600} size="sm" mb="xs">{t("models:create.upload_model")}</Text>
          
          {!modelFile ? (
            <Dropzone
              onDrop={handleDrop}
              onReject={(files) => console.log("rejected files", files)}
              maxSize={500 * 1024 * 1024} // 500MB
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
              disabled={createModelMutation.isPending}
              p="lg"
              h={200}
              style={{
                borderRadius: 4,
                borderColor: getThemeColor('gray.2'),
                borderStyle: 'dashed',
                borderWidth: 2
              }}
            >
              <Center style={{ height: '100%', flexDirection: 'column', gap: 8, pointerEvents: "none" }}>
                <IconCloudUpload size={48} stroke={1.5} color={colorScheme === 'dark' ? getThemeColor("gray.5") : getThemeColor("gray.4")} />
                <Text size="md" fw={500}>
                  {t("models:upload.dropzone_text")}
                </Text>
                <Text size="sm" c="dimmed">
                  {t("models:upload.dropzone_hint")}
                </Text>
              </Center>
            </Dropzone>
          ) : (
            <Box
              p="sm"
              style={{
                border: `1px solid ${getThemeColor('gray.2')}`,
                borderRadius: 4,
                backgroundColor: colorScheme === 'dark' ? getThemeColor("gray.9") : 'white'
              }}
            >
              <Group justify="space-between" mb="sm">
                <Group>
                  <IconUpload size={20} color={getThemeColor('blue.5')} />
                  <div>
                    <Text size="sm" fw={500}>{modelFile.name}</Text>
                    <Text size="xs" c="dimmed">
                      {(modelFile.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                </Group>
                <ActionIcon 
                  color="red" 
                  onClick={() => {
                    setModelFile(null);
                    setParameters([]);
                  }}
                  variant="subtle"
                  disabled={createModelMutation.isPending}
                >
                  <IconX size={18} />
                </ActionIcon>
              </Group>
            </Box>
          )}
        </Box>
        
        {/* Model Name Section */}
        <Box>
          <Text fw={600} size="sm" mb="xs" c={colorScheme === 'dark' ? 'gray.2' : 'gray.8'} required>
            {t("models:create.model_name")} <Text component="span" c="red.6">*</Text>
          </Text>
          <TextInput
            placeholder={t("models:create.model_name_placeholder")}
            value={modelName}
            onChange={(e) => setModelName(e.currentTarget.value)}
            disabled={createModelMutation.isPending}
            required
            styles={{
              input: {
                borderColor: getThemeColor('gray.2'),
                height: 40
              }
            }}
          />
        </Box>
        
        {/* Parameters Section */}
        <Box>
          <Text fw={600} size="sm" mb="xs" c={colorScheme === 'dark' ? 'gray.2' : 'gray.8'}>
            {t("models:create.parameters")}
          </Text>
          
          {parameters.length === 0 && modelFile && (
            <Center p="lg" style={{ border: `1px solid ${getThemeColor('gray.2')}`, borderRadius: 4 }}>
              <Text c="dimmed">
                {t("models:create.extracting_parameters", "Extracting parameters from model file...")}
              </Text>
            </Center>
          )}
          
          {parameters.length > 0 && (
            <Table striped={false} highlightOnHover={false} withTableBorder={false}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("models:create.parameter_key")}</Table.Th>
                  <Table.Th>{t("models:create.parameter_name")}</Table.Th>
                  <Table.Th>{t("models:create.parameter_value")}</Table.Th>
                  <Table.Th style={{ width: 80 }}>{t("models:create.actions")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {parameters.map((param) => (
                  <Table.Tr key={param.id}>
                    <Table.Td>{param.key}</Table.Td>
                    <Table.Td>
                      {param.name} {param.nameZh && <Text component="span" c="dimmed" size="xs">({param.nameZh})</Text>}
                    </Table.Td>
                    <Table.Td>
                      {isEditingParam === param.id ? (
                        <TextInput
                          value={editValue}
                          onChange={(e) => setEditValue(e.currentTarget.value)}
                          size="xs"
                          autoFocus
                          styles={{
                            input: {
                              borderColor: getThemeColor('gray.2')
                            }
                          }}
                        />
                      ) : (
                        param.value
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEditingParam === param.id ? (
                        <Group gap="xs">
                          <ActionIcon color={mantineTheme.primaryColor} size="sm" onClick={handleSaveParameter}>
                            <IconCheck size={16} />
                          </ActionIcon>
                          <ActionIcon color="red" size="sm" onClick={handleCancelEdit}>
                            <IconX size={16} />
                          </ActionIcon>
                        </Group>
                      ) : (
                        <ActionIcon 
                          color={mantineTheme.primaryColor}
                          size="sm" 
                          onClick={() => handleEditParameter(param.id, param.value)}
                          disabled={createModelMutation.isPending}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Box>
        
        <Divider my="sm" />
        
        <Group justify="flex-end">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={createModelMutation.isPending}
            styles={{
              root: {
                border: `1px solid ${getThemeColor('gray.2')}`,
                color: colorScheme === 'dark' ? getThemeColor('gray.3') : getThemeColor('gray.6')
              }
            }}
          >
            {t("common:button.cancel")}
          </Button>
          <Button 
            onClick={handleCreateModel}
            loading={createModelMutation.isPending} 
            disabled={!modelFile || modelName.trim() === ""}
            styles={{
              root: {
                backgroundColor: getThemeColor('blue.5')
              }
            }}
          >
            {createModelMutation.isPending ? 
              t("models:create.uploading") : 
              t("models:create.create_model")
            }
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}