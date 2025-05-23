import { useTranslation } from "react-i18next";
import {
  Stack,
  Text,
  SimpleGrid,
  Paper,
  Group,
  ThemeIcon,
  Radio,
} from "@mantine/core";
import { IconChartBar, IconTrain } from "@tabler/icons-react";
import { useRecipeStore } from "../../../lib/store/recipe-store";
import type { TaskType } from "../../../types/recipe";

export function TaskTypeStep() {
  const { t } = useTranslation(["recipes"]);
  const { formValues, setTaskType } = useRecipeStore();

  const taskTypes = [
    {
      id: "trafficStatistics" as TaskType,
      label: t("recipes:creation.taskType.types.trafficStatistics"),
      icon: <IconChartBar size={24} />,
      color: "teal",
      description: t(
        "recipes:creation.taskType.descriptions.trafficStatistics"
      ),
    },
    {
      id: "trainDetection" as TaskType,
      label: t("recipes:creation.taskType.types.trainDetection"),
      icon: <IconTrain size={24} />,
      color: "indigo",
      description: t("recipes:creation.taskType.descriptions.trainDetection"),
    },
  ];

  return (
    <Stack>
      <Stack gap="xs">
        <Text fw={700} size="xl">
          {t("recipes:creation.taskType.title")}
        </Text>
        <Text size="sm" c="dimmed">
          {t("recipes:creation.taskType.description")}
        </Text>
      </Stack>

      <Radio.Group
        value={formValues.taskType}
        onChange={(value) => setTaskType(value as TaskType)}
        className="mt-4"
      >
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {taskTypes.map((type) => (
            <Paper
              key={type.id}
              withBorder
              p="md"
              radius="md"
              className={`cursor-pointer transition-all ${
                formValues.taskType === type.id
                  ? "border-2 border-blue-500"
                  : "hover:border-blue-300"
              }`}
              onClick={() => setTaskType(type.id)}
            >
              <Group>
                <ThemeIcon
                  color={type.color}
                  size="lg"
                  radius="md"
                  variant="light"
                >
                  {type.icon}
                </ThemeIcon>

                <div style={{ flex: 1 }}>
                  <Text fw={500} size="md">
                    {type.label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {type.description}
                  </Text>
                </div>

                <Radio value={type.id} />
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      </Radio.Group>
    </Stack>
  );
}
