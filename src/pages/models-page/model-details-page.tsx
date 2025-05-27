import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Stack,
  Paper,
  Group,
  Title,
  Text,
  Button,
  Badge,
  Divider,
  Box,
  Grid,
  Card,
  Alert,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Timeline,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconEdit,
  IconDownload,
  IconTrash,
  IconCpu,
  IconDatabase,
  IconFileZip,
  IconClock,
  IconTag,
  IconAlertCircle,
} from "@tabler/icons-react";
import { PageLayout } from "@/components/page-layout/page-layout";
import { PageLoader } from "@/components/ui";
import { useModelDetails, useDeleteModel } from "@/lib/queries/model";
import { useTheme } from "@/providers/theme-provider";
import type { ModelConfig } from "../../types/model";
import { useState } from "react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

export function ModelDetailsPage() {
  const { t } = useTranslation(["models", "common"]);
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const { colorScheme, theme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: model, isLoading, error } = useModelDetails(modelId!);
  const deleteModelMutation = useDeleteModel();

  const isDark = colorScheme === "dark";
  const cardBg = isDark ? theme.colors.gray[9] : "white";
  const surfaceBg = isDark ? theme.colors.gray[8] : theme.colors.gray[0];

  // Format file size to human readable
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "available":
        return "green";
      case "pending":
        return "yellow";
      case "failed":
      case "error":
        return "red";
      case "processing":
        return "blue";
      default:
        return "gray";
    }
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      title: t("models:details.delete.title"),
      children: (
        <Text size="sm">
          {t("models:details.delete.message", { name: model?.name })}
        </Text>
      ),
      labels: {
        confirm: t("common:action.delete"),
        cancel: t("common:action.cancel"),
      },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteModelMutation.mutateAsync(modelId!);
          notifications.show({
            title: t("models:details.delete.success"),
            message: t("models:details.delete.success_message"),
            color: "green",
          });
          navigate("/models");
        } catch (error) {
          notifications.show({
            title: t("models:details.delete.error"),
            message: error instanceof Error ? error.message : "Unknown error",
            color: "red",
          });
          setIsDeleting(false);
        }
      },
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
          title={t("models:details.error.title")}
          color="red"
        >
          {error?.message || t("models:details.error.not_found")}
        </Alert>
      </PageLayout>
    );
  }

  // Mock model config for demonstration
  const mockConfig: ModelConfig = {
    name: model.name,
    task: "object_detection",
    labels: [
      { id: "1", name: "car", color: "#FF6B6B", confidence: 0.75, enabled: true },
      { id: "2", name: "truck", color: "#4ECDC4", confidence: 0.8, enabled: true },
      { id: "3", name: "bus", color: "#45B7D1", confidence: 0.7, enabled: true },
      { id: "4", name: "motorcycle", color: "#FFA07A", confidence: 0.65, enabled: false },
      { id: "5", name: "bicycle", color: "#98D8C8", confidence: 0.6, enabled: true },
    ],
  };

  const activeLabels = mockConfig.labels.filter((label) => label.enabled);

  return (
    <PageLayout>
      <Stack gap="lg">
        {/* Header */}
        <Paper p="lg" radius="md" withBorder style={{ backgroundColor: cardBg }}>
          <Group justify="space-between" align="flex-start">
            <Group>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={() => navigate("/models")}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Box>
                <Title order={3}>{model.name}</Title>
                <Group gap="xs" mt="xs">
                  <Badge color={getStatusColor(model.status)} variant="light">
                    {t(`models:status.${model.status}`)}
                  </Badge>
                  <Badge variant="outline" color="gray">
                    {model.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" color="blue">
                    ID: {model.id}
                  </Badge>
                </Group>
              </Box>
            </Group>

            <Group gap="sm">
              <Button
                variant="light"
                color="blue"
                leftSection={<IconEdit size={16} />}
                onClick={() => navigate(`/models/${modelId}/edit`)}
                disabled={model.status !== "active" && model.status !== "available"}
              >
                {t("models:actions.edit")}
              </Button>
              <Button
                variant="light"
                color="green"
                leftSection={<IconDownload size={16} />}
                disabled={model.status !== "active" && model.status !== "available"}
              >
                {t("models:actions.download")}
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={handleDelete}
                loading={isDeleting}
              >
                {t("models:actions.delete")}
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Model Information */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Overview Card */}
              <Paper p="lg" radius="md" withBorder style={{ backgroundColor: cardBg }}>
                <Title order={5} mb="md">
                  {t("models:details.overview")}
                </Title>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t("models:details.description")}
                    </Text>
                    <Text size="sm" fw={500}>
                      {model.description || t("models:details.no_description")}
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t("models:details.file_size")}
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatSize(model.size)}
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t("models:details.created_date")}
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatDate(model.createdAt)}
                    </Text>
                  </Group>
                  {model.uploadedAt && (
                    <>
                      <Divider />
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t("models:details.uploaded_date")}
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatDate(model.uploadedAt)}
                        </Text>
                      </Group>
                    </>
                  )}
                </Stack>
              </Paper>

              {/* Configuration Card */}
              <Paper p="lg" radius="md" withBorder style={{ backgroundColor: cardBg }}>
                <Title order={5} mb="md">
                  {t("models:details.configuration")}
                </Title>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t("models:details.task_type")}
                    </Text>
                    <Badge variant="light" color="blue">
                      {mockConfig.task}
                    </Badge>
                  </Group>
                  <Divider />
                  <Box>
                    <Group justify="space-between" mb="sm">
                      <Text size="sm" c="dimmed">
                        {t("models:details.labels")}
                      </Text>
                      <Badge variant="outline" size="sm">
                        {activeLabels.length} / {mockConfig.labels.length} active
                      </Badge>
                    </Group>
                    <ScrollArea.Autosize mah={200}>
                      <Group gap="xs">
                        {mockConfig.labels.map((label) => (
                          <Tooltip
                            key={label.id}
                            label={`Confidence: ${label.confidence || 0.5}`}
                            withArrow
                          >
                            <Badge
                              variant={label.enabled ? "light" : "outline"}
                              color={label.enabled ? undefined : "gray"}
                              leftSection={
                                <Box
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: label.color,
                                  }}
                                />
                              }
                            >
                              {label.name}
                            </Badge>
                          </Tooltip>
                        ))}
                      </Group>
                    </ScrollArea.Autosize>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* Technical Details Card */}
              <Paper p="lg" radius="md" withBorder style={{ backgroundColor: cardBg }}>
                <Title order={5} mb="md">
                  {t("models:details.technical_info")}
                </Title>
                <Stack gap="md">
                  <Card p="sm" radius="sm" style={{ backgroundColor: surfaceBg }}>
                    <Group>
                      <IconCpu size={20} color={theme.colors.blue[6]} />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed">
                          {t("models:details.model_type")}
                        </Text>
                        <Text size="sm" fw={500}>
                          {model.type.toUpperCase()}
                        </Text>
                      </Box>
                    </Group>
                  </Card>

                  <Card p="sm" radius="sm" style={{ backgroundColor: surfaceBg }}>
                    <Group>
                      <IconDatabase size={20} color={theme.colors.green[6]} />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed">
                          {t("models:details.storage_size")}
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatSize(model.size)}
                        </Text>
                      </Box>
                    </Group>
                  </Card>

                  <Card p="sm" radius="sm" style={{ backgroundColor: surfaceBg }}>
                    <Group>
                      <IconFileZip size={20} color={theme.colors.orange[6]} />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed">
                          {t("models:details.file_format")}
                        </Text>
                        <Text size="sm" fw={500}>
                          Compressed Archive
                        </Text>
                      </Box>
                    </Group>
                  </Card>

                  <Card p="sm" radius="sm" style={{ backgroundColor: surfaceBg }}>
                    <Group>
                      <IconTag size={20} color={theme.colors.purple[6]} />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed">
                          {t("models:details.version")}
                        </Text>
                        <Text size="sm" fw={500}>
                          v1.0.0
                        </Text>
                      </Box>
                    </Group>
                  </Card>
                </Stack>
              </Paper>

              {/* Activity Timeline */}
              <Paper p="lg" radius="md" withBorder style={{ backgroundColor: cardBg }}>
                <Title order={5} mb="md">
                  {t("models:details.activity")}
                </Title>
                <Timeline active={1} bulletSize={24} lineWidth={2}>
                  <Timeline.Item
                    bullet={<IconClock size={12} />}
                    title={t("models:details.model_created")}
                  >
                    <Text size="xs" c="dimmed">
                      {formatDate(model.createdAt)}
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<IconCpu size={12} />}
                    title={t("models:details.model_validated")}
                    color="green"
                  >
                    <Text size="xs" c="dimmed">
                      {formatDate(model.createdAt)} (+ 2 min)
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<IconDatabase size={12} />}
                    title={t("models:details.ready_for_use")}
                    color="blue"
                  >
                    <Text size="xs" c="dimmed">
                      {formatDate(model.createdAt)} (+ 5 min)
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </PageLayout>
  );
}