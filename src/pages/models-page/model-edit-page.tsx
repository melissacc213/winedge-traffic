import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Stack,
  Paper,
  Group,
  Title,
  Button,
  Box,
  Alert,
  ActionIcon,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { PageLayout } from "@/components/page-layout/page-layout";
import { PageLoader } from "@/components/ui";
import { ModelConfigEditor } from "@/components/model-config-editor";
import { useModelDetails } from "@/lib/queries/model";
import { useModelStore } from "@/lib/store/model-store";
import { useTheme } from "@/providers/theme-provider";
import type { ModelConfig } from "../../types/model";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

export function ModelEditPage() {
  const { t } = useTranslation(["models", "common"]);
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const { colorScheme, theme } = useTheme();
  const updateModel = useModelStore((state) => state.updateModel);

  const { data: model, isLoading, error } = useModelDetails(modelId!);
  const [config, setConfig] = useState<ModelConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isDark = colorScheme === "dark";
  const cardBg = isDark ? theme.colors.gray[9] : "white";

  // Initialize config when model loads
  useEffect(() => {
    if (model && !config) {
      // Mock model config for demonstration
      const mockConfig: ModelConfig = {
        name: model.name,
        description: model.description,
        task: "object_detection",
        labels: [
          {
            id: "1",
            name: "car",
            color: "#FF6B6B",
            confidence: 0.75,
            width_threshold: 32,
            height_threshold: 32,
            enabled: true,
          },
          {
            id: "2",
            name: "truck",
            color: "#4ECDC4",
            confidence: 0.8,
            width_threshold: 48,
            height_threshold: 48,
            enabled: true,
          },
          {
            id: "3",
            name: "bus",
            color: "#45B7D1",
            confidence: 0.7,
            width_threshold: 64,
            height_threshold: 64,
            enabled: true,
          },
          {
            id: "4",
            name: "motorcycle",
            color: "#FFA07A",
            confidence: 0.65,
            width_threshold: 24,
            height_threshold: 24,
            enabled: false,
          },
          {
            id: "5",
            name: "bicycle",
            color: "#98D8C8",
            confidence: 0.6,
            width_threshold: 20,
            height_threshold: 20,
            enabled: true,
          },
        ],
      };
      setConfig(mockConfig);
    }
  }, [model, config]);

  const handleConfigChange = (newConfig: ModelConfig) => {
    setConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!config || !model) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update model in store
      updateModel(model.id, {
        name: config.name,
        description: config.description,
      });

      notifications.show({
        title: t("models:edit.save.success"),
        message: t("models:edit.save.success_message"),
        color: "green",
      });

      setHasChanges(false);
    } catch (error) {
      notifications.show({
        title: t("models:edit.save.error"),
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      modals.openConfirmModal({
        title: t("models:edit.unsaved_changes.title"),
        children: t("models:edit.unsaved_changes.message"),
        labels: {
          confirm: t("common:action.discard"),
          cancel: t("common:action.cancel"),
        },
        confirmProps: { color: "red" },
        onConfirm: () => navigate(`/models/${modelId}`),
      });
    } else {
      navigate(`/models/${modelId}`);
    }
  };

  const handleExport = () => {
    if (!config) return;

    // Create JSON file for download
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${config.name.replace(/\s+/g, "_")}_config.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    notifications.show({
      title: t("models:edit.export.success"),
      message: t("models:edit.export.success_message"),
      color: "green",
    });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !model) {
    return (
      <PageLayout>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t("models:edit.error.title")}
          color="red"
        >
          {error?.message || t("models:edit.error.not_found")}
        </Alert>
      </PageLayout>
    );
  }

  if (!config) {
    return <PageLoader />;
  }

  return (
    <PageLayout>
      <Stack gap="lg">
        {/* Header */}
        <Paper p="lg" radius="md" withBorder style={{ backgroundColor: cardBg }}>
          <Group justify="space-between" align="center">
            <Group>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={handleCancel}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Box>
                <Title order={3}>{t("models:edit.title")}</Title>
              </Box>
            </Group>

            <Group gap="sm">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconX size={16} />}
                onClick={handleCancel}
              >
                {t("common:action.cancel")}
              </Button>
              <Button
                variant="filled"
                color="blue"
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
                loading={isSaving}
                disabled={!hasChanges}
              >
                {t("common:action.save")}
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Show unsaved changes alert */}
        {hasChanges && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t("models:edit.unsaved_changes.alert")}
            color="yellow"
            withCloseButton={false}
          >
            {t("models:edit.unsaved_changes.alert_message")}
          </Alert>
        )}

        {/* Model Configuration Editor */}
        <ModelConfigEditor
          config={config}
          onConfigChange={handleConfigChange}
          onExport={handleExport}
        />
      </Stack>
    </PageLayout>
  );
}