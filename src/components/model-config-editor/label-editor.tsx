import { useState } from 'react';
import {
  Group,
  Text,
  TextInput,
  NumberInput,
  Switch,
  ActionIcon,
  Tooltip,
  Box,
  Stack,
  Paper,
  Badge,
  useMantineTheme,
  Grid,
  Divider
} from '@mantine/core';
import { IconHelp, IconGripVertical, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTheme } from '@/providers/theme-provider';
import { ColorPicker } from '@/components/ui/color-picker';
import type { ModelLabel } from '@/types/model';

interface LabelEditorProps {
  label: ModelLabel;
  index?: number;
  onUpdate: (id: string, updates: Partial<ModelLabel>) => void;
  onToggleEnabled: (id: string) => void;
  isNew?: boolean;
  showReorderControls?: boolean;
}

export function LabelEditor({
  label,
  onUpdate,
  onToggleEnabled,
  isNew = false,
  showReorderControls = true
}: LabelEditorProps) {
  const { colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  const [isExpanded, setIsExpanded] = useState(isNew && label.enabled);
  
  const isDark = colorScheme === 'dark';
  const surfaceBg = isDark ? mantineTheme.colors.dark?.[7] || mantineTheme.colors.gray[8] : mantineTheme.white;
  const borderColor = isDark ? mantineTheme.colors.dark?.[4] || mantineTheme.colors.gray[6] : mantineTheme.colors.gray[3];
  const mutedTextColor = isDark ? mantineTheme.colors.gray[5] : mantineTheme.colors.gray[6];
  const highlightBorder = isNew ? (isDark ? mantineTheme.colors.blue[6] : mantineTheme.colors.blue[4]) : borderColor;

  const handleUpdate = (field: keyof ModelLabel, value: string | number | boolean) => {
    onUpdate(label.id, { [field]: value });
  };

  const handleHeaderClick = () => {
    // Only allow expansion if label is enabled
    if (label.enabled) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Paper
      radius="md"
      withBorder
      style={{
        backgroundColor: surfaceBg,
        borderColor: label.enabled ? (isNew ? highlightBorder : borderColor) : mantineTheme.colors.gray[5],
        borderWidth: isNew ? '2px' : '1px',
        opacity: label.enabled ? 1 : 0.7,
        transition: 'all 0.2s ease',
        boxShadow: isNew ? mantineTheme.shadows?.md : mantineTheme.shadows?.xs,
        overflow: 'hidden'
      }}
    >
      {/* Header Row - Always Visible */}
      <Box
        p="sm"
        style={{
          backgroundColor: isDark ? mantineTheme.colors.dark?.[6] || mantineTheme.colors.gray[7] : mantineTheme.colors.gray[0],
          borderBottom: isExpanded ? `1px solid ${borderColor}` : 'none',
          cursor: label.enabled ? 'pointer' : 'default'
        }}
        onClick={handleHeaderClick}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" align="center" wrap="nowrap" style={{ flex: 1 }}>
            {showReorderControls && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                style={{ cursor: 'grab' }}
                onClick={(e) => e.stopPropagation()}
              >
                <IconGripVertical size={16} />
              </ActionIcon>
            )}
            
            <Box
              style={{
                width: 24,
                height: 24,
                backgroundColor: label.color,
                borderRadius: mantineTheme.radius.sm,
                border: `2px solid ${borderColor}`,
                flexShrink: 0
              }}
            />
            
            <Text
              fw={600}
              size="sm"
              style={{
                textDecoration: label.enabled ? 'none' : 'line-through',
                color: label.enabled ? (isDark ? mantineTheme.white : mantineTheme.black) : mutedTextColor
              }}
            >
              {label.name}
            </Text>
            
            {/* Confidence badge */}
            <Badge
              size="xs"
              variant="light"
              color={(label.confidence !== undefined ? label.confidence : 0.5) >= 0.8 ? 'green' : (label.confidence !== undefined ? label.confidence : 0.5) >= 0.6 ? 'yellow' : 'orange'}
            >
              {((label.confidence !== undefined ? label.confidence : 0.5) * 100).toFixed(0)}%
            </Badge>
          </Group>
          
          <Group gap="xs" wrap="nowrap">
            <Tooltip label={label.enabled ? 'Disable label' : 'Enable label'}>
              <Switch
                checked={label.enabled}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleEnabled(label.id);
                  // Collapse when disabling
                  if (label.enabled) {
                    setIsExpanded(false);
                  }
                }}
                size="sm"
                color="blue"
                styles={{
                  track: {
                    cursor: 'pointer'
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
            
            {label.enabled && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Box>

      {/* Expanded Details - Only show if enabled */}
      {isExpanded && label.enabled && (
        <Box p="md">
          <Stack gap="md">
            {/* Name and Color on same row */}
            <Grid gutter="md" align="flex-end">
              <Grid.Col span={8}>
                <TextInput
                  label="Label Name"
                  value={label.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  size="sm"
                  placeholder="Enter label name"
                  styles={{
                    input: {
                      backgroundColor: isDark ? mantineTheme.colors.dark?.[6] || mantineTheme.colors.gray[7] : mantineTheme.colors.gray[0]
                    }
                  }}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <ColorPicker
                  label="Color"
                  value={label.color || '#1890ff'}
                  onChange={(color) => handleUpdate('color', color)}
                  disabled={!label.enabled}
                />
              </Grid.Col>
            </Grid>
            
            <Divider />
            
            {/* Threshold Settings */}
            <Box>
              <Group gap="xs" mb="sm">
                <Text size="sm" fw={600}>Detection Settings</Text>
                <Tooltip 
                  label="Configure detection parameters for this label" 
                  position="top"
                >
                  <ActionIcon variant="subtle" size="xs" color={mutedTextColor}>
                    <IconHelp size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              
              <Grid gutter="md">
                <Grid.Col span={3}>
                  <NumberInput
                    label="Confidence"
                    description="Min detection score"
                    value={label.confidence !== undefined ? label.confidence : 0.5}
                    onChange={(value) => handleUpdate('confidence', value !== undefined ? value : 0.5)}
                    min={0}
                    max={1}
                    step={0.05}
                    decimalScale={2}
                    size="sm"
                    styles={{
                      input: {
                        backgroundColor: isDark ? mantineTheme.colors.dark?.[6] || mantineTheme.colors.gray[7] : mantineTheme.colors.gray[0]
                      }
                    }}
                    rightSection={
                      <Tooltip label="Higher values = more accurate but may miss detections">
                        <ActionIcon variant="subtle" size="xs" color={mutedTextColor}>
                          <IconHelp size={12} />
                        </ActionIcon>
                      </Tooltip>
                    }
                  />
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <NumberInput
                    label="Min Width"
                    description="Pixels"
                    value={label.width_threshold !== undefined ? label.width_threshold : 0}
                    onChange={(value) => handleUpdate('width_threshold', value !== undefined ? value : 0)}
                    min={0}
                    max={1000}
                    size="sm"
                    styles={{
                      input: {
                        backgroundColor: isDark ? mantineTheme.colors.dark?.[6] || mantineTheme.colors.gray[7] : mantineTheme.colors.gray[0]
                      }
                    }}
                  />
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <NumberInput
                    label="Min Height"
                    description="Pixels"
                    value={label.height_threshold !== undefined ? label.height_threshold : 0}
                    onChange={(value) => handleUpdate('height_threshold', value !== undefined ? value : 0)}
                    min={0}
                    max={1000}
                    size="sm"
                    styles={{
                      input: {
                        backgroundColor: isDark ? mantineTheme.colors.dark?.[6] || mantineTheme.colors.gray[7] : mantineTheme.colors.gray[0]
                      }
                    }}
                  />
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <NumberInput
                    label="Min Area"
                    description="Square pixels"
                    value={label.area_threshold !== undefined ? label.area_threshold : 0}
                    onChange={(value) => handleUpdate('area_threshold', value !== undefined ? value : 0)}
                    min={0}
                    max={100000}
                    size="sm"
                    styles={{
                      input: {
                        backgroundColor: isDark ? mantineTheme.colors.dark?.[6] || mantineTheme.colors.gray[7] : mantineTheme.colors.gray[0]
                      }
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Box>
            
            {/* Status Badge */}
            <Group justify="flex-end" align="center">
              <Badge
                variant="dot"
                color={label.enabled ? 'green' : 'gray'}
                size="sm"
              >
                {label.enabled ? 'Active' : 'Inactive'}
              </Badge>
            </Group>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}