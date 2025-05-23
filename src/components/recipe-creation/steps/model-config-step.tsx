import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { 
  Stack, 
  Text, 
  Group, 
  Paper,
  Select,
  Card,
  Badge,
  Slider,
  Checkbox,
  Collapse,
  Button,
  SimpleGrid,
  ThemeIcon
} from '@mantine/core';
import { 
  IconBrain, 
  IconChevronDown,
  IconChevronUp,
  IconStar
} from '@tabler/icons-react';
import { useRecipeStore } from '../../../lib/store/recipe-store';
import { useRecommendedModels } from '../../../lib/queries/recipe';
import { MOCK_CLASS_CATEGORIES } from '../../../lib/queries/recipe';

export function ModelConfigStep() {
  const { t } = useTranslation(['recipes']);
  const { formValues, setModel, setConfidenceThreshold, setClassFilter } = useRecipeStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(formValues.classFilter || []);
  
  // Get recommended models based on task type
  const { data: recommendedModels = [] } = useRecommendedModels(formValues.taskType);
  
  // Update store when selected classes change
  useEffect(() => {
    setClassFilter(selectedClasses);
  }, [selectedClasses, setClassFilter]);
  
  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };
  
  const handleSliderChange = (value: number) => {
    setConfidenceThreshold(value);
  };
  
  return (
    <Stack>
      <Stack gap="xs">
        <Text fw={700} size="xl">{t('recipes:creation.modelConfig.title')}</Text>
        <Text size="sm" c="dimmed">{t('recipes:creation.modelConfig.description')}</Text>
      </Stack>
      
      {/* Model Selection */}
      <Paper withBorder p="lg" radius="md" className="mt-4">
        <Text fw={500} mb="md">{t('recipes:creation.modelConfig.selectModel')}</Text>
        
        {recommendedModels.length === 0 ? (
          <Text c="dimmed" size="sm">{t('recipes:creation.modelConfig.noModels')}</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {recommendedModels.map((model) => (
              <Card
                key={model.id}
                withBorder
                p="md"
                radius="md"
                className={`cursor-pointer transition-all ${
                  formValues.modelId === model.id 
                    ? 'border-2 border-blue-500' 
                    : 'hover:border-blue-300'
                }`}
                onClick={() => setModel(model.id)}
              >
                <Group align="center">
                  <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                    <IconBrain size={20} />
                  </ThemeIcon>
                  
                  <div style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Text fw={500}>{model.name}</Text>
                      {model.recommended && (
                        <Badge color="yellow" leftSection={<IconStar size={12} />}>
                          Recommended
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">Type: {model.type}</Text>
                  </div>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Paper>
      
      {/* Confidence Threshold */}
      <Paper withBorder p="lg" radius="md" className="mt-4">
        <Text fw={500} mb="md">{t('recipes:creation.modelConfig.confidence')}</Text>
        
        <Slider
          defaultValue={formValues.confidenceThreshold || 0.5}
          value={formValues.confidenceThreshold || 0.5}
          onChange={handleSliderChange}
          step={0.05}
          min={0.1}
          max={1}
          label={(value) => `${value * 100}%`}
          marks={[
            { value: 0.1, label: '10%' },
            { value: 0.5, label: '50%' },
            { value: 0.9, label: '90%' },
          ]}
        />
      </Paper>
      
      {/* Class Filter */}
      <Paper withBorder p="lg" radius="md" className="mt-4">
        <Text fw={500} mb="md">{t('recipes:creation.modelConfig.classFilter')}</Text>
        
        <SimpleGrid cols={{ base: 2, md: 3 }} spacing="sm">
          {MOCK_CLASS_CATEGORIES.map((category) => (
            <Checkbox
              key={category.id}
              label={category.label}
              checked={selectedClasses.includes(category.id)}
              onChange={() => handleClassToggle(category.id)}
            />
          ))}
        </SimpleGrid>
      </Paper>
      
      {/* Advanced Settings */}
      <Stack className="mt-4">
        <Button
          variant="subtle"
          rightSection={showAdvanced ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {t('recipes:creation.modelConfig.advanced')}
        </Button>
        
        <Collapse in={showAdvanced}>
          <Paper withBorder p="lg" radius="md">
            <Stack>
              <Text fw={500} mb="xs">Advanced settings will go here</Text>
              <Text size="sm" c="dimmed">
                These could include model-specific parameters, processing options, etc.
              </Text>
            </Stack>
          </Paper>
        </Collapse>
      </Stack>
    </Stack>
  );
}