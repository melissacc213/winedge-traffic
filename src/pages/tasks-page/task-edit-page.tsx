import { Center, Loader, Alert } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { TaskCreationForm } from "@/components/task-creation/task-creation-form";
import { useTask } from "@/lib/queries/task";

export function TaskEditPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { t } = useTranslation(["tasks", "common"]);

  // Fetch task data for editing
  const { data: task, isLoading, error } = useTask(taskId || "");

  // Debug logging
  console.log('TaskEditPage - taskId:', taskId);
  console.log('TaskEditPage - task data:', task);
  console.log('TaskEditPage - isLoading:', isLoading);
  console.log('TaskEditPage - error:', error);

  if (isLoading) {
    return (
      <PageLayout
        title={t("tasks:edit.title")}
        description={t("tasks:edit.loading")}
      >
        <Center h={400}>
          <Loader size="xl" variant="dots" />
        </Center>
      </PageLayout>
    );
  }

  if (error || !task) {
    return (
      <PageLayout
        title={t("tasks:edit.title")}
        description={t("tasks:edit.error")}
      >
        <Alert
          icon={<Icons.AlertCircle size={16} />}
          title={t("common:error")}
          color="red"
          variant="light"
        >
          {error?.message || t("tasks:taskNotFound")}
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("tasks:edit.title")}
      description={t("tasks:edit.description", { name: task.name })}
    >
      <TaskCreationForm editTask={task} />
    </PageLayout>
  );
}