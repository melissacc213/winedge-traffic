import { useState, useEffect } from "react";
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
import { useUpdateRecipe } from "../../lib/queries/recipe";
import { RegionSetupStep } from "./steps/region-setup-step";
import { ModelConfigStep } from "./steps/model-config-step";
import { useTheme } from "../../providers/theme-provider";

const steps = [
  {
    id: "regionSetup",
    title: "Region Setup",
    description: "Define analysis regions",
    icon: Icons.Map,
  },
  {
    id: "modelConfig",
    title: "Model Config",
    description: "Select and configure AI model",
    icon: Icons.Brain,
  },
];

export function RecipeEditStepper({ recipeId }: { recipeId: string }) {
  const { t } = useTranslation("recipes");
  const navigate = useNavigate();
  const { theme, colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === "dark";

  // Set initial step to 0 (regions) for edit mode
  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formValues,
    isDirty,
    markStepCompleted,
    loadRecipeForEdit,
  } = useRecipeStore();

  const updateRecipe = useUpdateRecipe();

  // Load recipe data when component mounts
  useEffect(() => {
    // Load the recipe data into the store
    // In production, this would fetch from API
    loadRecipeForEdit(recipeId);
  }, [recipeId, loadRecipeForEdit]);

  const handleNext = () => {
    // Mark current step as completed
    if (currentStep === 0) {
      markStepCompleted(1, true);
    } else if (currentStep === 1) {
      markStepCompleted(2, true);
    }

    if (currentStep === steps.length - 1) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      navigate(`/recipes/${recipeId}`);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In production, call the update API
      const submitData = {
        ...formValues,
        taskType: formValues.taskType || "trafficStatistics" as const,
        regions: formValues.regions.map(region => ({
          ...region,
          type: region.type || "countLine" as const
        })),
        videoFile: formValues.videoFile || undefined
      };
      
      await updateRecipe.mutateAsync({
        id: recipeId,
        data: submitData,
      });

      notifications.show({
        title: t("notifications.updateSuccess"),
        message: t("notifications.updateSuccessMessage"),
        color: "green",
      });

      navigate(`/recipes/${recipeId}`);
    } catch (error) {
      notifications.show({
        title: t("errors.updateFailed"),
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove these as we'll use mantineTheme colors directly

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 70px)",
      }}
    >
      {/* Fixed Header */}
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
            <Group gap="xl" align="center">
              <div>
                <Title order={3} fw={600}>
                  {t("edit.title")}
                </Title>
                <Text size="xs" c="dimmed">
                  {t("edit.description", "Modify recipe configuration")}
                </Text>
              </div>
              
              {/* Step indicators */}
              <Group gap="lg" align="center">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
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
                            backgroundColor: isCompleted
                              ? mantineTheme.colors.green[6]
                              : isActive
                                ? mantineTheme.colors.blue[6]
                                : isDark
                                  ? mantineTheme.colors.dark[6]
                                  : theme.colors.gray[1],
                            border:
                              isActive && !isCompleted
                                ? `2px solid ${mantineTheme.colors.blue[6]}`
                                : "none",
                            color:
                              isCompleted || isActive
                                ? "white"
                                : isDark
                                  ? theme.colors.gray[5]
                                  : theme.colors.gray[6],
                            fontWeight: 600,
                            fontSize: rem(13),
                            transition: "all 0.2s ease",
                          }}
                        >
                          {isCompleted ? (
                            <Icons.Check size={14} />
                          ) : (
                            <StepIcon size={14} />
                          )}
                        </Box>

                        {/* Step label */}
                        <Text
                          size="sm"
                          fw={isActive ? 600 : 400}
                          c={
                            isActive || isCompleted
                              ? isDark
                                ? "white"
                                : "black"
                              : "dimmed"
                          }
                        >
                          {step.title}
                        </Text>
                      </Group>

                      {/* Separator */}
                      {index < steps.length - 1 && (
                        <Box
                          style={{
                            width: rem(40),
                            height: rem(2),
                            backgroundColor: isCompleted
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

      {/* Scrollable Content */}
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
          {currentStep === 0 && <RegionSetupStep />}
          {currentStep === 1 && <ModelConfigStep />}
        </Container>
      </Box>

      {/* Fixed Footer */}
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
              disabled={currentStep === 0}
              size="md"
              style={{
                visibility: currentStep === 0 ? "hidden" : "visible",
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
                currentStep === steps.length - 1 ? (
                  <Icons.Check size={16} />
                ) : (
                  <Icons.ChevronRight size={16} />
                )
              }
              onClick={handleNext}
              loading={isSubmitting}
              size="md"
              style={{
                backgroundColor: mantineTheme.colors.blue[6],
                color: "white",
                "&:hover": {
                  backgroundColor: mantineTheme.colors.blue[7],
                },
              }}
            >
              {currentStep === steps.length - 1
                ? t("edit.save", "Save Changes")
                : t("common:button.next", "Next")}
            </Button>
          </Group>
        </Container>
      </Box>

      {/* Cancel Confirmation Modal */}
      <Modal
        opened={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={t("edit.unsavedChanges.title")}
        centered
      >
        <Stack>
          <Text>{t("edit.unsavedChanges.message")}</Text>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setShowCancelModal(false)}
            >
              {t("common:action.continue")}
            </Button>
            <Button
              color="red"
              onClick={() => {
                setShowCancelModal(false);
                navigate(`/recipes/${recipeId}`);
              }}
            >
              {t("common:action.discard")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}