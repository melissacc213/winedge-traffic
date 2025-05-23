import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Title, 
  Text, 
  Group, 
  Box, 
  Stack, 
  Button, 
  TextInput,
  Divider,
  Paper,
  useMantineTheme,
  Tabs,
  Tooltip
} from '@mantine/core';
import { RoadTypeIcon, type RoadType } from './road-type-icon';
import { DirectionIcon, type Direction } from './direction-icon';

interface RoadConfigValues {
  name: string;
  roadType: RoadType;
  direction: Direction;
}

interface RegionConfigProps {
  initialValues?: Partial<RoadConfigValues>;
  onSave: (values: RoadConfigValues) => void;
  onCancel?: () => void;
}

export function RegionConfig({ 
  initialValues = {}, 
  onSave, 
  onCancel 
}: RegionConfigProps) {
  const { t } = useTranslation(['recipes', 'common']);
  const theme = useMantineTheme();
  
  const [values, setValues] = useState<RoadConfigValues>({
    name: initialValues.name || '',
    roadType: initialValues.roadType || 'straight',
    direction: initialValues.direction || 'northToSouth'
  });

  // Available directions based on road type
  const [availableDirections, setAvailableDirections] = useState<Direction[]>([]);

  // When road type changes, update available directions
  useEffect(() => {
    let directions: Direction[] = [];
    
    switch (values.roadType) {
      case 'straight':
        directions = ['northToSouth', 'southToNorth', 'eastToWest', 'westToEast'];
        break;
      case 'tJunction':
        directions = [
          'northToSouth', 'southToNorth', 
          'eastToWest', 'westToEast'
        ];
        break;
      case 'crossroads':
        directions = [
          'northToSouth', 'southToNorth', 
          'eastToWest', 'westToEast',
          'northEastToSouthWest', 'southWestToNorthEast',
          'northWestToSouthEast', 'southEastToNorthWest'
        ];
        break;
    }
    
    setAvailableDirections(directions);
    
    // If current direction is not in available directions, select the first one
    if (!directions.includes(values.direction)) {
      setValues(prev => ({ ...prev, direction: directions[0] }));
    }
  }, [values.roadType]);

  const handleSave = () => {
    onSave(values);
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack spacing="lg">
        <Title order={3}>{t('recipes:creation.regionSetup.title')}</Title>
        <Text c="dimmed">{t('recipes:creation.regionSetup.description')}</Text>
        
        <TextInput
          label={t('recipes:creation.regionSetup.regionName')}
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          placeholder={t('recipes:creation.regionSetup.regionName')}
          required
        />
        
        <Divider label={t('recipes:creation.regionSetup.regionType')} labelPosition="center" />
        
        <Tabs defaultValue="roadType">
          <Tabs.List>
            <Tabs.Tab value="roadType">{t('recipes:roadType.title', 'Road Type')}</Tabs.Tab>
            <Tabs.Tab value="direction">{t('recipes:direction.title')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="roadType" pt="md">
            <Box>
              <Group position="apart" mt="md">
                {(['straight', 'tJunction', 'crossroads'] as RoadType[]).map((type) => (
                  <Paper
                    key={type}
                    p="md"
                    onClick={() => setValues({ ...values, roadType: type })}
                    sx={{
                      cursor: 'pointer',
                      borderColor: values.roadType === type 
                        ? theme.colors.blue[6] 
                        : theme.colors.gray[3],
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderRadius: theme.radius.md,
                      backgroundColor: values.roadType === type 
                        ? theme.colors.blue[0] 
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: values.roadType === type 
                          ? theme.colors.blue[0] 
                          : theme.colors.gray[0]
                      },
                      width: '30%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: theme.spacing.xs
                    }}
                  >
                    <RoadTypeIcon 
                      type={type} 
                      size={64} 
                      color={values.roadType === type ? theme.colors.blue[6] : undefined} 
                    />
                    <Text align="center" fw={500}>
                      {t(`recipes:roadType.${type}`)}
                    </Text>
                  </Paper>
                ))}
              </Group>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="direction" pt="md">
            <Text mb="md">{t('recipes:direction.title')}</Text>
            <Box>
              <Group position="center" spacing="md" mt="md">
                {availableDirections.map((direction) => (
                  <Paper
                    key={direction}
                    p="md"
                    onClick={() => setValues({ ...values, direction })}
                    sx={{
                      cursor: 'pointer',
                      borderColor: values.direction === direction 
                        ? theme.colors.blue[6] 
                        : theme.colors.gray[3],
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderRadius: theme.radius.md,
                      backgroundColor: values.direction === direction 
                        ? theme.colors.blue[0] 
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: values.direction === direction 
                          ? theme.colors.blue[0] 
                          : theme.colors.gray[0]
                      },
                      width: 100,
                      height: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: theme.spacing.xs
                    }}
                  >
                    <DirectionIcon 
                      direction={direction} 
                      size={48} 
                      color={values.direction === direction ? theme.colors.blue[6] : undefined}
                    />
                  </Paper>
                ))}
              </Group>
            </Box>
          </Tabs.Panel>
        </Tabs>
        
        <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {t('common:button.cancel')}
            </Button>
          )}
          <Button onClick={handleSave}>
            {t('common:button.save')}
          </Button>
        </Box>
      </Stack>
    </Card>
  );
}