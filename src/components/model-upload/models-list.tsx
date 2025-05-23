import {
  Table,
  Badge,
  Group,
  ActionIcon,
  Text,
  Paper,
  Title,
  Menu,
} from "@mantine/core";
import { Icons } from "../icons";
import { useTranslation } from "react-i18next";
import type { Model } from "@/lib/store/model-store";
import { TableLoading } from "../ui";

interface ModelsListProps {
  models: Model[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function ModelsList({
  models,
  isLoading,
  onDelete,
  onDownload,
}: ModelsListProps) {
  const { t } = useTranslation(["models", "common"]);

  // Show loading state
  if (isLoading) {
    return (
      <TableLoading
        title={t("models:list.title")}
        rows={3}
        columns={5}
        withActions={true}
        withSearch={false}
        withPagination={false}
      />
    );
  }

  // Show empty state
  if (models.length === 0) {
    return (
      <TableLoading
        title={t("models:list.title")}
        noData={true}
        noDataMessage={t("models:list.empty")}
        emptyIcon={<Icons.Model size={48} />}
      />
    );
  }

  // Format file size to human readable
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get badge color based on model status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "pending":
        return "yellow";
      case "failed":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Paper withBorder p="md">
      <Title order={3} mb="md">
        {t("models:list.title")}
      </Title>
      <Table
        verticalSpacing="md"
        horizontalSpacing="md"
        striped
        withTableBorder
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("models:list.columns.name")}</Table.Th>
            <Table.Th>{t("models:list.columns.type")}</Table.Th>
            <Table.Th>{t("models:list.columns.size")}</Table.Th>
            <Table.Th>{t("models:list.columns.status")}</Table.Th>
            <Table.Th>{t("models:list.columns.date")}</Table.Th>
            <Table.Th style={{ width: 120 }}>
              {t("models:list.columns.actions")}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {models.map((model) => (
            <Table.Tr key={model.id}>
              <Table.Td>
                <Text fw={500}>{model.name}</Text>
                <Text size="xs" c="dimmed">
                  {model.id}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text>{model.type}</Text>
              </Table.Td>
              <Table.Td>
                <Text>{formatSize(model.size)}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(model.status)} variant="light">
                  {t(`models:status.${model.status}`)}
                </Badge>
              </Table.Td>
              <Table.Td>
                {model.createdAt ? formatDate(model.createdAt) : "—"}
              </Table.Td>
              <Table.Td>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                  <ActionIcon
                    color="blue"
                    onClick={() => onDownload(model.id)}
                    disabled={model.status !== "active"}
                  >
                    <Icons.Download size="sm" />
                  </ActionIcon>

                  <Menu position="bottom-end" withArrow withinPortal>
                    <Menu.Target>
                      <ActionIcon>
                        <Icons.Dots size="sm" />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Icons.Eye size="xs" />}
                        disabled={model.status !== "active"}
                      >
                        {t("models:actions.view_details")}
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<Icons.Pencil size="xs" />}
                        disabled={model.status !== "active"}
                      >
                        {t("models:actions.edit")}
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<Icons.Trash size="xs" />}
                        color="red"
                        onClick={() => onDelete(model.id)}
                      >
                        {t("models:actions.delete")}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
