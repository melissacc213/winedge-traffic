import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Text,
  Group,
  ActionIcon,
  Menu,
  Box,
  Input,
  Stack,
} from "@mantine/core";
import { Icons } from "../../components/icons";
import type { Model } from "../../lib/store/model-store";
import { DataTable } from "../../components/ui/data-table";
import type { DataTableColumn } from "../../components/ui/data-table";

interface ModelTableProps {
  models: Model[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onEdit?: (model: Model) => void;
}

export function ModelsTable({
  models,
  isLoading,
  onDelete,
  onDownload,
  onEdit,
}: ModelTableProps) {
  const { t } = useTranslation(["models", "common"]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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
      case "processing":
        return "blue";
      case "available":
        return "green";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  // Get task type color and label
  const getTaskTypeInfo = (type: string) => {
    switch (type) {
      case "trafficStatistics":
        return {
          color: "blue",
          label: t("common:taskType.trafficStatistics"),
        };
      case "trainDetection":
        return {
          color: "green", 
          label: t("common:taskType.trainDetection"),
        };
      default:
        return {
          color: "gray",
          label: type,
        };
    }
  };

  const columns: DataTableColumn<Model>[] = [
    {
      key: "name",
      label: t("models:list.columns.name"),
      sortable: true,
      render: (model) => (
        <Box>
          <Text fw={500}>{model.name}</Text>
          <Text size="xs" c="dimmed">
            {model.id}
          </Text>
        </Box>
      ),
    },
    {
      key: "type",
      label: t("models:list.columns.type"),
      sortable: true,
      render: (model) => {
        // Show task type if available, otherwise show model type
        const taskType = (model as any).task || model.type;
        const typeInfo = getTaskTypeInfo(taskType);
        return (
          <Group gap="xs">
            <Badge color={typeInfo.color} variant="light">
              {typeInfo.label}
            </Badge>
            {(model as any).format && (
              <Badge color="gray" variant="outline" size="sm">
                {(model as any).format.toUpperCase()}
              </Badge>
            )}
          </Group>
        );
      },
    },
    {
      key: "size",
      label: t("models:list.columns.size"),
      sortable: true,
      render: (model) => <Text>{formatSize(model.size)}</Text>,
    },
    {
      key: "status",
      label: t("models:list.columns.status"),
      sortable: true,
      render: (model) => (
        <Badge color={getStatusColor(model.status)} variant="light">
          {t(`models:status.${model.status}`)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("models:list.columns.date"),
      sortable: true,
      render: (model) => <Text size="sm">{formatDate(model.createdAt)}</Text>,
    },
  ];

  // Filter models based on search query
  const filteredModels = models.filter(model => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      model.name.toLowerCase().includes(query) ||
      model.id.toLowerCase().includes(query) ||
      model.type.toLowerCase().includes(query) ||
      model.status.toLowerCase().includes(query)
    );
  });

  // Actions for each row
  const renderActions = (model: Model) => (
    <Menu position="bottom-end" withArrow withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" size="sm">
          <Icons.Dots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<Icons.Edit size={16} />}
          disabled={
            model.status !== "active" &&
            model.status !== "available"
          }
          onClick={() => onEdit?.(model)}
        >
          {t("models:actions.edit")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<Icons.Trash size={16} />}
          color="red"
          onClick={() => onDelete?.(model.id)}
        >
          {t("models:actions.delete")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Input
          placeholder={t("common:action.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<Icons.Search size={16} />}
          w={300}
        />
      </Group>

      <DataTable
        data={filteredModels}
        columns={columns}
        loading={isLoading}
        pageSize={10}
        showPagination={true}
        actions={renderActions}
        emptyMessage={t("models:list.empty")}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        stickyHeader={true}
        height={600}
      />
    </Stack>
  );
}
