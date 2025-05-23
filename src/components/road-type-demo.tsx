import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Text, Stack, Group, Box, Radio, Title } from '@mantine/core';
import { RoadTypeIcon, RoadTypeSelector } from './road-type-icon';

type RoadType = 'straight' | 'tJunction' | 'crossroads';

export function RoadTypeDemo() {
  const { t } = useTranslation(['recipes']);
  const [selectedType, setSelectedType] = useState<RoadType>('straight');
  const [displayMode, setDisplayMode] = useState<'icon' | 'selector'>('icon');

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={3} mb="md">Road Type Visualization</Title>
      
      <Radio.Group
        value={displayMode}
        onChange={(value) => setDisplayMode(value as 'icon' | 'selector')}
        name="displayMode"
        label="Display Mode"
        mb="md"
      >
        <Group mt="xs">
          <Radio value="icon" label="Individual Icons" />
          <Radio value="selector" label="Selector Component" />
        </Group>
      </Radio.Group>
      
      {displayMode === 'icon' ? (
        <Stack>
          <Text fw={500} mb="xs">Individual Road Type Icons:</Text>
          
          <Box>
            <Text size="sm" fw={600} mb="xs">Straight Road (with label):</Text>
            <RoadTypeIcon type="straight" showLabel size={36} />
          </Box>
          
          <Box>
            <Text size="sm" fw={600} mb="xs">T-Junction (with label):</Text>
            <RoadTypeIcon type="tJunction" showLabel size={36} />
          </Box>
          
          <Box>
            <Text size="sm" fw={600} mb="xs">Crossroads (with label):</Text>
            <RoadTypeIcon type="crossroads" showLabel size={36} />
          </Box>
          
          <Text size="sm" fw={600} mt="md" mb="xs">Icons Only (with tooltips):</Text>
          <Group>
            <RoadTypeIcon type="straight" size={42} />
            <RoadTypeIcon type="tJunction" size={42} />
            <RoadTypeIcon type="crossroads" size={42} />
          </Group>
        </Stack>
      ) : (
        <Stack>
          <Text fw={500} mb="xs">Road Type Selector Component:</Text>
          <Text size="sm" mb="sm">Click on a road type to select it:</Text>
          
          <RoadTypeSelector 
            value={selectedType}
            onChange={setSelectedType}
            size={42}
          />
          
          <Text mt="md">
            Selected Road Type: <strong>{t(`recipes:roadType.${selectedType}`)}</strong>
          </Text>
        </Stack>
      )}
    </Card>
  );
}