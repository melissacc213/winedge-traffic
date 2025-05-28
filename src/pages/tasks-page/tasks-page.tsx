import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TaskList } from "./task-list";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/page-layout/page-layout";

export function TasksPage() {
  const { t } = useTranslation(["tasks", "common"]);
  const navigate = useNavigate();

  const handleCreateTask = useCallback(() => {
    navigate("/tasks/create");
  }, [navigate]);

  return (
    <PageLayout
      title={t("tasks:title")}
      description={t("tasks:description")}
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateTask}>
          {t("common:createTask")}
        </Button>
      }
    >
      <Stack gap="lg">
        <TaskList />
      </Stack>
    </PageLayout>
  );
}
