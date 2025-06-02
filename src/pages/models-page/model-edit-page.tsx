import {
  ActionIcon,
  Alert,
  Box,
  Group,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";
import { useEffect,useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate,useParams } from "react-router-dom";

import { ModelUploadDialog } from "@/components/model-config-editor";
import { PageLayout } from "@/components/page-layout/page-layout";
import { PageLoader } from "@/components/ui";
import { getMockModelConfig } from "@/lib/config/mock-model-config";
import { useModelDetails } from "@/lib/queries/model";
import { useModelStore } from "@/lib/store/model-store";

import type { ModelConfig } from "../../types/model";

export function ModelEditPage() {
  const { t } = useTranslation(["models", "common"]);
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const updateModel = useModelStore((state) => state.updateModel);

  const { data: model, isLoading, error } = useModelDetails(modelId!);
  const [editModalOpened, setEditModalOpened] = useState(false);

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
      description: config.description,
      name: config.name,
    });

    notifications.show({
      color: "green",
      icon: <IconCheck size={16} />,
      message: t("models:edit.save.success_message"),
      title: t("models:edit.save.success")
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