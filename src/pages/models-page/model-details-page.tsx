import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Timeline,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate,useParams } from "react-router-dom";

import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { PageLoader } from "@/components/ui";
import { useDeleteModel,useModelDetails } from "@/lib/queries/model";
import { getRegionColor } from "@/lib/theme-utils";

import type { ModelConfig } from "../../types/model";

export function ModelDetailsPage() {
  const { t } = useTranslation(["models", "common"]);
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: model, isLoading, error } = useModelDetails(modelId!);
  const deleteModelMutation = useDeleteModel();

  const cardBg = isDark ? theme.colors.dark[7] : theme.white;
  const surfaceBg = isDark ? theme.colors.dark[6] : theme.colors.gray[0];

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
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "long",
      year: "numeric",
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
      children: (
        <Text size="sm">
          {t("models:details.delete.message", { name: model?.name })}
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: {
        cancel: t("common:action.cancel"),
        confirm: t("common:action.delete"),
      },
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteModelMutation.mutateAsync(modelId!);
          notifications.show({
            color: "green",
            message: t("models:details.delete.success_message"),
            title: t("models:details.delete.success"),
          });
          navigate("/models");
        } catch (error) {
          notifications.show({
            color: "red",
            message: error instanceof Error ? error.message : "Unknown error",
            title: t("models:details.delete.error"),
          });
          setIsDeleting(false);
        }
      },
      title: t("models:details.delete.title"),
    });
  };

  // Guard against invalid modelId
  if (!modelId) {
    return (
      <PageLayout title={t("models:details.error.title")}>
        <Alert
          icon={<Icons.AlertCircle size={16} />}
          title={t("models:details.error.title")}
          color="red"
        >
          {t("models:details.error.not_found")}
        </Alert>
      </PageLayout>
    );
  }

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !model) {
    return (
      <PageLayout title={t("models:details.error.title")}>
        <Stack gap="lg">
          <Paper p="lg" radius="md" withBorder>
            <Group>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={() => navigate("/models")}
              >
                <Icons.ArrowLeft size={20} />
              </ActionIcon>
              <Title order={3}>Model Details</Title>
            </Group>
          </Paper>
          <Alert
            icon={<Icons.AlertCircle size={16} />}
            title={t("models:details.error.title")}
            color="red"
          >
            {error?.message || t("models:details.error.not_found")}
          </Alert>
        </Stack>
      </PageLayout>
    );
  }

  // Mock model config for demonstration
  const mockConfig: ModelConfig = {
    labels: [
      { color: getRegionColor(theme, 0), confidence: 0.75, enabled: true, id: "1", name: "car" },
      { color: getRegionColor(theme, 1), confidence: 0.8, enabled: true, id: "2", name: "truck" },
      { color: getRegionColor(theme, 2), confidence: 0.7, enabled: true, id: "3", name: "bus" },
      { color: getRegionColor(theme, 3), confidence: 0.65, enabled: false, id: "4", name: "motorcycle" },
      { color: "#98D8C8", confidence: 0.6, enabled: true, id: "5", name: "bicycle" },
    ],
    name: model.name,
    task: "object_detection",
  };

  const activeLabels = mockConfig.labels.filter((label) => label.enabled);

  return (
    <PageLayout title={t("models:details.title")}>
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
                <Icons.ArrowLeft size={20} />
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
                leftSection={<Icons.Edit size={16} />}
                onClick={() => navigate(`/models/${modelId}/edit`)}
                disabled={model.status !== "active" && model.status !== "available"}
              >
                {t("models:actions.edit")}
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<Icons.Trash size={16} />}
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
                                    backgroundColor: label.color,
                                    borderRadius: "50%",
                                    height: 8,
                                    width: 8,
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
                      <Icons.Cpu size={20} color={theme.colors.blue[6]} />
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
                      <Icons.Database size={20} color={theme.colors.green[6]} />
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
                      <Icons.FileZip size={20} color={theme.colors.orange[6]} />
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
                      <Icons.Tag size={20} color={theme.colors.violet[6]} />
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
                    bullet={<Icons.Clock size={12} />}
                    title={t("models:details.model_created")}
                  >
                    <Text size="xs" c="dimmed">
                      {formatDate(model.createdAt)}
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<Icons.Cpu size={12} />}
                    title={t("models:details.model_validated")}
                    color="green"
                  >
                    <Text size="xs" c="dimmed">
                      {formatDate(model.createdAt)} (+ 2 min)
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item
                    bullet={<Icons.Database size={12} />}
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