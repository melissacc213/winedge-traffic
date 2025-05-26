import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { 
  Stack, 
  Text, 
  Group, 
  Paper,
  Card,
  Badge,
  Slider,
  Collapse,
  Button,
  SimpleGrid,
  ThemeIcon,
  ScrollArea,
  TextInput,
  ActionIcon,
  Divider,
  Alert,
  Loader,
  Center
} from '@mantine/core';
import { 
  IconBrain, 
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { useRecipeStore } from '../../../lib/store/recipe-store';
import { useModels } from '../../../lib/queries/model';
import { LabelEditor } from '../../model-config-editor/label-editor';
import type { ModelLabel } from '../../../types/model';

// Mock data for model labels - in a real app this would come from the selected model's config
const MOCK_LABELS: ModelLabel[] = [
  { id: '1', name: 'Person', color: '#FF6B6B', confidence: 0.7, enabled: true },
  { id: '2', name: 'Vehicle', color: '#4ECDC4', confidence: 0.75, enabled: true },
  { id: '3', name: 'Truck', color: '#45B7D1', confidence: 0.8, enabled: true },
  { id: '4', name: 'Motorcycle', color: '#FFA07A', confidence: 0.65, enabled: false },
  { id: '5', name: 'Bicycle', color: '#98D8C8', confidence: 0.6, enabled: true },
];

export function ModelConfigStep() {
  const { t } = useTranslation(['recipes']);
  const { formValues, setModel, setModelConfig } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [labels, setLabels] = useState<ModelLabel[]>(formValues.modelConfig?.labels || MOCK_LABELS);
  const [globalConfidence, setGlobalConfidence] = useState(formValues.modelConfig?.confidence || 0.7);
  
  // Get available models
  const { data: models = [], isLoading } = useModels();
  
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
        confidence: globalConfidence,
        labels: labels
      });
    }
  }, [formValues.modelId, globalConfidence, labels, setModelConfig]);
  
  const handleLabelUpdate = (labelId: string, updates: Partial<ModelLabel>) => {
    setLabels(prev => prev.map(label => 
      label.id === labelId ? { ...label, ...updates } : label
    ));
  };
  
  const handleGlobalConfidenceChange = (value: number) => {
    setGlobalConfidence(value);
    // Optionally update all labels with the global confidence
    setLabels(prev => prev.map(label => ({ ...label, confidence: value })));
  };
  
  return (
    <Stack>
      <Stack gap="xs">
        <Text fw={700} size="xl">{t('recipes:creation.modelConfig.title')}</Text>
        <Text size="sm" c="dimmed">{t('recipes:creation.modelConfig.description')}</Text>
      </Stack>
      
      {/* Model Selection */}
      <Paper withBorder p="lg" radius="md">
        <Stack>
          <Group justify="space-between" align="center">
            <Text fw={600} size="lg">Select AI Model</Text>
            {formValues.modelId && (
              <Badge color="green" leftSection={<IconCheck size={14} />}>
                Model Selected
              </Badge>
            )}
          </Group>
          
          <TextInput
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery && (
                <ActionIcon size="sm" variant="subtle" onClick={() => setSearchQuery('')}>
                  <IconAlertCircle size={16} />
                </ActionIcon>
              )
            }
          />
          
          {isLoading ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : filteredModels.length === 0 ? (
            <Alert variant="light" color="blue" icon={<IconAlertCircle size={16} />}>
              No models found. Please upload a model first.
            </Alert>
          ) : (
            <ScrollArea h={300} offsetScrollbars>
              <Stack gap="sm">
                {filteredModels.map((model) => (
                  <Card
                    key={model.id}
                    withBorder
                    p="md"
                    radius="md"
                    className={`cursor-pointer transition-all ${
                      formValues.modelId === model.id 
                        ? 'ring-2 ring-blue-500 border-blue-500' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setModel(model.id)}
                  >
                    <Group>
                      <ThemeIcon 
                        size="lg" 
                        radius="md" 
                        variant={formValues.modelId === model.id ? 'filled' : 'light'}
                        color="indigo"
                      >
                        <IconBrain size={20} />
                      </ThemeIcon>
                      
                      <div style={{ flex: 1 }}>
                        <Group justify="space-between" align="start">
                          <div>
                            <Text fw={500}>{model.name}</Text>
                            <Text size="xs" c="dimmed">
                              Type: {model.type} • Size: {(model.size / (1024 * 1024)).toFixed(1)} MB
                            </Text>
                          </div>
                          <Badge 
                            color={model.status === 'ready' ? 'green' : 'yellow'}
                            variant="dot"
                          >
                            {model.status}
                          </Badge>
                        </Group>
                      </div>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>
          )}
        </Stack>
      </Paper>
      
      {/* Label Configuration - Only show if model is selected */}
      {formValues.modelId && (
        <Paper withBorder p="lg" radius="md">
          <Stack>
            <div>
              <Text fw={600} size="lg" mb="xs">Label Configuration</Text>
              <Text size="sm" c="dimmed">
                Configure detection labels and their confidence thresholds
              </Text>
            </div>
            
            <Divider />
            
            {/* Global Confidence Threshold */}
            <div>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Global Confidence Threshold</Text>
                <Badge variant="light">{Math.round(globalConfidence * 100)}%</Badge>
              </Group>
              <Slider
                value={globalConfidence}
                onChange={handleGlobalConfidenceChange}
                step={0.05}
                min={0.1}
                max={1}
                label={(value) => `${Math.round(value * 100)}%`}
                marks={[
                  { value: 0.25, label: '25%' },
                  { value: 0.5, label: '50%' },
                  { value: 0.75, label: '75%' },
                ]}
                mb="md"
              />
              <Text size="xs" c="dimmed">
                Set a global threshold that will be applied to all labels. You can customize individual labels below.
              </Text>
            </div>
            
            <Divider />
            
            {/* Individual Label Configuration */}
            <div>
              <Group justify="space-between" mb="md">
                <Text fw={500}>Detection Labels</Text>
                <Text size="sm" c="dimmed">
                  {labels.filter(l => l.enabled).length} of {labels.length} enabled
                </Text>
              </Group>
              
              <Stack gap="xs">
                {labels.map((label) => (
                  <LabelEditor
                    key={label.id}
                    label={label}
                    onUpdate={(updates) => handleLabelUpdate(label.id, updates)}
                    onDelete={() => {}}
                  />
                ))}
              </Stack>
            </div>
          </Stack>
        </Paper>
      )}
      
      {/* Info Alert */}
      {!formValues.modelId && (
        <Alert variant="light" color="blue" icon={<IconAlertCircle size={16} />}>
          Please select a model to configure its detection labels.
        </Alert>
      )}
    </Stack>
  );
}