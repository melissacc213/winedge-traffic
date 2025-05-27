import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { 
  Stack, 
  Text, 
  Group, 
  Paper,
  Badge,
  Button,
  Table,
  ScrollArea,
  TextInput,
  ActionIcon,
  Alert,
  Loader,
  Center,
  Switch,
  ColorSwatch,
  NumberInput,
  Tabs,
  rem,
  Checkbox,
  Box,
  Title
} from '@mantine/core';
import { 
  IconBrain, 
  IconSearch,
  IconCheck,
  IconAlertCircle,
  IconUpload,
  IconPlus,
  IconSettings,
  IconTag,
  IconX
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useRecipeStore } from '../../../lib/store/recipe-store';
import { useModels } from '../../../lib/queries/model';
import { ModelUploadDialog } from '../../model-config-editor/model-upload-dialog';
import type { ModelLabel, ModelConfig } from '../../../types/model';

// Mock data for model labels - in a real app this would come from the selected model's config
const MOCK_LABELS: ModelLabel[] = [
  { id: '1', name: 'Person', color: '#FF6B6B', confidence: 0.7, enabled: true },
  { id: '2', name: 'Vehicle', color: '#4ECDC4', confidence: 0.75, enabled: true },
  { id: '3', name: 'Truck', color: '#45B7D1', confidence: 0.8, enabled: true },
  { id: '4', name: 'Motorcycle', color: '#FFA07A', confidence: 0.65, enabled: false },
  { id: '5', name: 'Bicycle', color: '#98D8C8', confidence: 0.6, enabled: true },
];

// Available colors for labels
const LABEL_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8C471', '#AED6F1',
  '#ABEBC6', '#F5B7B1', '#D7BDE2', '#A9DFBF', '#FAD7A0'
];

export function ModelConfigStep() {
  const { t } = useTranslation(['recipes']);
  const { formValues, setModel, setModelConfig, updateForm } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [labels, setLabels] = useState<ModelLabel[]>(formValues.modelConfig?.labels || MOCK_LABELS);
  const [opened, { open, close }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string | null>('models');
  
  // Get available models
  const { data: models = [], isLoading, refetch } = useModels();
  
  // Filter models based on search
  const filteredModels = useMemo(() => {
    return models.filter(model => 
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);
  
  // Update store when configuration changes
  useEffect(() => {
    if (formValues.modelId) {
      setModelConfig({
        modelId: formValues.modelId,
        confidence: 0.7,
        labels: labels
      });
    }
  }, [formValues.modelId, labels, setModelConfig]);
  
  const handleLabelUpdate = (labelId: string, updates: Partial<ModelLabel>) => {
    setLabels(prev => prev.map(label => 
      label.id === labelId ? { ...label, ...updates } : label
    ));
  };
  
  const handleAddLabel = () => {
    const newLabel: ModelLabel = {
      id: Date.now().toString(),
      name: `Label ${labels.length + 1}`,
      color: LABEL_COLORS[labels.length % LABEL_COLORS.length],
      confidence: 0.7,
      enabled: true
    };
    setLabels(prev => [...prev, newLabel]);
  };
  
  const handleDeleteLabel = (labelId: string) => {
    setLabels(prev => prev.filter(label => label.id !== labelId));
  };
  
  const handleModelConfigured = (config: ModelConfig) => {
    // When a model is configured from the upload dialog, use it
    if (config.labels) {
      setLabels(config.labels);
    }
    close();
    refetch();
  };
  
  return (
    <Fragment>
      <Stack gap="lg">
        <Group justify="space-between" align="start">
          <Stack gap="xs">
            <Title order={3}>Configure Model</Title>
            <Text size="sm" c="dimmed">
              Select an AI model and configure its detection labels
            </Text>
          </Stack>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={open}
          >
            Create Model
          </Button>
        </Group>
        
        {/* Model Selection with Tabs */}
        <Paper withBorder radius="md">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="models" leftSection={<IconBrain size={16} />}>
                Select Model
              </Tabs.Tab>
              <Tabs.Tab 
                value="labels" 
                leftSection={<IconTag size={16} />}
                disabled={!formValues.modelId}
              >
                Configure Labels
              </Tabs.Tab>
            </Tabs.List>
            
            <Tabs.Panel value="models" p="lg">
              <Stack>
                <TextInput
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                  rightSection={
                    searchQuery && (
                      <ActionIcon size="sm" variant="subtle" onClick={() => setSearchQuery('')}>
                        <IconX size={16} />
                      </ActionIcon>
                    )
                  }
                  mb="md"
                />
                
                {isLoading ? (
                  <Center py="xl">
                    <Loader size="sm" />
                  </Center>
                ) : filteredModels.length === 0 ? (
                  <Stack align="center" py="xl" gap="md">
                    <IconBrain size={48} color="gray" />
                    <Text c="dimmed" ta="center">
                      {searchQuery 
                        ? `No models found matching "${searchQuery}"`
                        : 'No models available. Create your first model to get started.'}
                    </Text>
                    {!searchQuery && (
                      <Button 
                        leftSection={<IconPlus size={16} />}
                        onClick={open}
                      >
                        Create Model
                      </Button>
                    )}
                  </Stack>
                ) : (
                  <ScrollArea h={400}>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ width: 40 }}></Table.Th>
                          <Table.Th>Model Name</Table.Th>
                          <Table.Th>Type</Table.Th>
                          <Table.Th>Size</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>Created</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {filteredModels.map((model) => (
                          <Table.Tr 
                            key={model.id}
                            onClick={() => {
                              setModel(model.id, model.name);
                              setActiveTab('labels');
                            }}
                            style={{ cursor: 'pointer' }}
                            className={formValues.modelId === model.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                          >
                            <Table.Td>
                              <Checkbox
                                checked={formValues.modelId === model.id}
                                onChange={() => {
                                  setModel(model.id, model.name);
                                  setActiveTab('labels');
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <IconBrain size={16} />
                                <Text fw={500}>{model.name}</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>{model.type}</Table.Td>
                            <Table.Td>{(model.size / (1024 * 1024)).toFixed(1)} MB</Table.Td>
                            <Table.Td>
                              <Badge 
                                size="sm"
                                color={model.status === 'ready' ? 'green' : 'yellow'}
                                variant="dot"
                              >
                                {model.status}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" c="dimmed">
                                {new Date(model.createdAt).toLocaleDateString()}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                )}
              </Stack>
            </Tabs.Panel>
            
            <Tabs.Panel value="labels" p="lg">
              {formValues.modelId ? (
                <Stack>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">Detection Labels</Text>
                      <Text size="sm" c="dimmed">
                        Configure which objects the model should detect and their confidence thresholds
                      </Text>
                    </div>
                    <Button 
                      leftSection={<IconPlus size={16} />}
                      onClick={handleAddLabel}
                    >
                      Add Label
                    </Button>
                  </Group>
                  
                  <ScrollArea h={400} offsetScrollbars>
                    <Stack gap="md">
                      {labels.map((label, index) => (
                        <Paper key={label.id} withBorder p="md" radius="md">
                          <Stack gap="sm">
                            <Group justify="space-between">
                              <Group gap="xs">
                                <ColorSwatch color={label.color} size={24} />
                                <TextInput
                                  value={label.name}
                                  onChange={(e) => handleLabelUpdate(label.id, { name: e.currentTarget.value })}
                                  placeholder="Label name"
                                  style={{ width: 200 }}
                                />
                              </Group>
                              <Group gap="xs">
                                <Switch
                                  checked={label.enabled}
                                  onChange={(e) => handleLabelUpdate(label.id, { enabled: e.currentTarget.checked })}
                                  label="Enabled"
                                />
                                <ActionIcon 
                                  color="red" 
                                  variant="subtle"
                                  onClick={() => handleDeleteLabel(label.id)}
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              </Group>
                            </Group>
                            
                            <Group grow>
                              <NumberInput
                                label="Confidence Threshold"
                                value={label.confidence * 100}
                                onChange={(value) => handleLabelUpdate(label.id, { confidence: Number(value) / 100 })}
                                min={0}
                                max={100}
                                step={5}
                                decimalScale={0}
                                suffix="%"
                                leftSection={<IconSettings size={16} />}
                              />
                              <NumberInput
                                label="Min Width (px)"
                                value={label.width_threshold || 0}
                                onChange={(value) => handleLabelUpdate(label.id, { width_threshold: Number(value) })}
                                min={0}
                                leftSection={<IconSettings size={16} />}
                              />
                              <NumberInput
                                label="Min Height (px)"
                                value={label.height_threshold || 0}
                                onChange={(value) => handleLabelUpdate(label.id, { height_threshold: Number(value) })}
                                min={0}
                                leftSection={<IconSettings size={16} />}
                              />
                            </Group>
                            
                            <Group gap="xs">
                              {LABEL_COLORS.map((color) => (
                                <ActionIcon
                                  key={color}
                                  variant={label.color === color ? 'filled' : 'subtle'}
                                  color={color}
                                  onClick={() => handleLabelUpdate(label.id, { color })}
                                  size="sm"
                                >
                                  <ColorSwatch color={color} size={16} />
                                </ActionIcon>
                              ))}
                            </Group>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </ScrollArea>
                  
                  {labels.length === 0 && (
                    <Alert variant="light" color="blue" icon={<IconAlertCircle size={16} />}>
                      No labels configured. Add labels to define what objects the model should detect.
                    </Alert>
                  )}
                </Stack>
              ) : (
                <Alert variant="light" color="yellow" icon={<IconAlertCircle size={16} />}>
                  Please select a model first to configure its labels.
                </Alert>
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
      
      {/* Model Upload Dialog */}
      <ModelUploadDialog
        opened={opened}
        onClose={close}
        onModelConfigured={handleModelConfigured}
        title="Create & Configure Model"
      />
    </Fragment>
  );
}