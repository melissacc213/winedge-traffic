import { useCallback } from "react";
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
  IconSettings,
} from "@tabler/icons-react";
import { useTheme } from "@/providers/theme-provider";
import { LabelEditor } from "./label-editor";
import type { ModelConfig, ModelLabel } from "@/types/model";

interface ModelConfigEditorProps {
  config: ModelConfig | null;
  onConfigChange: (config: ModelConfig) => void;
  onSave?: () => void;
}

export function ModelConfigEditor({
  config,
  onConfigChange,
  onSave,
}: ModelConfigEditorProps) {
  const { colorScheme, theme } = useTheme();

  const handleUpdateLabel = useCallback(
    (id: string, updates: Partial<ModelLabel>) => {
      if (!config) return;
      const updatedLabels = config.labels.map((label) =>
        label.id === id ? { ...label, ...updates } : label
      );
      onConfigChange({ ...config, labels: updatedLabels });
    },
    [config, onConfigChange]
  );

  const handleToggleEnabled = useCallback(
    (id: string) => {
      if (!config) return;
      const updatedLabels = config.labels.map((label) =>
        label.id === id ? { ...label, enabled: !label.enabled } : label
      );
      onConfigChange({ ...config, labels: updatedLabels });
    },
    [config, onConfigChange]
  );

  // Delete functionality removed

  const handleToggleAllEnabled = useCallback(() => {
    if (!config) return;
    const allEnabled = config.labels.every((label) => label.enabled !== false);
    const updatedLabels = config.labels.map((label) => ({
      ...label,
      enabled: !allEnabled,
    }));
    onConfigChange({ ...config, labels: updatedLabels });
  }, [config, onConfigChange]);

  const isDark = colorScheme === "dark";
  const cardBg = isDark ? theme.colors.gray[9] : "white";
  const surfaceBg = isDark ? theme.colors.gray[8] : theme.colors.gray[0];

  // Guard against null config
  if (!config || !config.labels) {
    return null;
  }

  const enabledLabels = config.labels.filter(
    (label) => label.enabled !== false
  );
  const disabledLabels = config.labels.filter(
    (label) => label.enabled === false
  );

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

            <Tooltip label="Toggle all labels">
              <ActionIcon
                variant="light"
                color="orange"
                onClick={handleToggleAllEnabled}
              >
                <IconSettings size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {disabledLabels.length > 0 && (
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
              {config.labels.length === 0 ? (
                <Paper
                  p="xl"
                  radius="md"
                  style={{ backgroundColor: surfaceBg }}
                >
                  <Text ta="center" c="dimmed">
                    No labels configured
                  </Text>
                </Paper>
              ) : (
                config.labels.map((label, index) => (
                  <LabelEditor
                    key={label.id}
                    label={label}
                    index={index}
                    onUpdate={handleUpdateLabel}
                    onToggleEnabled={handleToggleEnabled}
                    isNew={false}
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
