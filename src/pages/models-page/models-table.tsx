import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Text,
} from "@mantine/core";
import { useTranslation } from "react-i18next";

import { Icons } from "../../components/icons";
import type { DataTableColumn } from "../../components/ui/data-table";
import { DataTable } from "../../components/ui/data-table";
import type { Model } from "../../lib/store/model-store";
import { highlightSearchTerm } from "../../lib/utils";

interface ModelTableProps {
  models: Model[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (model: Model) => void;
}

export function ModelsTable({
  models,
  isLoading,
  onDelete,
  onEdit,
}: ModelTableProps) {
  const { t } = useTranslation(["models", "common"]);

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
      month: "short",
      year: "numeric",
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
      render: (model, globalFilter) => {
        if (globalFilter) {
          return (
            <Box>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                {highlightSearchTerm(model.name, globalFilter)}
              </div>
              <div style={{ color: 'var(--mantine-color-dimmed)', fontSize: '12px' }}>
                {highlightSearchTerm(model.id, globalFilter)}
              </div>
            </Box>
          );
        }
        return (
          <Box>
            <Text fw={500} size="sm">{model.name}</Text>
            <Text size="xs" c="dimmed">
              {model.id}
            </Text>
          </Box>
        );
      },
      sortable: true,
    },
    {
      key: "type",
      label: t("models:list.columns.type"),
      render: (model) => {
        // Show task type if available, otherwise show model type
        const taskType = (model as any).task || model.type;
        const typeInfo = getTaskTypeInfo(taskType);
        return (
          <Group gap="xs">
            <Badge color={typeInfo.color} variant="light" size="md">
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
      sortable: true,
      width: 180,
    },
    {
      key: "size",
      label: t("models:list.columns.size"),
      render: (model) => <Text size="sm">{formatSize(model.size)}</Text>,
      sortable: true,
      width: 120,
    },
    {
      key: "status",
      label: t("models:list.columns.status"),
      render: (model) => (
        <Badge color={getStatusColor(model.status)} variant="light" size="md">
          {t(`models:status.${model.status}`)}
        </Badge>
      ),
      sortable: true,
      width: 120,
    },
    {
      key: "createdAt",
      label: t("models:list.columns.date"),
      render: (model) => <Text size="sm" c="dimmed">{formatDate(model.createdAt)}</Text>,
      sortable: true,
      width: 180,
    },
  ];


  // Actions for each row
  const renderActions = (model: Model) => (
    <Menu position="bottom-end" withArrow withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
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
    <DataTable
      data={models}
      columns={columns}
      loading={isLoading}
      pageSize={10}
      showPagination={true}
      actions={renderActions}
      emptyMessage={t("models:list.empty")}
      defaultSort={{ direction: "desc", key: "createdAt" }}
      stickyHeader={true}
      height={700}
      enableGlobalFilter={true}
    />
  );
}