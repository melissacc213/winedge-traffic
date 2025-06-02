import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Stack,
  Paper,
  Group,
  Title,
  Box,
  Alert,
  ActionIcon,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { PageLayout } from "@/components/page-layout/page-layout";
import { PageLoader } from "@/components/ui";
import { ModelUploadDialog } from "@/components/model-config-editor";
import { useModelDetails } from "@/lib/queries/model";
import { useModelStore } from "@/lib/store/model-store";
import { useTheme } from "@/providers/theme-provider";
import type { ModelConfig } from "../../types/model";
import { notifications } from "@mantine/notifications";
import { getMockModelConfig } from "@/lib/config/mock-model-config";

export function ModelEditPage() {
  const { t } = useTranslation(["models", "common"]);
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const { colorScheme, theme } = useTheme();
  const updateModel = useModelStore((state) => state.updateModel);

  const { data: model, isLoading, error } = useModelDetails(modelId!);
  const [editModalOpened, setEditModalOpened] = useState(false);

  const isDark = colorScheme === "dark";
  const cardBg = isDark ? theme.colors.gray[9] : "white";

  // Open edit modal when component loads
  useEffect(() => {
    if (model && !error) {
      setEditModalOpened(true);
    }
  }, [model, error]);

  // Use the enhanced mock config function with task support
  const getMockConfig = (model: { name: string; description?: string; type?: string; task?: string }) => 
    getMockModelConfig(model, model?.task);

  const handleModelConfigured = (config: ModelConfig) => {
    // Update model in store
    updateModel(modelId!, {
      name: config.name,
      description: config.description,
    });

    notifications.show({
      title: t("models:edit.save.success"),
      message: t("models:edit.save.success_message"),
      color: "green",
      icon: <IconCheck size={16} />
    });

    // Navigate back to models page
    navigate("/models");
  };

  const handleCancel = () => {
    setEditModalOpened(false);
    navigate("/models");
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !model) {
    return (
      <PageLayout title={t("models:edit.error.title")}>
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

  return (
    <PageLayout title={t("models:edit.title")}>
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
          </Group>
        </Paper>

        {/* Model Edit Dialog */}
        {model && (
          <ModelUploadDialog
            opened={editModalOpened}
            onClose={handleCancel}
            title={t("models:edit.title")}
            onModelConfigured={handleModelConfigured}
            isEditMode={true}
            initialConfig={getMockConfig(model)}
          />
        )}
      </Stack>
    </PageLayout>
  );
}