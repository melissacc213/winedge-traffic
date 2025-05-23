import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Stack, Group } from "@mantine/core";
import { IconPlus, IconVideo } from "@tabler/icons-react";
import { TaskList } from "./task-list";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/page-layout/page-layout";

export function TasksPage() {
  const { t } = useTranslation(["tasks", "common"]);
  const navigate = useNavigate();

  const handleCreateTask = useCallback(() => {
    navigate("/tasks/create");
  }, [navigate]);
  
  const handleViewVideos = useCallback(() => {
    navigate("/tasks/video");
  }, [navigate]);

  return (
    <PageLayout
      title={t("tasks:title")}
      description={t("tasks:description")}
      actions={
        <Group gap="sm">
          <Button variant="light" leftSection={<IconVideo size={16} />} onClick={handleViewVideos}>
            {t("common:action.view")} {t("common:videos")}
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreateTask}>
            {t("common:createTask")}
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        <TaskList />
      </Stack>
    </PageLayout>
  );
}
