import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Stack,
  Text,
  Group,
  Paper,
  TextInput,
  Textarea,
  Table,
  Badge,
  Divider,
  Alert,
  Box,
  Image,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRecipeStore } from "../../../lib/store/recipe-store";
import { useCreateRecipe } from "../../../lib/queries/recipe";
import { MOCK_CLASS_CATEGORIES } from "../../../lib/queries/recipe";

export function ReviewStep() {
  const { t } = useTranslation(["recipes"]);
  const { formValues, setRecipeInfo } = useRecipeStore();
  const [recipeName, setRecipeName] = useState(formValues.name || "");
  const [recipeDescription, setRecipeDescription] = useState(
    formValues.description || ""
  );

  // Create recipe mutation
  const createRecipe = useCreateRecipe();

  // Update store when name or description change
  const handleNameChange = (name: string) => {
    setRecipeName(name);
    setRecipeInfo(name, recipeDescription);
  };

  const handleDescriptionChange = (description: string) => {
    setRecipeDescription(description);
    setRecipeInfo(recipeName, description);
  };

  // Get video details
  const getVideoDetails = () => {
    if (formValues.videoFile) {
      return {
        name: formValues.videoFile.name,
        thumbnail: null,
      };
    }
    return null;
  };

  const videoDetails = getVideoDetails();

  // Get model details
  const getModelName = () => {
    if (!formValues.modelId) return "Not selected";

    // This would be a lookup from the models list in a real implementation
    return formValues.modelId === "model-1"
      ? "YOLOv8"
      : formValues.modelId === "model-2"
        ? "EfficientDet"
        : formValues.modelId === "model-3"
          ? "Traffic Counter v2"
          : formValues.modelId;
  };

  // Get class filter labels
  const getClassLabels = () => {
    if (!formValues.classFilter || formValues.classFilter.length === 0) {
      return "All classes";
    }

    return formValues.classFilter
      .map((classId) => {
        const classInfo = MOCK_CLASS_CATEGORIES.find((c) => c.id === classId);
        return classInfo ? classInfo.label : classId;
      })
      .join(", ");
  };

  return (
    <Stack>
      <Stack gap="xs">
        <Text fw={700} size="xl">
          {t("recipes:creation.review.title")}
        </Text>
        <Text size="sm" c="dimmed">
          {t("recipes:creation.review.description")}
        </Text>
      </Stack>

      {/* Recipe Information */}
      <Paper withBorder p="lg" radius="md" className="mt-4">
        <Text fw={500} mb="md">
          {t("recipes:creation.review.summary")}
        </Text>

        <Stack>
          <TextInput
            label={t("recipes:creation.review.name")}
            value={recipeName}
            onChange={(e) => handleNameChange(e.currentTarget.value)}
            placeholder="Enter recipe name"
            required
          />

          <Textarea
            label={t("recipes:creation.review.description")}
            value={recipeDescription}
            onChange={(e) => handleDescriptionChange(e.currentTarget.value)}
            placeholder="Enter recipe description (optional)"
            autosize
            minRows={3}
          />
        </Stack>
      </Paper>

      {/* Configuration Summary */}
      <Paper withBorder p="lg" radius="md" className="mt-4">
        <Stack>
          <Group>
            <Text fw={500} style={{ flex: 1 }}>
              {t("recipes:creation.review.taskType")}:
            </Text>
            <Badge color="blue">
              {formValues.taskType &&
                t(`recipes:creation.taskType.types.${formValues.taskType}`)}
            </Badge>
          </Group>

          <Divider />

          <Group align="flex-start">
            <Text fw={500} style={{ flex: 1 }}>
              {t("recipes:creation.review.video")}:
            </Text>
            <Box style={{ textAlign: "right" }}>
              {videoDetails ? (
                <Stack align="flex-end">
                  <Text size="sm">{videoDetails.name}</Text>
                  {videoDetails.thumbnail && (
                    <Image
                      src={videoDetails.thumbnail}
                      height={60}
                      width={100}
                      fallbackSrc="https://placehold.co/100x60?text=Video"
                      radius="sm"
                    />
                  )}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed">
                  Not selected
                </Text>
              )}
            </Box>
          </Group>

          <Divider />

          <Group align="flex-start">
            <Text fw={500} style={{ flex: 1 }}>
              {t("recipes:creation.review.regions")}:
            </Text>
            <Box style={{ textAlign: "right" }}>
              {formValues.regions && formValues.regions.length > 0 ? (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Type</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {formValues.regions.map((region) => (
                      <Table.Tr key={region.id}>
                        <Table.Td>{region.name}</Table.Td>
                        <Table.Td>
                          {t(
                            `recipes:creation.regionSetup.types.${region.type}`
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text size="sm" c="dimmed">
                  No regions defined
                </Text>
              )}
            </Box>
          </Group>

          <Divider />

          <Group>
            <Text fw={500} style={{ flex: 1 }}>
              {t("recipes:creation.review.model")}:
            </Text>
            <Text>{getModelName()}</Text>
          </Group>

          <Group>
            <Text fw={500} style={{ flex: 1 }}>
              Confidence Threshold:
            </Text>
            <Text>
              {formValues.confidenceThreshold
                ? `${formValues.confidenceThreshold * 100}%`
                : "50%"}
            </Text>
          </Group>

          <Group>
            <Text fw={500} style={{ flex: 1 }}>
              Object Classes:
            </Text>
            <Text>{getClassLabels()}</Text>
          </Group>
        </Stack>
      </Paper>

      {/* Validation errors */}
      {(!formValues.name || formValues.name.length < 3) && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="Missing information"
        >
          Please provide a recipe name before submitting
        </Alert>
      )}

      {createRecipe.isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {t("recipes:errors.creation")}: {createRecipe.error?.message}
        </Alert>
      )}

      {createRecipe.isSuccess && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="green"
          title="Success"
        >
          {t("recipes:success.created")}
        </Alert>
      )}
    </Stack>
  );
}
