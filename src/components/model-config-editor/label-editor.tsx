import { useState } from 'react';
import {
  Group,
  Text,
  TextInput,
  ColorInput,
  NumberInput,
  Switch,
  ActionIcon,
  Tooltip,
  Box,
  Stack,
  Paper,
  Badge,
  Flex
} from '@mantine/core';
import { IconTrash, IconEye, IconEyeOff, IconHelp, IconGripVertical } from '@tabler/icons-react';
import { useTheme } from '@/providers/theme-provider';
import type { ModelLabel } from '@/types/model';

interface LabelEditorProps {
  label: ModelLabel;
  index: number;
  onUpdate: (id: string, updates: Partial<ModelLabel>) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  isNew?: boolean;
  showReorderControls?: boolean;
}

export function LabelEditor({
  label,
  index,
  onUpdate,
  onDelete,
  onToggleEnabled,
  isNew = false,
  showReorderControls = true
}: LabelEditorProps) {
  const { colorScheme, theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(isNew);
  
  const isDark = colorScheme === 'dark';
  const surfaceBg = isDark ? theme.colors.gray[8] : theme.colors.gray[0];
  const borderColor = isDark ? theme.colors.gray[6] : theme.colors.gray[3];
  const mutedTextColor = isDark ? theme.colors.gray[5] : theme.colors.gray[6];
  const highlightBorder = isNew ? (isDark ? theme.colors.blue[6] : theme.colors.blue[4]) : borderColor;

  const handleUpdate = (field: keyof ModelLabel, value: any) => {
    onUpdate(label.id, { [field]: value });
  };

  return (
    <Paper
      p="md"
      radius="md"
      withBorder
      style={{
        backgroundColor: surfaceBg,
        borderColor: label.enabled ? highlightBorder : theme.colors.gray[5],
        borderWidth: isNew ? '2px' : '1px',
        opacity: label.enabled ? 1 : 0.6,
        transition: 'all 0.2s ease',
        boxShadow: isNew ? `0 0 0 1px ${isDark ? theme.colors.blue[6] : theme.colors.blue[4]}` : undefined
      }}
    >
      <Stack gap="sm">
        {/* Header Row */}
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            {showReorderControls && (
              <ActionIcon
                variant="subtle"
                color="gray"
                style={{ cursor: 'grab' }}
              >
                <IconGripVertical size={16} />
              </ActionIcon>
            )}
            
            {showReorderControls && (
              <Badge
                variant="light"
                color={isDark ? 'blue.4' : 'blue.6'}
                size="sm"
              >
                {index + 1}
              </Badge>
            )}
            
            <Box
              style={{
                width: 20,
                height: 20,
                backgroundColor: label.color,
                borderRadius: theme.radius?.sm || '4px',
                border: `2px solid ${borderColor}`,
                cursor: 'pointer'
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            />
            
            <Text
              fw={500}
              size="sm"
              style={{
                cursor: 'pointer',
                textDecoration: label.enabled ? 'none' : 'line-through'
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {label.name}
            </Text>
          </Group>
          
          <Group gap="xs">
            <Tooltip label={label.enabled ? 'Hide label' : 'Show label'}>
              <ActionIcon
                variant="subtle"
                color={label.enabled ? 'blue' : 'gray'}
                onClick={() => onToggleEnabled(label.id)}
              >
                {label.enabled ? <IconEye size={16} /> : <IconEyeOff size={16} />}
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Delete label">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onDelete(label.id)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Expanded Details */}
        {isExpanded && (
          <Stack gap="md" pl="xl">
            <Group grow>
              <TextInput
                label="Label Name"
                value={label.name}
                onChange={(e) => handleUpdate('name', e.target.value)}
                size="sm"
              />
              
              <ColorInput
                label="Color"
                value={label.color}
                onChange={(color) => handleUpdate('color', color)}
                format="hex"
                size="sm"
                swatches={[
                  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
                  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
                ]}
              />
            </Group>
            
            <Group grow>
              <Box>
                <Group gap="xs" mb="xs">
                  <Text size="sm" fw={500}>Confidence Threshold</Text>
                  <Tooltip label="Minimum confidence score (0-1) required for detection. Higher values mean more confident detections but may miss some objects." position="top" multiline w={200}>
                    <ActionIcon variant="subtle" size="xs" color={mutedTextColor}>
                      <IconHelp size={12} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <NumberInput
                  value={label.confidence}
                  onChange={(value) => handleUpdate('confidence', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  decimalScale={2}
                  size="sm"
                />
              </Box>
              
              <Box>
                <Group gap="xs" mb="xs">
                  <Text size="sm" fw={500}>Width Threshold (px)</Text>
                  <Tooltip label="Minimum width in pixels for a detection to be considered valid. Objects smaller than this will be filtered out." position="top" multiline w={200}>
                    <ActionIcon variant="subtle" size="xs" color={mutedTextColor}>
                      <IconHelp size={12} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <NumberInput
                  value={label.width_threshold}
                  onChange={(value) => handleUpdate('width_threshold', value)}
                  min={1}
                  max={1000}
                  size="sm"
                />
              </Box>
              
              <Box>
                <Group gap="xs" mb="xs">
                  <Text size="sm" fw={500}>Height Threshold (px)</Text>
                  <Tooltip label="Minimum height in pixels for a detection to be considered valid. Objects smaller than this will be filtered out." position="top" multiline w={200}>
                    <ActionIcon variant="subtle" size="xs" color={mutedTextColor}>
                      <IconHelp size={12} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <NumberInput
                  value={label.height_threshold}
                  onChange={(value) => handleUpdate('height_threshold', value)}
                  min={1}
                  max={1000}
                  size="sm"
                />
              </Box>
            </Group>
            
            <Flex align="center" gap="md">
              <Switch
                label="Enable Detection"
                checked={label.enabled}
                onChange={(e) => handleUpdate('enabled', e.target.checked)}
                size="sm"
              />
              
              <Text size="xs" c={mutedTextColor}>
                Confidence: {((label.confidence || 0.5) * 100).toFixed(0)}% | 
                Size: {label.width_threshold}×{label.height_threshold}px
              </Text>
            </Flex>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}