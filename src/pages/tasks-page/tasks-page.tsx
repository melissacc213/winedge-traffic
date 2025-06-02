import { ActionIcon, Badge, Box, Button, Menu, Progress,Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { DataTable } from "@/components/ui";
import { confirmDelete } from "@/lib/confirmation";
import { useDeleteTask,useTasks } from "@/lib/queries/task";
import { getTaskTypeColor } from "@/lib/utils";
import type { Task } from "@/types/task";

export function TasksPage() {
  const { t } = useTranslation(["tasks", "common"]);
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasks();
  const deleteTaskMutation = useDeleteTask();

  const handleCreateTask = useCallback(() => {
    navigate("/tasks/create");
  }, [navigate]);

  const handleViewDetails = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleEditTask = (task: Task) => {
    navigate(`/tasks/${task.id}/edit`);
  };

  const handleDeleteTask = (task: Task) => {
    confirmDelete(task.name, t("tasks:common.task"), async () => {
      try {
        await deleteTaskMutation.mutateAsync(task.id);
        notifications.show({
          color: "green",
          message: t("tasks:notifications.deleteSuccessMessage"),
          title: t("tasks:notifications.deleteSuccess"),
        });
      } catch (error) {
        notifications.show({
          color: "red",
          message: t("tasks:notifications.deleteError"),
          title: t("common:error"),
        });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "running":
        return "blue";
      case "queued":
        return "yellow";
      case "failed":
        return "red";
      case "cancelled":
        return "gray";
      default:
        return "gray";
    }
  };


  const columns = [
    {
      key: "name",
      label: t("tasks:table.name"),
      render: (task: Task) => (
        <Box>
          <Text fw={500} size="sm">{task.name}</Text>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {task.description || t("tasks:noDescription")}
          </Text>
        </Box>
      ),
    },
    {
      key: "status",
      label: t("tasks:table.status"),
      render: (task: Task) => (
        <Badge color={getStatusColor(task.status)} variant="light" size="md">
          {t(`tasks:status.${task.status}`)}
        </Badge>
      ),
      width: 120,
    },
    {
      key: "progress",
      label: t("tasks:table.progress"),
      render: (task: Task) => (
        <Box style={{ width: "100%" }}>
          <Progress
            value={task.progress}
            color={getStatusColor(task.status)}
            size="sm"
            radius="sm"
            animated={task.status === "running"}
            striped={task.status === "running"}
          />
          <Text size="xs" ta="right" c="dimmed" mt={4}>
            {task.progress}%
          </Text>
        </Box>
      ),
      width: 150,
    },
    {
      key: "resultType",
      label: t("tasks:table.type"),
      render: (task: Task) => (
        <Badge color={getTaskTypeColor(task.resultType)} variant="light" size="md">
          {t(`tasks:taskType.${task.resultType}`)}
        </Badge>
      ),
      width: 140,
    },
    {
      key: "recipeName",
      label: t("tasks:table.recipe"),
      render: (task: Task) => (
        <Text size="sm" lineClamp={1}>
          {task.recipeName || "—"}
        </Text>
      ),
    },
    {
      key: "createdAt",
      label: t("tasks:table.createdAt"),
      render: (task: Task) => {
        if (!task.createdAt) return <Text size="sm">—</Text>;
        const date = new Date(task.createdAt);
        return <Text size="sm">{date.toLocaleDateString()}</Text>;
      },
      width: 120,
    },
  ];

  const actions = (task: Task) => (
    <Menu position="bottom-end" withArrow withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <Icons.Dots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<Icons.Eye size={16} />}
          onClick={() => handleViewDetails(task)}
        >
          {t("tasks:action.viewDetails")}
        </Menu.Item>
        <Menu.Item
          leftSection={<Icons.Edit size={16} />}
          onClick={() => handleEditTask(task)}
        >
          {t("common:action.edit")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<Icons.Trash size={16} />}
          color="red"
          onClick={() => handleDeleteTask(task)}
          disabled={task.status === "running"}
        >
          {t("common:action.delete")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <PageLayout
      title={t("tasks:title")}
      description={t("tasks:description")}
      actions={
        <Button 
          leftSection={<Icons.Plus size={16} />} 
          onClick={handleCreateTask}
          color="blue"
        >
          {t("tasks:creation.createTask")}
        </Button>
      }
    >
      <Stack gap="lg">
        <DataTable
          data={tasks}
          columns={columns}
          loading={isLoading}
          actions={actions}
          onRowClick={handleViewDetails}
          height={700}
          emptyMessage={t("tasks:noTasks")}
          defaultSort={{ direction: 'desc', key: 'createdAt' }}
          showPagination={true}
          pageSize={10}
          enableGlobalFilter={true}
        />
      </Stack>
    </PageLayout>
  );
}