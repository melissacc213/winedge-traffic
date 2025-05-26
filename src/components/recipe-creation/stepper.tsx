import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  Stepper as MantineStepper,
  Button,
  Group,
  Box,
  Card,
  Container,
  Text,
  Stack,
  Divider,
} from "@mantine/core";
import { IconArrowRight, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { useRecipeStore } from "../../lib/store/recipe-store";
import { TaskTypeWithVideoStep } from "./steps/task-type-with-video-step";
import { RegionSetupStep } from "./steps/region-setup-step";
import { ModelConfigStep } from "./steps/model-config-step";
import { ReviewStep } from "./steps/review-step";

export function RecipeStepper() {
  const { t } = useTranslation(["recipes"]);
  const { activeStep, setActiveStep, nextStep, previousStep, formValues } =
    useRecipeStore();

  const [stepsValid, setStepsValid] = useState({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  useEffect(() => {
    setStepsValid((prev) => ({
      ...prev,
      0: !!(
        formValues.taskType &&
        (formValues.videoId || formValues.videoFile)
      ),
      1: formValues.regions?.length > 0,
      2: !!formValues.modelId,
    }));
  }, [formValues]);

  const handleNext = () => {
    if (stepsValid[activeStep as keyof typeof stepsValid]) {
      nextStep();
    }
  };

  const stepComponents = [
    <TaskTypeWithVideoStep key="task-type-video" />,
    <RegionSetupStep key="region-setup" />,
    <ModelConfigStep key="model-config" />,
    <ReviewStep key="review" />,
  ];

  return (
    <Container size="lg" py="xl">
      <Card withBorder radius="md" shadow="sm" p="xl">
        <Stack gap="lg">
          <Box>
            <Text fw={700} size="xl" mb="xs">
              {t("recipes:creation.title")}
            </Text>
            <Text size="sm" c="dimmed">
              {t("recipes:creation.description")}
            </Text>
          </Box>

          <MantineStepper
            active={activeStep}
            onStepClick={setActiveStep}
            allowNextStepsSelect={false}
            wrap
          >
            <MantineStepper.Step
              label={t("recipes:creation.stepper.taskWithVideo")}
              description={t("recipes:creation.stepper.taskWithVideoDesc")}
              completedIcon={<IconCheck size={18} />}
            />
            <MantineStepper.Step
              label={t("recipes:creation.stepper.regionSetup")}
              description={t("recipes:creation.stepper.regionSetupDesc")}
              completedIcon={<IconCheck size={18} />}
            />
            <MantineStepper.Step
              label={t("recipes:creation.stepper.modelConfig")}
              description={t("recipes:creation.stepper.modelConfigDesc")}
              completedIcon={<IconCheck size={18} />}
            />
            <MantineStepper.Step
              label={t("recipes:creation.stepper.review")}
              description={t("recipes:creation.stepper.reviewDesc")}
              completedIcon={<IconCheck size={18} />}
            />
          </MantineStepper>

          <Divider my="md" />

          <Box mih={400}>{stepComponents[activeStep]}</Box>

          <Group justify="space-between" mt="xl">
            {activeStep > 0 ? (
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={previousStep}
              >
                {t("recipes:common.previous")}
              </Button>
            ) : (
              <Box w={120} />
            )}

            {activeStep < 3 ? (
              <Button
                rightSection={<IconArrowRight size={16} />}
                onClick={handleNext}
                // disabled={!stepsValid[activeStep as keyof typeof stepsValid]}
              >
                {t("recipes:common.next")}
              </Button>
            ) : (
              <Button
                color="green"
                rightSection={<IconCheck size={16} />}
                onClick={handleNext}
              >
                {t("recipes:review.submit")}
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
