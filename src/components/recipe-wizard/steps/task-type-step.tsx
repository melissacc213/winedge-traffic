import { Radio, Group, Stack, Title, Text, Paper } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { UseFormReturnType } from "@mantine/form";
import type { RecipeFormValues } from "@/hooks/use-recipe-form";

interface TaskTypeStepProps {
  form: UseFormReturnType<RecipeFormValues>;
}

export function TaskTypeStep({ form }: TaskTypeStepProps) {
  const { t } = useTranslation(["recipe"]);

  return (
    <Stack gap="lg">
      <Paper withBorder p="md">
        <Title order={4} mb="md">
          {t("recipe:steps.task_type.select_task")}
        </Title>
        <Radio.Group
          {...form.getInputProps("taskType")}
          name="taskType"
          withAsterisk
        >
          <Group mt="xs">
            <Radio
              value="traffic_count"
              label={
                <div>
                  <Text fw={500}>
                    🚗 {t("recipe:task_types.traffic_count.name")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("recipe:task_types.traffic_count.description")}
                  </Text>
                </div>
              }
              styles={{
                label: { paddingLeft: 8 },
                inner: { alignSelf: "flex-start", marginTop: 3 },
              }}
            />
          </Group>
          <Group mt="md">
            <Radio
              value="train_detection"
              label={
                <div>
                  <Text fw={500}>
                    🚄 {t("recipe:task_types.train_detection.name")}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("recipe:task_types.train_detection.description")}
                  </Text>
                </div>
              }
              styles={{
                label: { paddingLeft: 8 },
                inner: { alignSelf: "flex-start", marginTop: 3 },
              }}
            />
          </Group>
        </Radio.Group>
      </Paper>

      {form.values.taskType === "traffic_count" && (
        <Paper withBorder p="md">
          <Title order={4} mb="md">
            {t("recipe:steps.task_type.scene_type")}
          </Title>
          <Radio.Group
            {...form.getInputProps("sceneType")}
            name="sceneType"
            withAsterisk
          >
            <Group>
              <Radio value="road" label={t("recipe:scene_types.road")} />
              <Radio
                value="t_junction"
                label={t("recipe:scene_types.t_junction")}
              />
              <Radio
                value="cross_junction"
                label={t("recipe:scene_types.cross_junction")}
              />
            </Group>
          </Radio.Group>
        </Paper>
      )}
    </Stack>
  );
}
