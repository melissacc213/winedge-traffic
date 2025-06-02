import { useTranslation } from "react-i18next";

import { PageLayout } from "@/components/page-layout/page-layout";
import { TaskCreationForm } from "@/components/task-creation/task-creation-form";

export function TaskCreationPage() {
  const { t } = useTranslation(["tasks", "common"]);

  return (
    <PageLayout
      title={t("tasks:createTask")}
      description={t("tasks:createTaskDescription")}
    >
      <TaskCreationForm />
    </PageLayout>
  );
}