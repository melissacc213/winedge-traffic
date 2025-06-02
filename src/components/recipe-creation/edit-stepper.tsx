import {
  Box,
  Button,
  Container,
  Group,
  Modal,
  rem,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect,useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useUpdateRecipe } from "../../lib/queries/recipe";
import { useRecipeStore } from "../../lib/store/recipe-store";
import { Icons } from "../icons";
import { ModelConfigStep } from "./steps/model-config-step";
import { RegionSetupStep } from "./steps/region-setup-step";

const steps = [
  {
    description: "Define analysis regions",
    icon: Icons.Map,
    id: "regionSetup",
    title: "Region Setup",
  },
  {
    description: "Select and configure AI model",
    icon: Icons.Brain,
    id: "modelConfig",
    title: "Model Config",
  },
];

export function RecipeEditStepper({ recipeId }: { recipeId: string }) {
  const { t } = useTranslation("recipes");
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';

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
        regions: formValues.regions.map(region => ({
          ...region,
          type: region.type || "countLine" as const
        })),
        taskType: formValues.taskType || "trafficStatistics" as const,
        videoFile: formValues.videoFile || undefined
      };
      
      await updateRecipe.mutateAsync({
        data: submitData,
        id: recipeId,
      });

      notifications.show({
        color: "green",
        message: t("notifications.updateSuccessMessage"),
        title: t("notifications.updateSuccess"),
      });

      navigate(`/recipes/${recipeId}`);
    } catch (error) {
      notifications.show({
        color: "red",
        message: error instanceof Error ? error.message : "Unknown error",
        title: t("errors.updateFailed"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove these as we'll use theme colors directly

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
            ? theme.colors.dark[8]
            : theme.white,
          borderBottom: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
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
                            alignItems: "center",
                            backgroundColor: isCompleted
                              ? theme.colors.green[6]
                              : isActive
                                ? theme.colors.blue[6]
                                : isDark
                                  ? theme.colors.dark[6]
                                  : theme.colors.gray[1],
                            border:
                              isActive && !isCompleted
                                ? `2px solid ${theme.colors.blue[6]}`
                                : "none",
                            borderRadius: "50%",
                            color:
                              isCompleted || isActive
                                ? "white"
                                : isDark
                                  ? theme.colors.gray[5]
                                  : theme.colors.gray[6],
                            display: "flex",
                            fontSize: rem(13),
                            fontWeight: 600,
                            height: rem(28),
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                            width: rem(28),
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
                            backgroundColor: isCompleted
                              ? theme.colors.green[6]
                              : isDark
                                ? theme.colors.dark[5]
                                : theme.colors.gray[3],
                            height: rem(2),
                            marginLeft: rem(8),
                            marginRight: rem(8),
                            transition: "all 0.2s ease",
                            width: rem(40),
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
                "&:hover": {
                  backgroundColor: isDark
                    ? theme.colors.red[7]
                    : theme.colors.red[5],
                },
                backgroundColor: isDark
                  ? theme.colors.red[8]
                  : theme.colors.red[6],
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
          backgroundColor: isDark
            ? theme.colors.dark[7]
            : theme.colors.gray[0],
          flex: 1,
          overflowY: "auto",
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
            ? theme.colors.dark[8]
            : theme.white,
          borderTop: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
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
                "&:hover": {
                  backgroundColor: theme.colors.blue[7],
                },
                color: "white",
                visibility: currentStep === 0 ? "hidden" : "visible",
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
                "&:hover": {
                  backgroundColor: theme.colors.blue[7],
                },
                backgroundColor: theme.colors.blue[6],
                color: "white",
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