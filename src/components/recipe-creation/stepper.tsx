import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Group,
  Modal,
  Stack,
  Text,
  Title,
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

  const {
    activeStep,
    nextStep,
    previousStep,
    formValues,
    resetForm,
    isDirty,
    stepCompleted,
    markStepCompleted,
    clearRegionsData,
    clearModelData,
  } = useRecipeStore();

  const createRecipe = useCreateRecipe();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [, setValidationErrors] = useState<Record<string, string>>({});

  // Step validation functions
  const validateStep0 = () => {
    const errors: Record<string, string> = {};

    if (!formValues.taskType) {
      errors.taskType = t(
        "recipes:validation.taskTypeRequired",
        "Please select a task type to proceed. Choose 'Traffic Statistics' for intersection monitoring or 'Train Detection' for railway monitoring."
      );
    }

    if (!formValues.videoFile && !formValues.videoId) {
      errors.video = t(
        "recipes:validation.videoRequired",
        "Please upload a video file to analyze. Supported formats: MP4, AVI, MOV, WebM. The video will be used for object detection and tracking."
      );
    }

    if (!formValues.extractedFrame) {
      errors.frame = t(
        "recipes:validation.frameRequired",
        "Please capture a frame from the video. This frame will be used to define detection regions and configure the AI model."
      );
    }

    return errors;
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (formValues.taskType === "trainDetection") {
      // For train detection, validate ROI
      if (!formValues.roi) {
        errors.roi = t(
          "recipes:validation.roiRequired",
          "Please draw a Region of Interest (ROI) on the frame. The ROI defines where the AI will detect trains. Draw a rectangle around the railway track."
        );
      }
    } else {
      // For other types, validate regions
      if (!formValues.regions || formValues.regions.length === 0) {
        errors.regions = t(
          "recipes:validation.regionsRequired",
          "Please draw at least one detection region on the frame. Regions define where vehicles will be counted and tracked."
        );
      }

      // For traffic statistics with multiple regions, validate connections
      if (
        formValues.taskType === "trafficStatistics" &&
        formValues.regions.length > 1
      ) {
        if (!formValues.connections || formValues.connections.length === 0) {
          errors.connections = t(
            "recipes:validation.connectionsRequired",
            "Please define at least one route between regions. Routes determine valid traffic flow paths for vehicle tracking."
          );
        }
      }
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    if (!formValues.modelId) {
      errors.model = t(
        "recipes:validation.modelRequired",
        "Please select an AI model for object detection. Choose a model that matches your task type (traffic or train detection)."
      );
    }

    if (!formValues.modelConfig || formValues.modelConfig.labels.length === 0) {
      errors.labels = t(
        "recipes:validation.labelsRequired",
        "Please configure at least one detection label. Enable the object types you want to detect (e.g., car, truck, bus for traffic)."
      );
    }

    return errors;
  };

  const validateCurrentStep = () => {
    let errors: Record<string, string> = {};

    switch (activeStep) {
      case 0:
        errors = validateStep0();
        break;
      case 1:
        errors = validateStep1();
        break;
      case 2:
        errors = validateStep2();
        break;
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleNext = () => {
    // Validate current step
    const { isValid, errors } = validateCurrentStep();

    if (!isValid) {
      const errorCount = Object.keys(errors).length;
      const errorMessage =
        errorCount === 1
          ? Object.values(errors)[0]
          : `Please fix the following ${errorCount} issues:\n${Object.values(
              errors
            )
              .map((err, idx) => `${idx + 1}. ${err}`)
              .join("\n")}`;

      notifications.show({
        title: t("recipes:validation.error", "Validation Error"),
        message: errorMessage,
        color: "red",
        autoClose: errorCount > 1 ? 10000 : 5000, // Show longer for multiple errors
      });
      return;
    }

    // Mark current step as completed
    markStepCompleted(activeStep, true);

    if (activeStep === 2) {
      // Submit recipe
      handleSubmitRecipe();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    // Check if we need to show confirmation based on what data would be lost
    let needsConfirmation = false;

    if (activeStep === 1 && formValues.regions.length > 0) {
      needsConfirmation = true;
    } else if (activeStep === 2 && formValues.modelConfig) {
      needsConfirmation = true;
    }

    if (needsConfirmation) {
      setShowBackModal(true);
    } else {
      previousStep();
    }
  };

  const confirmBack = () => {
    // Clear data based on current step
    switch (activeStep) {
      case 1:
        clearRegionsData();
        break;
      case 2:
        clearModelData();
        break;
    }

    setShowBackModal(false);
    previousStep();
  };

  const handleSubmitRecipe = () => {
    // Submit the recipe - the mutation will get the payload from the store
    createRecipe.mutate(undefined, {
      onSuccess: () => {
        notifications.show({
          title: "Recipe Created Successfully",
          message: `Your ${formValues.taskType === "trainDetection" ? "train detection" : "traffic monitoring"} recipe has been created and is ready to process video streams.`,
          color: "green",
          icon: <Icons.Check size={20} />,
          autoClose: 5000,
        });
        // Set flag to prevent navigation guard from showing confirmation
        sessionStorage.setItem("recipe-navigation-confirmed", "true");
        resetForm();
        navigate("/recipes");
      },
      onError: (error) => {
        notifications.show({
          title: "Recipe Creation Failed",
          message:
            error.message ||
            "Unable to create recipe. Please check your configuration and try again. If the problem persists, contact support.",
          color: "red",
          icon: <Icons.X size={20} />,
          autoClose: 8000,
        });
      },
    });
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
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 70px)", // Account for AppShell header
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        style={{
          backgroundColor: isDark
            ? mantineTheme.colors.dark[8]
            : mantineTheme.white,
          borderBottom: `1px solid ${isDark ? mantineTheme.colors.dark[5] : mantineTheme.colors.gray[2]}`,
          zIndex: 10,
        }}
      >
        <Container size="xl" py="md">
          <Group justify="space-between" align="center">
            {/* Title and Steps in one line */}
            <Group gap="xl" align="center">
              <div>
                <Title order={3} fw={600}>
                  {t("recipes:creation.title", "Create New Recipe")}
                </Title>
                <Text size="xs" c="dimmed">
                  {t("recipes:creation.description", "creation.description")}
                </Text>
              </div>

              {/* Steps */}
              <Group gap="lg" align="center">
                {stepTitles.map((title, index) => {
                  const isActive = index === activeStep;
                  const stepNumber = index + 1;

                  return (
                    <Group key={index} gap="xs" wrap="nowrap">
                      <Group gap="xs" align="center" wrap="nowrap">
                        {/* Step indicator */}
                        <Box
                          style={{
                            width: rem(28),
                            height: rem(28),
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: stepCompleted[
                              `step${index}` as keyof typeof stepCompleted
                            ]
                              ? mantineTheme.colors.green[6]
                              : isActive
                                ? mantineTheme.colors.blue[6]
                                : isDark
                                  ? mantineTheme.colors.dark[6]
                                  : theme.colors.gray[1],
                            border:
                              isActive &&
                              !stepCompleted[
                                `step${index}` as keyof typeof stepCompleted
                              ]
                                ? `2px solid ${mantineTheme.colors.blue[6]}`
                                : "none",
                            color:
                              stepCompleted[
                                `step${index}` as keyof typeof stepCompleted
                              ] || isActive
                                ? "white"
                                : isDark
                                  ? theme.colors.gray[5]
                                  : theme.colors.gray[6],
                            fontWeight: 600,
                            fontSize: rem(13),
                            transition: "all 0.2s ease",
                          }}
                        >
                          {stepCompleted[
                            `step${index}` as keyof typeof stepCompleted
                          ] ? (
                            <Icons.Check size={14} />
                          ) : (
                            stepNumber
                          )}
                        </Box>

                        {/* Step label */}
                        <Text
                          size="sm"
                          fw={isActive ? 600 : 400}
                          c={
                            isActive ||
                            stepCompleted[
                              `step${index}` as keyof typeof stepCompleted
                            ]
                              ? isDark
                                ? "white"
                                : "black"
                              : "dimmed"
                          }
                        >
                          {title}
                        </Text>
                      </Group>

                      {/* Separator */}
                      {index < stepTitles.length - 1 && (
                        <Box
                          style={{
                            width: rem(40),
                            height: rem(2),
                            backgroundColor: stepCompleted[
                              `step${index}` as keyof typeof stepCompleted
                            ]
                              ? mantineTheme.colors.green[6]
                              : isDark
                                ? mantineTheme.colors.dark[5]
                                : theme.colors.gray[3],
                            transition: "all 0.2s ease",
                            marginLeft: rem(8),
                            marginRight: rem(8),
                          }}
                        />
                      )}
                    </Group>
                  );
                })}
              </Group>
            </Group>

            {/* Exit button */}
            <Button
              variant="filled"
              color="red"
              onClick={handleCancel}
              size="sm"
              style={{
                backgroundColor: isDark
                  ? theme.colors.red[8]
                  : theme.colors.red[6],
                "&:hover": {
                  backgroundColor: isDark
                    ? theme.colors.red[7]
                    : theme.colors.red[5],
                },
              }}
            >
              {t("common:button.exit", "Exit")}
            </Button>
          </Group>
        </Container>
      </Box>

      {/* Content Area - Scrollable */}
      <Box
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: isDark
            ? mantineTheme.colors.dark[7]
            : theme.colors.gray[0],
        }}
      >
        <Container size="lg" py="xl">
          {stepComponents[activeStep]}
        </Container>
      </Box>

      {/* Footer Navigation - Fixed at bottom */}
      <Box
        style={{
          backgroundColor: isDark
            ? mantineTheme.colors.dark[8]
            : mantineTheme.white,
          borderTop: `1px solid ${isDark ? mantineTheme.colors.dark[4] : mantineTheme.colors.gray[2]}`,
          boxShadow: isDark
            ? "0 -2px 8px rgba(0, 0, 0, 0.3)"
            : "0 -2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Container size="xl" py="md">
          <Group justify="space-between">
            <Button
              variant="filled"
              leftSection={<Icons.ChevronLeft size={16} />}
              onClick={handlePrevious}
              disabled={activeStep === 0}
              size="md"
              style={{
                visibility: activeStep === 0 ? "hidden" : "visible",
                color: "white",
                "&:hover": {
                  backgroundColor: mantineTheme.colors.blue[7],
                },
              }}
            >
              {t("common:button.back", "Back")}
            </Button>

            <Button
              rightSection={
                activeStep < 2 ? <Icons.ChevronRight size={16} /> : undefined
              }
              onClick={handleNext}
              loading={activeStep === 2 && createRecipe.isPending}
              size="md"
              style={{
                backgroundColor: mantineTheme.colors.blue[6],
                color: "white",
                "&:hover": {
                  backgroundColor: mantineTheme.colors.blue[7],
                },
              }}
            >
              {activeStep === 2
                ? createRecipe.isPending
                  ? t("recipes:review.submitting", "Creating...")
                  : t("recipes:review.submit", "Create Recipe")
                : t("common:button.next", "Next")}
            </Button>
          </Group>
        </Container>
      </Box>

      <Modal
        opened={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={t("recipes:creation.exitTitle", "Exit Recipe Creation?")}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            {t(
              "recipes:creation.exitMessage",
              "Are you sure you want to exit? All your progress will be lost."
            )}
          </Text>
          <Group justify="space-between">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              style={{
                borderColor: isDark
                  ? mantineTheme.colors.dark[4]
                  : theme.colors.gray[4],
                color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
              }}
            >
              {t("common:button.continueEditing", "Continue Editing")}
            </Button>
            <Button
              onClick={confirmCancel}
              style={{
                backgroundColor: mantineTheme.colors.red[6],
                "&:hover": {
                  backgroundColor: mantineTheme.colors.red[7],
                },
              }}
            >
              {t("common:button.exit", "Exit")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={showBackModal}
        onClose={() => setShowBackModal(false)}
        title={t("recipes:navigation.backTitle", "Go Back?")}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            {t(
              "recipes:navigation.backMessage",
              "Going back will clear your current progress on this step."
            )}
          </Text>
          {activeStep === 1 && (
            <Text size="sm" c="dimmed">
              {t(
                "recipes:navigation.loseRegions",
                "All drawn regions and connections will be lost."
              )}
            </Text>
          )}
          {activeStep === 2 && (
            <Text size="sm" c="dimmed">
              {t(
                "recipes:navigation.loseModelConfig",
                "Model configuration and labels will be lost."
              )}
            </Text>
          )}
          <Group justify="space-between">
            <Button
              variant="outline"
              onClick={() => setShowBackModal(false)}
              style={{
                borderColor: isDark
                  ? mantineTheme.colors.dark[4]
                  : theme.colors.gray[4],
                color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
              }}
            >
              {t("common:button.stayHere", "Stay Here")}
            </Button>
            <Button
              onClick={confirmBack}
              style={{
                backgroundColor: mantineTheme.colors.orange[6],
                "&:hover": {
                  backgroundColor: mantineTheme.colors.orange[7],
                },
              }}
            >
              {t("common:button.goBack", "Go Back")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
