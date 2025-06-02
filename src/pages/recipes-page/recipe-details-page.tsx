import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Stack,
  Group,
  Title,
  Button,
  Badge,
  Text,
  Box,
  Grid,
  Card,
  ActionIcon,
  Alert,
  Loader,
  Center,
} from "@mantine/core";
import { Icons } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/theme-provider";
import { getRegionColor } from "@/lib/theme-utils";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { getTaskTypeColor } from "@/lib/utils";
import { useRecipeStore } from "@/lib/store/recipe-store";

// Generate mock data for the recipe details using theme colors
const generateMockRecipeDetails = (theme: any) => ({
  id: "recipe-1",
  name: "市區主幹道交通流量監測",
  description:
    "用於監測市區主要道路的車流量統計，包含車輛計數、速度估算和流量分析",
  taskType: "trafficStatistics",
  status: "active",
  createdAt: "2024-01-15T08:00:00Z",
  updatedAt: "2024-12-20T14:30:00Z",

  // Task type specific configuration
  configuration: {
    frameInterval: 5,
    confidenceThreshold: 0.7,
    vehicleClasses: ["car", "truck", "bus", "motorcycle", "bicycle"],
    countingLines: [
      { id: "line-1", name: "北向計數線", direction: "northbound" },
      { id: "line-2", name: "南向計數線", direction: "southbound" },
    ],
    speedEstimation: true,
    congestionDetection: true,
  },

  // Model configuration
  model: {
    id: "yolov8-traffic",
    name: "YOLOv8 Traffic Model",
    version: "v1.2.0",
    type: "detection",
    size: "45.2 MB",
    labels: [
      {
        id: "1",
        name: "Car",
        color: getRegionColor(theme, 0),
        confidence: 0.7,
        enabled: true,
      },
      {
        id: "2",
        name: "Truck",
        color: getRegionColor(theme, 1),
        confidence: 0.75,
        enabled: true,
      },
      {
        id: "3",
        name: "Bus",
        color: getRegionColor(theme, 2),
        confidence: 0.8,
        enabled: true,
      },
      {
        id: "4",
        name: "Motorcycle",
        color: getRegionColor(theme, 3),
        confidence: 0.65,
        enabled: true,
      },
      {
        id: "5",
        name: "Bicycle",
        color: getRegionColor(theme, 4),
        confidence: 0.6,
        enabled: true,
      },
    ],
  },

  // Region configuration
  regions: [
    {
      id: "region-1",
      name: "北向車道",
      type: "counting_line",
      color: getRegionColor(theme, 0),
      points: [
        { x: 100, y: 300 },
        { x: 700, y: 300 },
      ],
      settings: {
        direction: "northbound",
        vehicleTypes: ["all"],
      },
    },
    {
      id: "region-2",
      name: "南向車道",
      type: "counting_line",
      color: getRegionColor(theme, 1),
      points: [
        { x: 100, y: 400 },
        { x: 700, y: 400 },
      ],
      settings: {
        direction: "southbound",
        vehicleTypes: ["all"],
      },
    },
    {
      id: "region-3",
      name: "監測區域",
      type: "detection_zone",
      color: getRegionColor(theme, 2),
      points: [
        { x: 50, y: 250 },
        { x: 750, y: 250 },
        { x: 750, y: 450 },
        { x: 50, y: 450 },
      ],
      settings: {
        alertOnCongestion: true,
        maxVehicles: 50,
      },
    },
  ],

  // Sample frame for visualization
  sampleFrame: "/api/placeholder/800/600",

  // Performance metrics
  metrics: {
    totalTasksRun: 156,
    averageProcessingTime: "2.4s",
    successRate: 98.5,
    lastUsed: "2024-12-25T10:30:00Z",
  },
});

export function RecipeDetailsPage() {
  const { t } = useTranslation(["recipes", "common"]);
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const [isLoading, setIsLoading] = useState(true);

  // Get recipe from store
  const { recipes, formValues } = useRecipeStore();
  
  // Generate mock data with theme colors
  const mockRecipeDetails = generateMockRecipeDetails(theme);
  
  // Find recipe in store or use mock data
  const recipeFromStore = recipes.find(r => r.id === recipeId);
  const recipe = recipeFromStore ? {
    ...mockRecipeDetails,
    id: recipeFromStore.id,
    name: recipeFromStore.name,
    description: recipeFromStore.description || mockRecipeDetails.description,
    taskType: recipeFromStore.taskType,
    status: recipeFromStore.status,
    createdAt: recipeFromStore.createdAt,
    // Use form values if this is the recently created recipe
    configuration: formValues.name === recipeFromStore.name ? {
      frameInterval: formValues.inferenceStep || 5,
      confidenceThreshold: formValues.confidenceThreshold || 0.7,
      vehicleClasses: formValues.classFilter || ["car", "truck", "bus", "motorcycle", "bicycle"],
      countingLines: formValues.regions?.filter(r => r.type === "countLine").map((r, idx) => ({
        id: `line-${idx + 1}`,
        name: r.name || `Line ${idx + 1}`,
        direction: idx === 0 ? "northbound" : "southbound"
      })) || [],
      speedEstimation: true,
      congestionDetection: true,
    } : mockRecipeDetails.configuration,
    model: formValues.name === recipeFromStore.name && formValues.modelConfig ? {
      id: formValues.modelId,
      name: formValues.modelName || "YOLOv8 Traffic Model",
      version: "v1.2.0",
      type: "detection",
      size: "45.2 MB",
      labels: formValues.modelConfig.labels || mockRecipeDetails.model.labels,
    } : mockRecipeDetails.model,
    regions: formValues.name === recipeFromStore.name && formValues.regions ? 
      formValues.regions.map((r, idx) => ({
        ...r,
        color: r.color || mockRecipeDetails.regions[idx]?.color || getRegionColor(theme, idx),
        settings: {
          direction: idx === 0 ? "northbound" : "southbound",
          vehicleTypes: ["all"],
        }
      })) : mockRecipeDetails.regions,
  } : mockRecipeDetails;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate("/recipes");
  };

  const handleEdit = () => {
    navigate(`/recipes/${recipeId}/edit`);
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      title: t("recipes:confirmDelete.title"),
      children: (
        <Text size="sm">
          {t("recipes:confirmDelete.message", { name: recipe.name })}
        </Text>
      ),
      labels: {
        confirm: t("common:action.delete"),
        cancel: t("common:action.cancel"),
      },
      confirmProps: { color: "red" },
      onConfirm: () => {
        notifications.show({
          title: t("recipes:notifications.deleteSuccess"),
          message: t("recipes:notifications.deleteSuccessMessage"),
          color: "green",
        });
        navigate("/recipes");
      },
    });
  };

  const handleCreateTask = () => {
    navigate("/tasks/create", { state: { recipeId: recipe.id } });
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <Center style={{ height: 300 }}>
          <Loader size="md" />
        </Center>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ padding: '2rem' }}>
        <Center style={{ height: 300, flexDirection: "column" }}>
          <Text c="red" mb="md">
            {t("recipes:details.notFound")}
          </Text>
          <Button
            variant="outline"
            leftSection={<Icons.ArrowLeft size={16} />}
            onClick={handleBack}
          >
            {t("recipes:details.notFoundDescription")}
          </Button>
        </Center>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Page Header */}
      <Paper 
        p="lg" 
        radius="md" 
        withBorder 
        mb="lg"
        style={{
          backgroundColor: isDark ? theme.colors.dark?.[8] || theme.colors.gray[9] : theme.white,
          borderColor: isDark ? theme.colors.dark?.[5] || theme.colors.gray[6] : theme.colors.gray[2],
        }}
      >
        <Stack gap="md">
          {/* Top Row: Navigation and Actions */}
          <Group justify="space-between" align="flex-start">
            <Group gap="md">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="xl"
                onClick={handleBack}
              >
                <Icons.ArrowLeft size={24} />
              </ActionIcon>
              <div>
                <Group gap="sm" mb="xs">
                  <Title order={1} size="h2">{recipe.name}</Title>
                  <Badge
                    variant="light"
                    color={recipe.status === "active" ? "green" : "gray"}
                    size="lg"
                  >
                    {t(`recipes:status.${recipe.status}`)}
                  </Badge>
                </Group>
                <Group gap="md">
                  <Badge
                    size="md"
                    color={getTaskTypeColor(recipe.taskType)}
                    variant="light"
                  >
                    {t(`recipes:taskType.${recipe.taskType}`)}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {t("recipes:details.createdOn", {
                      date: new Date(recipe.createdAt).toLocaleDateString(),
                    })}
                  </Text>
                </Group>
                {recipe.description && (
                  <Text size="sm" c="dimmed" mt="xs" style={{ maxWidth: '600px' }}>
                    {recipe.description}
                  </Text>
                )}
              </div>
            </Group>
            
            <Group gap="sm">
              <Button
                variant="light"
                leftSection={<Icons.Rocket size={16} />}
                onClick={handleCreateTask}
                size="md"
              >
                {t("recipes:actions.createTask")}
              </Button>
              <Button
                variant="light"
                color="blue"
                leftSection={<Icons.Edit size={16} />}
                onClick={handleEdit}
                size="md"
              >
                {t("common:action.edit")}
              </Button>
              <Button
                variant="outline"
                color="red"
                leftSection={<Icons.Trash size={16} />}
                onClick={handleDelete}
                size="md"
              >
                {t("common:action.delete")}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>
      
      {/* Main Content Grid */}
      <Grid gutter="lg">
        {/* Left Column: Region Visualization */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card p="xl" radius="md" withBorder style={{ height: '500px' }}>
            <Center style={{ height: '100%', flexDirection: "column" }}>
              <Icons.Map size={72} style={{ opacity: 0.3 }} />
              <Text size="xl" fw={600} c="dimmed" mt="lg" ta="center">
                {t("recipes:details.regionVisualization")}
              </Text>
              <Text size="md" c="dimmed" mt="sm" ta="center" style={{ maxWidth: '500px' }}>
                Interactive region visualization will display here.
              </Text>
              <Badge
                variant="light"
                color="blue"
                size="sm"
                mt="md"
                style={{
                  fontWeight: 500,
                }}
              >
                Coming Soon
              </Badge>
            </Center>
          </Card>
        </Grid.Col>
        
        {/* Right Column: Region List */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card p="lg" radius="md" withBorder style={{ height: '500px' }}>
            <Stack gap="md" style={{ height: '100%' }}>
              <Title order={3}>Region Configuration</Title>
              
              <Stack gap="sm" style={{ flex: 1, overflowY: 'auto' }}>
                {recipe.regions.map((region, index) => (
                  <Card key={region.id} p="sm" radius="md" withBorder>
                    <Group gap="sm" mb="xs">
                      <Box
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: region.color,
                          borderRadius: 4,
                          flexShrink: 0,
                        }}
                      />
                      <Text fw={500} size="sm" style={{ flex: 1 }}>
                        {region.name}
                      </Text>
                      <Badge variant="light" size="xs">
                        {region.type.replace('_', ' ')}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {region.points.length} points
                    </Text>
                    <Group gap="xs" mt="xs">
                      {Object.entries(region.settings).slice(0, 2).map(([key, value]) => (
                        <Text key={key} size="xs" c="dimmed">
                          {key}: {String(value)}
                        </Text>
                      ))}
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}