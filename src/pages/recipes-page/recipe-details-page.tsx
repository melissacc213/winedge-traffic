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
  Loader,
  Center,
  Tabs,
  ScrollArea,
  Container,
  useMantineTheme,
  rem,
  Divider,
} from "@mantine/core";
import { Icons } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/theme-provider";
import { getRegionColor } from "@/lib/theme-utils";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { getTaskTypeColor, formatDateSimple } from "@/lib/utils";
import { useRecipeStore } from "@/lib/store/recipe-store";
import type { Region } from "@/types/recipe";

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
    inferenceStep: 5,
    classFilter: ["car", "truck", "bus", "motorcycle", "bicycle"],
  },

  // Model configuration
  model: {
    id: "yolov8-traffic",
    name: "YOLOv8 Traffic Model",
    version: "v1.2.0",
    type: "object_detection",
    size: "45.2 MB",
    labels: [
      {
        id: "1",
        name: "Person",
        color: getRegionColor(theme, 0),
        confidence: 0.7,
        enabled: true,
        width_threshold: 32,
        height_threshold: 32,
      },
      {
        id: "2",
        name: "Vehicle",
        color: getRegionColor(theme, 1),
        confidence: 0.75,
        enabled: true,
        width_threshold: 32,
        height_threshold: 32,
      },
      {
        id: "3",
        name: "Truck",
        color: getRegionColor(theme, 2),
        confidence: 0.8,
        enabled: true,
        width_threshold: 32,
        height_threshold: 32,
      },
      {
        id: "4",
        name: "Motorcycle",
        color: getRegionColor(theme, 3),
        confidence: 0.65,
        enabled: false,
        width_threshold: 32,
        height_threshold: 32,
      },
    ],
  },

  // Region configuration based on the API structure
  regions: [
    {
      id: "region-1",
      name: "A",
      type: "areaOfInterest" as const,
      color: getRegionColor(theme, 0),
      points: [
        { x: 100, y: 300 },
        { x: 300, y: 300 },
        { x: 300, y: 500 },
        { x: 100, y: 500 },
      ],
      roadType: "straight" as const,
    },
    {
      id: "region-2",
      name: "B",
      type: "areaOfInterest" as const,
      color: getRegionColor(theme, 1),
      points: [
        { x: 400, y: 300 },
        { x: 600, y: 300 },
        { x: 600, y: 500 },
        { x: 400, y: 500 },
      ],
      roadType: "straight" as const,
    },
  ],

  // Connections between regions
  connections: [
    {
      id: "conn-1",
      sourceId: "region-1",
      destinationId: "region-2",
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
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>("regions");

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
    configuration: {
      frameInterval: formValues.inferenceStep || 5,
      confidenceThreshold: formValues.confidenceThreshold || recipeFromStore.confidenceThreshold || 0.7,
      classFilter: formValues.classFilter || recipeFromStore.classFilter || mockRecipeDetails.configuration.classFilter,
      inferenceStep: formValues.inferenceStep || 5,
    },
    model: formValues.modelConfig && formValues.name === recipeFromStore.name ? {
      ...mockRecipeDetails.model,
      id: formValues.modelId,
      name: formValues.modelName || mockRecipeDetails.model.name,
      labels: formValues.modelConfig.labels || mockRecipeDetails.model.labels,
    } : mockRecipeDetails.model,
    regions: formValues.regions?.length > 0 && formValues.name === recipeFromStore.name ? 
      formValues.regions : recipeFromStore.regions || mockRecipeDetails.regions,
    connections: formValues.connections || mockRecipeDetails.connections,
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



  const renderRegionsTab = () => {
    const getRoadTypeIcon = (roadType?: string) => {
      switch (roadType) {
        case "straight":
          return <Icons.ArrowRight size={20} />;
        case "tJunction":
          return <Icons.GitMerge size={20} />;
        case "crossroads":
          return <Icons.Plus size={20} />;
        default:
          return <Icons.Route size={20} />;
      }
    };

    const getRoadTypeName = (roadType?: string) => {
      switch (roadType) {
        case "straight":
          return "Straight Road";
        case "tJunction":
          return "T-Junction";
        case "crossroads":
          return "Crossroads";
        default:
          return "Unknown";
      }
    };

    return (
      <Grid gutter="lg">
        {/* Region Visualization */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card p="xl" radius="md" withBorder style={{ height: '500px' }}>
            <Stack h="100%">
              <Group justify="space-between">
                <Title order={4}>Region Configuration</Title>
                <Badge variant="light" color="blue">
                  {recipe.regions.length} Regions • {recipe.connections?.length || 0} Connections
                </Badge>
              </Group>
              
              <Center style={{ flex: 1, flexDirection: "column" }}>
                <Icons.Map size={72} style={{ opacity: 0.3 }} />
                <Text size="xl" fw={600} c="dimmed" mt="lg" ta="center">
                  Region Visualization
                </Text>
                <Text size="md" c="dimmed" mt="sm" ta="center" style={{ maxWidth: '500px' }}>
                  Interactive region visualization with road type configuration will display here.
                </Text>
                <Badge
                  variant="light"
                  color="blue"
                  size="sm"
                  mt="md"
                >
                  Coming Soon
                </Badge>
              </Center>
            </Stack>
          </Card>
        </Grid.Col>
        
        {/* Region Details */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md" h={500}>
            {/* Road Type Info */}
            {recipe.regions.length > 0 && recipe.regions[0] && 'roadType' in recipe.regions[0] && recipe.regions[0].roadType && (
              <Card p="md" radius="md" withBorder>
                <Group gap="sm">
                  {getRoadTypeIcon((recipe.regions[0] as any).roadType)}
                  <div>
                    <Text size="sm" fw={500}>Road Type</Text>
                    <Text size="xs" c="dimmed">{getRoadTypeName((recipe.regions[0] as any).roadType)}</Text>
                  </div>
                </Group>
              </Card>
            )}

            {/* Region List */}
            <Card p="lg" radius="md" withBorder style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Title order={5} mb="md">Defined Regions</Title>
              
              <ScrollArea style={{ flex: 1 }}>
                <Stack gap="sm">
                  {recipe.regions.map((region: Region, index) => (
                    <Card key={region.id} p="sm" radius="md" withBorder>
                      <Group gap="sm" mb="xs">
                        <Box
                          style={{
                            width: 24,
                            height: 24,
                            backgroundColor: region.color || getRegionColor(theme, index),
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: rem(12),
                            fontWeight: 600,
                          }}
                        >
                          {region.name}
                        </Box>
                        <Text fw={500} size="sm" style={{ flex: 1 }}>
                          Region {region.name}
                        </Text>
                        <Badge variant="light" size="xs">
                          {region.type === "areaOfInterest" ? "Area" : region.type}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {region.points.length} points defined
                      </Text>
                    </Card>
                  ))}
                  
                  {/* Connections */}
                  {recipe.connections && recipe.connections.length > 0 && (
                    <>
                      <Divider label="Connections" labelPosition="center" my="sm" />
                      {recipe.connections.map((conn) => {
                        const sourceRegion = recipe.regions.find(r => r.id === conn.sourceId);
                        const destRegion = recipe.regions.find(r => r.id === conn.destinationId);
                        return (
                          <Group key={conn.id} gap="xs" px="sm">
                            <Badge size="sm" variant="dot" color={(sourceRegion as any)?.color || theme.colors.gray[6]}>
                              {sourceRegion?.name}
                            </Badge>
                            <Icons.ArrowRight size={16} />
                            <Badge size="sm" variant="dot" color={(destRegion as any)?.color || theme.colors.gray[6]}>
                              {destRegion?.name}
                            </Badge>
                          </Group>
                        );
                      })}
                    </>
                  )}
                </Stack>
              </ScrollArea>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    );
  };

  const renderModelConfigTab = () => {
    return (
      <Stack gap="lg">

        <Grid gutter="lg">
          {/* Model Information */}
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Card withBorder p="lg" h="100%">
              <Stack gap="md">
                <Group gap="sm">
                  <Icons.Brain size={24} />
                  <div style={{ flex: 1 }}>
                    <Text fw={500} size="lg">{recipe.model.name}</Text>
                    <Text size="sm" c="dimmed">Version {recipe.model.version}</Text>
                  </div>
                  <Badge size="sm" color="green" variant="dot">
                    Active
                  </Badge>
                </Group>
                
                <Divider />
                
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Type</Text>
                    <Text fw={500}>{recipe.model.type}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Size</Text>
                    <Text fw={500}>{recipe.model.size}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Total Labels</Text>
                    <Text fw={500}>{recipe.model.labels.length} configured</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Active Labels</Text>
                    <Text fw={500}>{recipe.model.labels.filter(l => l.enabled).length} enabled</Text>
                  </Grid.Col>
                </Grid>
                
                <Divider />
                
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Model ID</Text>
                  <Text size="xs" style={{ fontFamily: 'monospace' }}>{recipe.model.id}</Text>
                </div>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Detection Labels */}
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Card withBorder p="lg" h="100%">
              <Stack gap="md" h="100%">
                <div>
                  <Text fw={600} size="lg">Detection Labels</Text>
                  <Text size="sm" c="dimmed">
                    Objects the model will detect with their confidence thresholds
                  </Text>
                </div>

                <ScrollArea h={400} offsetScrollbars>
                  <Stack gap="sm">
                    {recipe.model.labels.map((label, index) => (
                      <Paper key={label.id} p="md" radius="md" withBorder>
                        <Group gap="md">
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              backgroundColor: label.color,
                              borderRadius: mantineTheme.radius.md,
                              opacity: label.enabled ? 1 : 0.5,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <Group gap="xs" mb={4}>
                              <Text fw={500}>{label.name}</Text>
                              {label.enabled ? (
                                <Badge size="xs" color="green" variant="dot">Enabled</Badge>
                              ) : (
                                <Badge size="xs" color="gray" variant="dot">Disabled</Badge>
                              )}
                            </Group>
                            <Group gap="lg">
                              <Text size="xs" c="dimmed">
                                Confidence: {label.confidence ? (label.confidence * 100).toFixed(0) : 70}%
                              </Text>
                              {label.width_threshold && label.height_threshold && (
                                <Text size="xs" c="dimmed">
                                  Min size: {label.width_threshold}×{label.height_threshold}px
                                </Text>
                              )}
                            </Group>
                          </div>
                          <Text size="sm" c="dimmed">
                            #{index + 1}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
                
                {recipe.model.labels.length === 0 && (
                  <Center style={{ flex: 1 }}>
                    <Stack align="center" gap="md">
                      <Icons.AlertCircle size={48} style={{ opacity: 0.3 }} />
                      <Text c="dimmed" ta="center">
                        No detection labels configured for this model
                      </Text>
                    </Stack>
                  </Center>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    );
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
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 70px)",
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
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              {/* Title and Navigation */}
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
                  <Title order={2} fw={600} mb="xs">{recipe.name}</Title>
                  {recipe.description && (
                    <Text size="sm" c="dimmed" style={{ maxWidth: '600px' }}>
                      {recipe.description}
                    </Text>
                  )}
                </div>
              </Group>
              
              {/* Actions */}
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
            
            {/* Recipe Information Bar */}
            <Group gap="xl">
              <Group gap="xs">
                <Icons.Tag size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" c="dimmed">Task Type</Text>
                <Badge color={getTaskTypeColor(recipe.taskType)} variant="light" size="sm">
                  {t(`recipes:taskType.${recipe.taskType}`)}
                </Badge>
              </Group>
              
              <Divider orientation="vertical" />
              
              <Group gap="xs">
                <Icons.Check size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" c="dimmed">Status</Text>
                <Badge color={recipe.status === "active" ? "green" : "gray"} variant="light" size="sm">
                  {t(`recipes:status.${recipe.status}`)}
                </Badge>
              </Group>
              
              <Divider orientation="vertical" />
              
              <Group gap="xs">
                <Icons.Calendar size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" c="dimmed">Created</Text>
                <Text size="sm">{formatDateSimple(recipe.createdAt)}</Text>
              </Group>
              
              <Divider orientation="vertical" />
              
              <Group gap="xs">
                <Icons.Brain size={16} style={{ opacity: 0.6 }} />
                <Text size="sm" c="dimmed">Model</Text>
                <Text size="sm" fw={500}>{recipe.model.name}</Text>
              </Group>
            </Group>
          </Stack>
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
        <Container size="xl" py="xl">
          {/* Main Content with Tabs */}
          <Paper withBorder radius="md">
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="regions" leftSection={<Icons.Map size={16} />}>
                  Region Setup
                </Tabs.Tab>
                <Tabs.Tab value="model" leftSection={<Icons.Brain size={16} />}>
                  Model Config
                </Tabs.Tab>
              </Tabs.List>

              {/* Regions Tab */}
              <Tabs.Panel value="regions" p="lg">
                {renderRegionsTab()}
              </Tabs.Panel>

              {/* Model Config Tab */}
              <Tabs.Panel value="model" p="lg">
                {renderModelConfigTab()}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Container>
      </Box>
      
    </Box>
  );
}