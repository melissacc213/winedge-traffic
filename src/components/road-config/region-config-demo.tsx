import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Grid, 
  Paper, 
  Box, 
  Text, 
  List, 
  ThemeIcon,
  Stack,
  Group,
  Title,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { RegionConfig } from './region-config';
import { RoadTypeIcon } from './road-type-icon';
import { DirectionIcon } from './direction-icon';

interface RegionValues {
  name: string;
  roadType: 'straight' | 'tJunction' | 'crossroads';
  direction: string;
}

export function RegionConfigDemo() {
  const { t } = useTranslation(['recipes']);
  const [savedConfig, setSavedConfig] = useState<RegionValues | null>(null);

  const handleSave = (values: RegionValues) => {
    setSavedConfig(values);
    console.log('Saved values:', values);
  };

  return (
    <Container size="xl" py="xl">
      <Grid gutter="xl">
        <Grid.Col span={12}>
          <Title order={2} align="center" mb="xl">
            Region Configuration Demo
          </Title>
        </Grid.Col>
        
        <Grid.Col span={7}>
          <RegionConfig 
            onSave={handleSave}
            initialValues={{
              name: 'Main Intersection',
              roadType: 'crossroads',
              direction: 'northToSouth'
            }}
          />
        </Grid.Col>
        
        <Grid.Col span={5}>
          <Stack spacing="lg">
            <Paper p="lg" withBorder>
              <Title order={4} mb="md">How to Use</Title>
              <List 
                spacing="sm"
                icon={
                  <ThemeIcon color="teal" size={24} radius="xl">
                    <IconCheck size={16} />
                  </ThemeIcon>
                }
              >
                <List.Item>Enter a name for your region</List.Item>
                <List.Item>Select a road type that best matches your traffic scenario</List.Item>
                <List.Item>Choose the primary traffic direction</List.Item>
                <List.Item>Click Save to apply your configuration</List.Item>
              </List>
            </Paper>
            
            {savedConfig && (
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">Configuration Preview</Title>
                <Stack spacing="md">
                  <Box>
                    <Text fw={500}>Region Name:</Text>
                    <Text>{savedConfig.name}</Text>
                  </Box>
                  
                  <Box>
                    <Text fw={500}>Road Type:</Text>
                    <Group align="center" spacing="xs">
                      <RoadTypeIcon 
                        type={savedConfig.roadType} 
                        size={24} 
                      />
                      <Text>{t(`recipes:roadType.${savedConfig.roadType}`)}</Text>
                    </Group>
                  </Box>
                  
                  <Box>
                    <Text fw={500}>Traffic Direction:</Text>
                    <Group align="center" spacing="xs">
                      <DirectionIcon 
                        direction={savedConfig.direction as any} 
                        size={24} 
                      />
                      <Text>{t(`recipes:direction.${savedConfig.direction}`)}</Text>
                    </Group>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}