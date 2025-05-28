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
} from "@mantine/core";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
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
    <Stack gap={0}>
      {/* Header with title and stepper */}
      <Box
        style={{
          backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
          borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
          boxShadow: theme.other.shadows.xs,
        }}
      >
        <Box maw={1200} mx="auto" px="md" py="xs">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <div>
                <Title order={3} size="h4">
                  {t("recipes:creation.title")}
                </Title>
                <Text size="xs" c="dimmed" mt={2}>
                  {t("recipes:creation.description")}
                </Text>
              </div>
              <Button
                variant="subtle"
                color="red"
                onClick={handleCancel}
                size="xs"
                radius="md"
                style={{
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: isDark
                      ? theme.colors.dark[6]
                      : theme.colors.red[0],
                  },
                }}
              >
                Cancel
              </Button>
            </Group>

            <MantineStepper
              active={activeStep}
              allowNextStepsSelect={false}
              size="sm"
              color="cyan"
              styles={(theme) => ({
                root: { maxWidth: "100%" },
                steps: {
                  display: "flex",
                  flexWrap: "nowrap",
                  overflowX: "auto",
                  gap: "1rem",
                },
                step: {
                  minWidth: "auto",
                  flex: "1 1 auto",
                  padding: "0.5rem",
                  borderRadius: theme.radius.md,
                  transition: "all 0.2s ease",
                  "&[data-progress]": {
                    backgroundColor: isDark
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                  },
                  "&[data-completed]": {
                    backgroundColor: isDark
                      ? theme.colors.dark[6]
                      : theme.colors.cyan[0],
                  },
                },
                stepIcon: {
                  borderWidth: 2,
                  transition: "all 0.2s ease",
                  "&[data-completed]": {
                    borderColor: theme.colors.cyan[6],
                    backgroundColor: theme.colors.cyan[6],
                  },
                  "&[data-progress]": {
                    borderColor: theme.colors.cyan[6],
                  },
                },
                stepLabel: {
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: isDark ? theme.white : theme.black,
                },
                stepDescription: {
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  color: isDark ? theme.colors.dark[2] : theme.colors.gray[6],
                },
                separator: {
                  marginLeft: "0.5rem",
                  marginRight: "0.5rem",
                  backgroundColor: isDark
                    ? theme.colors.dark[4]
                    : theme.colors.gray[3],
                },
                separatorActive: {
                  backgroundColor: theme.colors.cyan[6],
                },
              })}
            >
              <MantineStepper.Step
                label={
                  activeStep === 0
                    ? t("recipes:creation.stepper.taskWithVideo")
                    : "Task & Video"
                }
                description={
                  activeStep === 0
                    ? t("recipes:creation.stepper.taskWithVideoDesc")
                    : null
                }
                completedIcon={<IconCheck size={16} />}
              />
              <MantineStepper.Step
                label={
                  activeStep === 1
                    ? t("recipes:creation.stepper.regionSetup")
                    : "Regions"
                }
                description={
                  activeStep === 1
                    ? t("recipes:creation.stepper.regionSetupDesc")
                    : null
                }
                completedIcon={<IconCheck size={16} />}
              />
              <MantineStepper.Step
                label={
                  activeStep === 2
                    ? t("recipes:creation.stepper.modelConfig")
                    : "Model"
                }
                description={
                  activeStep === 2
                    ? t("recipes:creation.stepper.modelConfigDesc")
                    : null
                }
                completedIcon={<IconCheck size={16} />}
              />
            </MantineStepper>
          </Stack>
        </Box>
      </Box>

      {/* Content Area */}
      <Box maw={1200} mx="auto" px="md" py="md">
        {stepComponents[activeStep]}
      </Box>

      {/* Footer Navigation */}
      <Box
        style={{
          borderTop: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
          backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
          boxShadow: `0 -2px 4px ${theme.other.ui.shadow}`,
        }}
      >
        <Box maw={1200} mx="auto" px="md" py="xs">
          <Group justify="space-between">
            {activeStep > 0 ? (
              <Button
                variant="subtle"
                leftSection={<IconChevronLeft size={18} />}
                onClick={previousStep}
                size="md"
                radius="md"
                style={{
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: isDark
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                    transform: "translateX(-2px)",
                  },
                }}
              >
                {t("recipes:common.previous")}
              </Button>
            ) : (
              <Box />
            )}

            {activeStep < 2 ? (
              <Button
                rightSection={<IconChevronRight size={18} />}
                onClick={handleNext}
                disabled={!stepsValid[activeStep as keyof typeof stepsValid]}
                size="md"
                radius="md"
                variant="filled"
                style={{
                  transition: "all 0.2s ease",
                  ...(!stepsValid[activeStep as keyof typeof stepsValid]
                    ? {}
                    : {
                        "&:hover": {
                          transform: "translateX(2px)",
                          boxShadow: theme.other.shadows.sm,
                        },
                      }),
                }}
              >
                {t("recipes:common.next")}
              </Button>
            ) : (
              <Button
                rightSection={<IconCheck size={18} />}
                onClick={handleNext}
                loading={createRecipe.isPending}
                disabled={!stepsValid[activeStep as keyof typeof stepsValid]}
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "teal", to: "cyan", deg: 60 }}
                style={{
                  transition: "all 0.2s ease",
                  ...(!stepsValid[activeStep as keyof typeof stepsValid] ||
                  createRecipe.isPending
                    ? {}
                    : {
                        "&:hover": {
                          boxShadow: theme.other.shadows.md,
                          transform: "scale(1.02)",
                        },
                      }),
                }}
              >
                {createRecipe.isPending
                  ? t("recipes:review.submitting", "Creating...")
                  : t("recipes:review.submit")}
              </Button>
            )}
          </Group>
        </Box>
      </Box>

      {/* Cancel Confirmation Modal */}
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
    </Stack>
  );
}
