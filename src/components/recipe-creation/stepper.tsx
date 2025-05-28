import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Group,
  Stepper as MantineStepper,
  Modal,
  Stack,
  Text,
  Title,
  Container,
  Paper,
  useMantineTheme,
  rem,
} from "@mantine/core";
import { Icons } from "../icons";
import { notifications } from "@mantine/notifications";
import { useRecipeStore } from "../../lib/store/recipe-store";
import { useCreateRecipe } from "../../lib/queries/recipe";
import { TaskTypeWithVideoStep } from "./steps/task-type-with-video-step";
import { RegionSetupStep } from "./steps/region-setup-step";
import { ModelConfigStep } from "./steps/model-config-step";
import { useTheme } from "../../providers/theme-provider";

export function RecipeStepper() {
  const { t } = useTranslation("recipes");
  const navigate = useNavigate();
  const { theme, colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === "dark";

  const { activeStep, nextStep, previousStep, formValues, resetForm, isDirty } =
    useRecipeStore();

  const createRecipe = useCreateRecipe();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [stepsValid, setStepsValid] = useState({
    0: true,
    1: true,
    2: true,
  });

  useEffect(() => {
    setStepsValid((prev) => ({
      ...prev,
      0: !!(
        formValues.taskType &&
        (formValues.videoId || formValues.videoFile) &&
        formValues.extractedFrame // Ensure frame is captured
      ),
      1: formValues.regions?.length > 0,
      2: !!formValues.modelId,
    }));
  }, [formValues]);

  const handleNext = () => {
    if (activeStep === 2) {
      // Submit recipe
      handleSubmitRecipe();
    } else if (stepsValid[activeStep as keyof typeof stepsValid]) {
      nextStep();
    }
  };

  const handleSubmitRecipe = () => {
    // Submit the recipe
    createRecipe.mutate(
      {
        name: formValues.name,
        description: formValues.description,
        taskType: formValues.taskType!,
        videoId: formValues.videoId!,
        videoFile: formValues.videoFile!,
        extractedFrame: formValues.extractedFrame!,
        extractedFrameTime: formValues.extractedFrameTime!,
        regions: formValues.regions,
        connections: formValues.connections,
        modelId: formValues.modelId!,
        modelName: formValues.modelName!,
        modelConfig: formValues.modelConfig,
        confidenceThreshold: formValues.confidenceThreshold,
        classFilter: formValues.classFilter || [],
        inferenceStep: formValues.inferenceStep || 3,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Recipe created successfully!",
            color: "green",
          });
          // Set flag to prevent navigation guard from showing confirmation
          sessionStorage.setItem("recipe-navigation-confirmed", "true");
          resetForm();
          navigate("/recipes");
        },
        onError: (error) => {
          notifications.show({
            title: "Error",
            message: error.message || "Failed to create recipe",
            color: "red",
          });
        },
      }
    );
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      navigate("/recipes");
    }
  };

  const confirmCancel = () => {
    // Set flag to prevent navigation guard from showing another confirmation
    sessionStorage.setItem("recipe-navigation-confirmed", "true");
    resetForm();
    navigate("/recipes");
  };

  const stepComponents = [
    <TaskTypeWithVideoStep key="task-video" />,
    <RegionSetupStep key="region" />,
    <ModelConfigStep key="model" />,
  ];

  const stepTitles = [
    t("recipes:creation.stepper.taskWithVideo"),
    t("recipes:creation.stepper.regionSetup"),
    t("recipes:creation.stepper.modelConfig"),
  ];

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
      }}
    >
      {/* Header */}
      <Paper shadow="sm" p="md" radius={0}>
        <Container size="lg">
          <Group justify="space-between" align="center">
            <div>
              <Title order={2} size="h3" fw={600}>
                {t("recipes:creation.title")}
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                {t("recipes:creation.description")}
              </Text>
            </div>
            <Button
              variant="subtle"
              color="red"
              onClick={handleCancel}
              size="sm"
            >
              {t("common:button.cancel", "Cancel")}
            </Button>
          </Group>

          {/* Custom Stepper */}
          <Box mt="xl">
            <Group justify="center" gap="xl">
              {stepTitles.map((title, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                const stepNumber = index + 1;

                return (
                  <Group key={index} gap="xs">
                    <Group gap="xs" align="center">
                      {/* Step indicator */}
                      <Box
                        style={{
                          width: rem(32),
                          height: rem(32),
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isActive
                            ? mantineTheme.colors.blue[5]
                            : isCompleted
                              ? mantineTheme.colors.green[6]
                              : isDark
                                ? theme.colors.dark[5]
                                : theme.colors.gray[3],
                          color:
                            isActive || isCompleted
                              ? "white"
                              : isDark
                                ? theme.colors.gray[5]
                                : theme.colors.gray[6],
                          fontWeight: 600,
                          fontSize: rem(14),
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isCompleted ? <Icons.Check size={16} /> : stepNumber}
                      </Box>

                      {/* Step label */}
                      <Text
                        size="sm"
                        fw={isActive ? 600 : 400}
                        c={isActive ? undefined : "dimmed"}
                      >
                        {title}
                      </Text>
                    </Group>

                    {/* Separator */}
                    {index < stepTitles.length - 1 && (
                      <Box
                        style={{
                          width: rem(60),
                          height: rem(2),
                          backgroundColor: isCompleted
                            ? mantineTheme.colors.green[6]
                            : isDark
                              ? theme.colors.dark[4]
                              : theme.colors.gray[3],
                          transition: "all 0.2s ease",
                        }}
                      />
                    )}
                  </Group>
                );
              })}
            </Group>
          </Box>
        </Container>
      </Paper>

      {/* Content Area */}
      <Container size="lg" py="xl">
        {stepComponents[activeStep]}
      </Container>

      {/* Footer Navigation */}
      <Paper
        shadow="sm"
        p="md"
        radius={0}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderTop: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        }}
      >
        <Container size="lg">
          <Group justify="flex-end">
            {activeStep > 0 && (
              <Button
                variant="subtle"
                leftSection={<Icons.ChevronLeft size={18} />}
                onClick={previousStep}
                size="md"
              >
                {t("common:button.back", "Back")}
              </Button>
            )}

            <Button
              rightSection={
                activeStep < 2 ? (
                  <Icons.ChevronRight size={18} />
                ) : (
                  <Icons.Check size={18} />
                )
              }
              onClick={handleNext}
              loading={activeStep === 2 && createRecipe.isPending}
              disabled={!stepsValid[activeStep as keyof typeof stepsValid]}
              size="md"
              variant={activeStep === 2 ? "gradient" : "filled"}
              gradient={
                activeStep === 2
                  ? { from: "teal", to: "cyan", deg: 60 }
                  : undefined
              }
            >
              {activeStep === 2
                ? createRecipe.isPending
                  ? t("recipes:review.submitting", "Creating...")
                  : t("recipes:review.submit", "Create Recipe")
                : t("common:button.next", "Next")}
            </Button>
          </Group>
        </Container>
      </Paper>

      {/* Cancel Confirmation Modal */}
      {/* Add padding at bottom to account for fixed footer */}
      <Box h={80} />

      <Modal
        opened={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Recipe Creation"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to cancel? All your progress will be lost.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Continue Editing
            </Button>
            <Button color="red" onClick={confirmCancel}>
              Cancel Recipe
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
