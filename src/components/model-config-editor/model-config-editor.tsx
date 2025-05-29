import { useState, useCallback } from "react";
import {
  Stack,
  Text,
  Button,
  Group,
  TextInput,
  Textarea,
  Paper,
  Title,
  Badge,
  ActionIcon,
  Tooltip,
  Box,
  Alert,
  Divider,
  ScrollArea,
} from "@mantine/core";
import {
  IconDownload,
  IconPlus,
  IconEye,
  IconEyeOff,
  IconSettings,
} from "@tabler/icons-react";
import { useTheme } from "@/providers/theme-provider";
import { LabelEditor } from "./label-editor";
import type { ModelConfig, ModelLabel } from "@/types/model";
import { v4 as uuidv4 } from "uuid";

interface ModelConfigEditorProps {
  config: ModelConfig;
  onConfigChange: (config: ModelConfig) => void;
  onExport?: () => void;
  onSave?: () => void;
}

export function ModelConfigEditor({
  config,
  onConfigChange,
  onExport,
  onSave,
}: ModelConfigEditorProps) {
  const { colorScheme, theme } = useTheme();
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [newlyAddedLabelId, setNewlyAddedLabelId] = useState<string | null>(
    null
  );

  const isDark = colorScheme === "dark";
  const cardBg = isDark ? theme.colors.gray[9] : "white";
  const surfaceBg = isDark ? theme.colors.gray[8] : theme.colors.gray[0];

  const enabledLabels = config.labels.filter(
    (label) => label.enabled !== false
  );
  const disabledLabels = config.labels.filter(
    (label) => label.enabled === false
  );
  const visibleLabels = showOnlyEnabled ? enabledLabels : config.labels;

  const handleUpdateLabel = useCallback(
    (id: string, updates: Partial<ModelLabel>) => {
      const updatedLabels = config.labels.map((label) =>
        label.id === id ? { ...label, ...updates } : label
      );
      onConfigChange({ ...config, labels: updatedLabels });
    },
    [config, onConfigChange]
  );

  const handleDeleteLabel = useCallback(
    (id: string) => {
      const updatedLabels = config.labels.filter((label) => label.id !== id);
      onConfigChange({ ...config, labels: updatedLabels });
    },
    [config, onConfigChange]
  );

  const handleToggleEnabled = useCallback(
    (id: string) => {
      const updatedLabels = config.labels.map((label) =>
        label.id === id ? { ...label, enabled: !label.enabled } : label
      );
      onConfigChange({ ...config, labels: updatedLabels });
    },
    [config, onConfigChange]
  );

  const handleAddLabel = useCallback(() => {
    const newLabel: ModelLabel = {
      id: uuidv4(),
      name: `New Label ${config.labels.length + 1}`,
      color: generateRandomColor(),
      confidence: 0.5,
      width_threshold: 32,
      height_threshold: 32,
      enabled: true,
    };
    // Add new label at the beginning
    onConfigChange({ ...config, labels: [newLabel, ...config.labels] });
    setNewlyAddedLabelId(newLabel.id);
    // Clear the newly added flag after a short delay
    setTimeout(() => setNewlyAddedLabelId(null), 3000);
  }, [config, onConfigChange]);

  const handleToggleAllEnabled = useCallback(() => {
    const allEnabled = config.labels.every((label) => label.enabled !== false);
    const updatedLabels = config.labels.map((label) => ({
      ...label,
      enabled: !allEnabled,
    }));
    onConfigChange({ ...config, labels: updatedLabels });
  }, [config, onConfigChange]);

  return (
    <Stack gap="lg">
      {/* Header */}
      <Paper p="lg" radius="md" withBorder style={{ backgroundColor: cardBg }}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={3} mb="xs">
                Model Configuration
              </Title>
              <Group gap="xs">
                <Badge variant="light" color="blue" size="lg">
                  {config.task || "object_detection"}
                </Badge>
                <Badge variant="outline" color="gray">
                  {config.labels.length} labels
                </Badge>
                <Badge variant="outline" color="green">
                  {enabledLabels.length} enabled
                </Badge>
              </Group>
            </Box>

            <Group gap="sm">
              {onSave && (
                <Button variant="light" color="blue" onClick={onSave}>
                  Save Changes
                </Button>
              )}
              {/* {onExport && (
                <Button
                  variant="filled"
                  color="blue"
                  leftSection={<IconDownload size={16} />}
                  onClick={onExport}
                >
                  Export Config
                </Button>
              )} */}
            </Group>
          </Group>

          <Group grow>
            <TextInput
              label="Model Name"
              value={config.name}
              onChange={(e) =>
                onConfigChange({ ...config, name: e.target.value })
              }
            />

            <TextInput
              label="Task Type"
              value={config.task}
              onChange={(e) =>
                onConfigChange({ ...config, task: e.target.value })
              }
            />
          </Group>

          <Textarea
            label="Description"
            value={config.description || ""}
            onChange={(e) =>
              onConfigChange({ ...config, description: e.target.value })
            }
            placeholder="Enter model description..."
            minRows={2}
          />
        </Stack>
      </Paper>

      {/* Label Management */}
      <Paper p="lg" radius="md" withBorder style={{ backgroundColor: cardBg }}>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={4}>Label Configuration</Title>

            <Group gap="sm">
              <Tooltip label="Toggle visibility filter">
                <ActionIcon
                  variant={showOnlyEnabled ? "filled" : "light"}
                  color="blue"
                  onClick={() => setShowOnlyEnabled(!showOnlyEnabled)}
                >
                  {showOnlyEnabled ? (
                    <IconEye size={16} />
                  ) : (
                    <IconEyeOff size={16} />
                  )}
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Toggle all labels">
                <ActionIcon
                  variant="light"
                  color="orange"
                  onClick={handleToggleAllEnabled}
                >
                  <IconSettings size={16} />
                </ActionIcon>
              </Tooltip>

              {/* <Button
                leftSection={<IconPlus size={16} />}
                variant="light"
                color="green"
                onClick={handleAddLabel}
                size="sm"
              >
                Add Label
              </Button> */}
            </Group>
          </Group>

          {disabledLabels.length > 0 && !showOnlyEnabled && (
            <Alert variant="light" color="orange">
              <Text size="sm">
                {disabledLabels.length} label
                {disabledLabels.length !== 1 ? "s" : ""} disabled. These won't
                be used for detection.
              </Text>
            </Alert>
          )}

          <Divider />

          <ScrollArea.Autosize mah={500}>
            <Stack gap="sm">
              {visibleLabels.length === 0 ? (
                <Paper
                  p="xl"
                  radius="md"
                  style={{ backgroundColor: surfaceBg }}
                >
                  <Text ta="center" c="dimmed">
                    {showOnlyEnabled
                      ? "No enabled labels"
                      : "No labels configured"}
                  </Text>
                </Paper>
              ) : (
                visibleLabels.map((label, index) => (
                  <LabelEditor
                    key={label.id}
                    label={label}
                    index={index}
                    onUpdate={handleUpdateLabel}
                    onDelete={handleDeleteLabel}
                    onToggleEnabled={handleToggleEnabled}
                    isNew={label.id === newlyAddedLabelId}
                    showReorderControls={false}
                  />
                ))
              )}
            </Stack>
          </ScrollArea.Autosize>
        </Stack>
      </Paper>
    </Stack>
  );
}

function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 20); // 70-90%
  const lightness = 45 + Math.floor(Math.random() * 20); // 45-65%

  return hslToHex(hue, saturation, lightness);
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
