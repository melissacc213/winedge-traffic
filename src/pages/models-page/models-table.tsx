import { useTranslation } from "react-i18next";
import {
  Badge,
  Text,
  Group,
  ActionIcon,
  Menu,
  Box,
} from "@mantine/core";
import { Icons } from "../../components/icons";
import type { Model } from "../../lib/store/model-store";
import { DataTable } from "../../components/ui/data-table";
import type { DataTableColumn } from "../../components/ui/data-table";
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
      render: (model, globalFilter) => {
        if (globalFilter) {
          return (
            <Box>
              <div style={{ fontWeight: 500, fontSize: '14px' }}>
                {highlightSearchTerm(model.name, globalFilter)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--mantine-color-dimmed)' }}>
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
    },
    {
      key: "type",
      label: t("models:list.columns.type"),
      width: 180,
      sortable: true,
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
    },
    {
      key: "size",
      label: t("models:list.columns.size"),
      width: 120,
      sortable: true,
      render: (model) => <Text size="sm">{formatSize(model.size)}</Text>,
    },
    {
      key: "status",
      label: t("models:list.columns.status"),
      width: 120,
      sortable: true,
      render: (model) => (
        <Badge color={getStatusColor(model.status)} variant="light" size="md">
          {t(`models:status.${model.status}`)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("models:list.columns.date"),
      width: 180,
      sortable: true,
      render: (model) => <Text size="sm" c="dimmed">{formatDate(model.createdAt)}</Text>,
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
      defaultSort={{ key: "createdAt", direction: "desc" }}
      stickyHeader={true}
      height={700}
      enableGlobalFilter={true}
    />
  );
}