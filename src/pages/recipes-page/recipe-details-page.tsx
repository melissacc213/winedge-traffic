import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  rem,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useEffect,useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate,useParams } from "react-router-dom";

import { Icons } from "@/components/icons";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { getRegionColor } from "@/lib/theme-utils";
import { formatDateSimple,getTaskTypeColor } from "@/lib/utils";
import type { Region } from "@/types/recipe";

// Generate mock data for the recipe details using theme colors
const generateMockRecipeDetails = (theme: any, showOverflow: boolean = false) => ({
  // Task type specific configuration
configuration: {
    classFilter: ["car", "truck", "bus", "motorcycle", "bicycle"],
    confidenceThreshold: 0.7,
    frameInterval: 5,
    inferenceStep: 5,
  },
  
// Connections between regions
connections: showOverflow ?
    // Generate realistic connection patterns
    [
      // Main routes
      { destinationId: "region-2", id: "conn-1", sourceId: "region-1" },
      { destinationId: "region-3", id: "conn-2", sourceId: "region-2" },
      { destinationId: "region-4", id: "conn-3", sourceId: "region-3" },
      { destinationId: "region-5", id: "conn-4", sourceId: "region-4" },
      { destinationId: "region-6", id: "conn-5", sourceId: "region-5" },
      // Cross connections
      { destinationId: "region-4", id: "conn-6", sourceId: "region-1" },
      { destinationId: "region-5", id: "conn-7", sourceId: "region-2" },
      { destinationId: "region-6", id: "conn-8", sourceId: "region-3" },
      // Return routes
      { destinationId: "region-7", id: "conn-9", sourceId: "region-6" },
      { destinationId: "region-8", id: "conn-10", sourceId: "region-7" },
      { destinationId: "region-9", id: "conn-11", sourceId: "region-8" },
      { destinationId: "region-10", id: "conn-12", sourceId: "region-9" },
      // Additional complex routes
      { destinationId: "region-11", id: "conn-13", sourceId: "region-10" },
      { destinationId: "region-12", id: "conn-14", sourceId: "region-11" },
      { destinationId: "region-1", id: "conn-15", sourceId: "region-12" },
      // Shortcuts
      { destinationId: "region-10", id: "conn-16", sourceId: "region-7" },
      { destinationId: "region-11", id: "conn-17", sourceId: "region-8" },
      { destinationId: "region-12", id: "conn-18", sourceId: "region-9" },
    ] :
    // Normal case
    [
      {
        destinationId: "region-2",
        id: "conn-1",
        sourceId: "region-1",
      },
    ],
  

createdAt: "2024-01-15T08:00:00Z",
  

description:
    "用於監測市區主要道路的車流量統計，包含車輛計數、速度估算和流量分析",
  


id: "recipe-1",
  



// Performance metrics
metrics: {
    averageProcessingTime: "2.4s",
    lastUsed: "2024-12-25T10:30:00Z",
    successRate: 98.5,
    totalTasksRun: 156,
  },
  



// Model configuration
model: {
    id: "yolov8-traffic",
    labels: showOverflow ?
      // Generate comprehensive traffic-related labels
      [
        { color: getRegionColor(theme, 0), confidence: 0.85, enabled: true, height_threshold: 32, id: "1", name: "Person", width_threshold: 32 },
        { color: getRegionColor(theme, 1), confidence: 0.90, enabled: true, height_threshold: 48, id: "2", name: "Car", width_threshold: 48 },
        { color: getRegionColor(theme, 2), confidence: 0.85, enabled: true, height_threshold: 64, id: "3", name: "Truck", width_threshold: 64 },
        { color: getRegionColor(theme, 3), confidence: 0.88, enabled: true, height_threshold: 80, id: "4", name: "Bus", width_threshold: 80 },
        { color: getRegionColor(theme, 4), confidence: 0.75, enabled: true, height_threshold: 48, id: "5", name: "Motorcycle", width_threshold: 32 },
        { color: getRegionColor(theme, 5), confidence: 0.70, enabled: true, height_threshold: 32, id: "6", name: "Bicycle", width_threshold: 24 },
        { color: getRegionColor(theme, 6), confidence: 0.82, enabled: true, height_threshold: 56, id: "7", name: "Van", width_threshold: 56 },
        { color: getRegionColor(theme, 7), confidence: 0.78, enabled: false, height_threshold: 64, id: "8", name: "Trailer", width_threshold: 96 },
        { color: getRegionColor(theme, 8), confidence: 0.92, enabled: true, height_threshold: 48, id: "9", name: "Police Car", width_threshold: 48 },
        { color: getRegionColor(theme, 9), confidence: 0.91, enabled: true, height_threshold: 56, id: "10", name: "Ambulance", width_threshold: 64 },
        { color: getRegionColor(theme, 10), confidence: 0.89, enabled: true, height_threshold: 64, id: "11", name: "Fire Truck", width_threshold: 80 },
        { color: getRegionColor(theme, 11), confidence: 0.86, enabled: true, height_threshold: 48, id: "12", name: "Taxi", width_threshold: 48 },
        { color: getRegionColor(theme, 12), confidence: 0.87, enabled: false, height_threshold: 72, id: "13", name: "School Bus", width_threshold: 80 },
        { color: getRegionColor(theme, 13), confidence: 0.83, enabled: true, height_threshold: 64, id: "14", name: "Delivery Truck", width_threshold: 64 },
        { color: getRegionColor(theme, 14), confidence: 0.68, enabled: true, height_threshold: 32, id: "15", name: "Scooter", width_threshold: 24 },
        { color: getRegionColor(theme, 15), confidence: 0.76, enabled: false, height_threshold: 80, id: "16", name: "Construction Vehicle", width_threshold: 96 },
        { color: getRegionColor(theme, 16), confidence: 0.81, enabled: true, height_threshold: 48, id: "17", name: "Mini Van", width_threshold: 48 },
        { color: getRegionColor(theme, 17), confidence: 0.84, enabled: true, height_threshold: 48, id: "18", name: "Pickup Truck", width_threshold: 56 },
        { color: getRegionColor(theme, 18), confidence: 0.86, enabled: true, height_threshold: 80, id: "19", name: "Semi Truck", width_threshold: 96 },
        { color: getRegionColor(theme, 19), confidence: 0.79, enabled: false, height_threshold: 72, id: "20", name: "Tanker", width_threshold: 96 },
      ] :
      // Normal case
      [
        {
          color: getRegionColor(theme, 0),
          confidence: 0.7,
          enabled: true,
          height_threshold: 32,
          id: "1",
          name: "Person",
          width_threshold: 32,
        },
        {
          color: getRegionColor(theme, 1),
          confidence: 0.75,
          enabled: true,
          height_threshold: 32,
          id: "2",
          name: "Vehicle",
          width_threshold: 32,
        },
        {
          color: getRegionColor(theme, 2),
          confidence: 0.8,
          enabled: true,
          height_threshold: 32,
          id: "3",
          name: "Truck",
          width_threshold: 32,
        },
        {
          color: getRegionColor(theme, 3),
          confidence: 0.65,
          enabled: false,
          height_threshold: 32,
          id: "4",
          name: "Motorcycle",
          width_threshold: 32,
        },
      ],
    name: "YOLOv8 Traffic Model",
    size: "45.2 MB",
    type: "object_detection",
    version: "v1.2.0",
  },

  
  


name: "市區主幹道交通流量監測",

  
  

// Region configuration based on the API structure
regions: showOverflow ? 
    // Generate comprehensive mock data for review
    Array.from({ length: 12 }, (_, i) => ({
      color: getRegionColor(theme, i),
      id: `region-${i + 1}`, 
      name: String.fromCharCode(65 + (i % 26)) + (Math.floor(i / 26) > 0 ? Math.floor(i / 26) : ''),
      
points: [
        { x: 100 + (i * 50), y: 300 },
        { x: 300 + (i * 50), y: 300 },
        { x: 300 + (i * 50), y: 500 },
        { x: 100 + (i * 50), y: 500 },
      ],
      
roadType: i === 0 ? "straight" : i % 3 === 1 ? "tJunction" : "crossroads" as const,
      // A, B, C... then AA, AB, etc.
type: "areaOfInterest" as const,
    })) :
    // Normal case with few regions
    [
      {
        color: getRegionColor(theme, 0),
        id: "region-1",
        name: "A",
        points: [
          { x: 100, y: 300 },
          { x: 300, y: 300 },
          { x: 300, y: 500 },
          { x: 100, y: 500 },
        ],
        roadType: "straight" as const,
        type: "areaOfInterest" as const,
      },
      {
        color: getRegionColor(theme, 1),
        id: "region-2",
        name: "B",
        points: [
          { x: 400, y: 300 },
          { x: 600, y: 300 },
          { x: 600, y: 500 },
          { x: 400, y: 500 },
        ],
        roadType: "straight" as const,
        type: "areaOfInterest" as const,
      },
    ],

  
  


// Sample frame for visualization
sampleFrame: "/api/placeholder/800/600",

  
  



status: "active",

  
  


taskType: "trafficStatistics",

  
  
updatedAt: "2024-12-20T14:30:00Z",
});

export function RecipeDetailsPage() {
  const { t } = useTranslation(["recipes", "common"]);
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>("regions");
  const [showOverflow] = useState(true); // Set to true to see comprehensive mock data

  // Get recipe from store
  const { recipes, formValues } = useRecipeStore();
  
  // Generate mock data with theme colors
  const mockRecipeDetails = generateMockRecipeDetails(theme, showOverflow);
  
  // Find recipe in store or use mock data
  const recipeFromStore = recipes.find(r => r.id === recipeId);
  const recipe = recipeFromStore ? {
    ...mockRecipeDetails,
    configuration: {
      classFilter: formValues.classFilter || recipeFromStore.classFilter || mockRecipeDetails.configuration.classFilter,
      confidenceThreshold: formValues.confidenceThreshold || recipeFromStore.confidenceThreshold || 0.7,
      frameInterval: formValues.inferenceStep || 5,
      inferenceStep: formValues.inferenceStep || 5,
    },
    connections: formValues.connections || mockRecipeDetails.connections,
    createdAt: recipeFromStore.createdAt,
    description: recipeFromStore.description || mockRecipeDetails.description,
    id: recipeFromStore.id,
    model: formValues.modelConfig && formValues.name === recipeFromStore.name ? {
      ...mockRecipeDetails.model,
      id: formValues.modelId,
      labels: formValues.modelConfig.labels || mockRecipeDetails.model.labels,
      name: formValues.modelName || mockRecipeDetails.model.name,
    } : mockRecipeDetails.model,
    name: recipeFromStore.name,
    regions: formValues.regions?.length > 0 && formValues.name === recipeFromStore.name ? 
      formValues.regions : recipeFromStore.regions || mockRecipeDetails.regions,
    status: recipeFromStore.status,
    taskType: recipeFromStore.taskType,
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
      children: (
        <Text size="sm">
          {t("recipes:confirmDelete.message", { name: recipe.name })}
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: {
        cancel: t("common:action.cancel"),
        confirm: t("common:action.delete"),
      },
      onConfirm: () => {
        notifications.show({
          color: "green",
          message: t("recipes:notifications.deleteSuccessMessage"),
          title: t("recipes:notifications.deleteSuccess"),
        });
        navigate("/recipes");
      },
      title: t("recipes:confirmDelete.title"),
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
          return <Icons.Route2 size={20} />;
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

    // Get the road type from the first region (assuming all regions have the same road type)
    const roadType = recipe.regions.length > 0 && 'roadType' in recipe.regions[0] 
      ? (recipe.regions[0] as any).roadType 
      : undefined;

    return (
      <Grid gutter="lg">
        {/* Region Visualization */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card p="xl" radius="md" withBorder style={{ height: '500px' }}>
            <Stack h="100%">
              <Group justify="space-between">
                <Title order={4}>Region Configuration</Title>
                <Badge variant="light" color="blue">
                  {recipe.regions.length} Regions • {recipe.connections?.length || 0} Connections{roadType ? ` • ${getRoadTypeName(roadType)}` : ''}
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
          <Stack gap="md" h={500} style={{ minHeight: 0 }}>
            {/* Regions Section - Now takes 50% height */}
            <Card p="lg" radius="md" withBorder style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
              <Group justify="space-between" mb="md">
                <Title order={5}>Defined Regions</Title>
                <Badge size="sm" variant="light" color="blue">
                  {recipe.regions.length} regions
                </Badge>
              </Group>
              
              <ScrollArea h="100%" offsetScrollbars scrollbarSize={6} style={{ flex: 1 }}>
                <Stack gap="xs" pr="xs">
                  {recipe.regions.map((region, index) => (
                    <Card key={region.id} p="xs" radius="md" withBorder>
                      <Group gap="sm" mb="xs">
                        <Box
                          style={{
                            alignItems: "center",
                            backgroundColor: region.color || getRegionColor(theme, index),
                            borderRadius: "50%",
                            color: "white",
                            display: "flex",
                            flexShrink: 0,
                            fontSize: rem(11),
                            fontWeight: 600,
                            height: 20,
                            justifyContent: "center",
                            width: 20,
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
                </Stack>
              </ScrollArea>
            </Card>
            
            {/* Connections Section - Now takes 50% height */}
            {recipe.connections && recipe.connections.length > 0 && (
              <Card p="lg" radius="md" withBorder style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
                <Group justify="space-between" mb="md">
                  <Title order={5}>Connections</Title>
                  <Badge size="sm" variant="light" color="blue">
                    {recipe.connections.length} routes
                  </Badge>
                </Group>
                
                <ScrollArea h="100%" offsetScrollbars scrollbarSize={6} style={{ flex: 1 }}>
                  <Stack gap={6} pr="xs">
                    {recipe.connections.map((conn, idx) => {
                      const sourceRegion = recipe.regions.find(r => r.id === conn.sourceId);
                      const destRegion = recipe.regions.find(r => r.id === conn.destinationId);
                      return (
                        <Paper
                          key={conn.id}
                          p="xs"
                          radius="sm"
                          withBorder
                          style={{
                            backgroundColor: isDark ? theme.colors.dark?.[7] || theme.colors.gray[8] : theme.white,
                            borderColor: isDark ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[2],
                          }}
                        >
                          <Group gap="xs" wrap="nowrap" justify="center">
                            <Group gap={6} wrap="nowrap">
                              <Box
                                style={{
                                  alignItems: 'center',
                                  backgroundColor: (sourceRegion as any)?.color || theme.colors.gray[6],
                                  borderRadius: '50%',
                                  color: 'white',
                                  display: 'flex',
                                  flexShrink: 0,
                                  fontSize: rem(10),
                                  fontWeight: 700,
                                  height: 18,
                                  justifyContent: 'center',
                                  width: 18,
                                }}
                              >
                                {sourceRegion?.name}
                              </Box>
                              <Text size="xs" c="dimmed">Region {sourceRegion?.name}</Text>
                            </Group>
                            
                            <Box
                              style={{
                                alignItems: 'center',
                                color: theme.colors.blue[5],
                                display: 'flex',
                                gap: rem(4),
                              }}
                            >
                              <Box
                                style={{
                                  backgroundColor: theme.colors.blue[3],
                                  height: 1,
                                  width: 16,
                                }}
                              />
                              <Icons.ChevronRight size={14} />
                            </Box>
                            
                            <Group gap={6} wrap="nowrap">
                              <Box
                                style={{
                                  alignItems: 'center',
                                  backgroundColor: (destRegion as any)?.color || theme.colors.gray[6],
                                  borderRadius: '50%',
                                  color: 'white',
                                  display: 'flex',
                                  flexShrink: 0,
                                  fontSize: rem(10),
                                  fontWeight: 700,
                                  height: 18,
                                  justifyContent: 'center',
                                  width: 18,
                                }}
                              >
                                {destRegion?.name}
                              </Box>
                              <Text size="xs" c="dimmed">Region {destRegion?.name}</Text>
                            </Group>
                          </Group>
                        </Paper>
                      );
                    })}
                  </Stack>
                </ScrollArea>
              </Card>
            )}
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

                <Box style={{ position: 'relative' }}>
                  <ScrollArea h={400} offsetScrollbars scrollbarSize={6}>
                    <Stack gap="sm" pr="xs">
                      {recipe.model.labels.map((label, index) => (
                        <Paper key={label.id} p="md" radius="md" withBorder>
                          <Group gap="md">
                            <Box
                              style={{
                                backgroundColor: label.color,
                                borderRadius: theme.radius.md,
                                height: 40,
                                opacity: label.enabled ? 1 : 0.5,
                                width: 40,
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
                  
                  {/* Fade overlay at bottom when scrollable */}
                  {recipe.model.labels.length > 5 && (
                    <Box
                      style={{
                        background: `linear-gradient(to bottom, transparent, ${isDark ? theme.colors.dark[8] : 'white'})`,
                        bottom: 0,
                        height: 40,
                        left: 0,
                        pointerEvents: 'none',
                        position: 'absolute',
                        right: 0,
                      }}
                    />
                  )}
                </Box>
                
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
        <Center style={{ flexDirection: "column", height: 300 }}>
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
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
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
                  <Group gap="sm" align="center" mb="xs">
                    <Title order={2} fw={600}>{recipe.name}</Title>
                    {showOverflow && (
                      <Badge color="orange" variant="light" size="sm">
                        Overflow Demo
                      </Badge>
                    )}
                  </Group>
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
          backgroundColor: isDark
            ? theme.colors.dark[7]
            : theme.colors.gray[0],
          flex: 1,
          overflowY: "auto",
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