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
  ThemeIcon,
  ActionIcon,
  Tabs,
  ScrollArea,
  Alert,
  Divider,
  Image,
  Table,
  Progress,
  Transition,
  Skeleton,
} from "@mantine/core";
import { Icons } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/page-layout/page-layout";
import { PageLoader } from "@/components/ui";
import { useTheme } from "@/providers/theme-provider";
import { useMantineTheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { getTaskTypeColor } from "@/lib/utils";
import { useRecipeStore } from "@/lib/store/recipe-store";

// Mock data for the recipe details
const MOCK_RECIPE_DETAILS = {
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
    // General settings
    frameInterval: 5, // Process every 5th frame
    confidenceThreshold: 0.7,

    // Traffic statistics specific
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
        color: "#FF6B6B",
        confidence: 0.7,
        enabled: true,
      },
      {
        id: "2",
        name: "Truck",
        color: "#4ECDC4",
        confidence: 0.75,
        enabled: true,
      },
      {
        id: "3",
        name: "Bus",
        color: "#45B7D1",
        confidence: 0.8,
        enabled: true,
      },
      {
        id: "4",
        name: "Motorcycle",
        color: "#FFA07A",
        confidence: 0.65,
        enabled: true,
      },
      {
        id: "5",
        name: "Bicycle",
        color: "#98D8C8",
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
      color: "#FF6B6B",
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
      color: "#4ECDC4",
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
      color: "#45B7D1",
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

};

export function RecipeDetailsPage() {
  const { t } = useTranslation(["recipes", "common"]);
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { theme, colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState<string | null>("regions");
  const [mounted, setMounted] = useState(false);
  const [tabTransition, setTabTransition] = useState(true);

  // Get recipe from store
  const { recipes, formValues } = useRecipeStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Find recipe in store or use mock data
  const recipeFromStore = recipes.find(r => r.id === recipeId);
  const recipe = recipeFromStore ? {
    ...MOCK_RECIPE_DETAILS,
    id: recipeFromStore.id,
    name: recipeFromStore.name,
    description: recipeFromStore.description || MOCK_RECIPE_DETAILS.description,
    taskType: recipeFromStore.task_type || recipeFromStore.taskType,
    status: recipeFromStore.status,
    createdAt: recipeFromStore.created_at || recipeFromStore.createdAt,
    // Use form values if this is the recently created recipe
    configuration: formValues.name === recipeFromStore.name ? {
      frameInterval: formValues.inferenceStep || 5,
      confidenceThreshold: formValues.confidenceThreshold || 0.7,
      vehicleClasses: formValues.classFilter || ["car", "truck", "bus", "motorcycle", "bicycle"],
      countingLines: formValues.regions?.filter(r => r.type === "counting_line").map((r, idx) => ({
        id: `line-${idx + 1}`,
        name: r.name || `Line ${idx + 1}`,
        direction: idx === 0 ? "northbound" : "southbound"
      })) || [],
      speedEstimation: true,
      congestionDetection: true,
    } : MOCK_RECIPE_DETAILS.configuration,
    model: formValues.name === recipeFromStore.name && formValues.modelConfig ? {
      id: formValues.modelId,
      name: formValues.modelName || "YOLOv8 Traffic Model",
      version: "v1.2.0",
      type: "detection",
      size: "45.2 MB",
      labels: formValues.modelConfig.labels || MOCK_RECIPE_DETAILS.model.labels,
    } : MOCK_RECIPE_DETAILS.model,
    regions: formValues.name === recipeFromStore.name && formValues.regions ? 
      formValues.regions.map((r, idx) => ({
        ...r,
        color: r.color || MOCK_RECIPE_DETAILS.regions[idx]?.color || "#FF6B6B",
        settings: {
          direction: idx === 0 ? "northbound" : "southbound",
          vehicleTypes: ["all"],
        }
      })) : MOCK_RECIPE_DETAILS.regions,
  } : MOCK_RECIPE_DETAILS;

  // Simulate loading and mount animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMounted(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab changes with transition
  const handleTabChange = (value: string | null) => {
    setTabTransition(false);
    setTimeout(() => {
      setActiveTab(value);
      setTabTransition(true);
    }, 150);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!recipe) {
    return (
      <PageLayout>
        <Alert
          icon={<Icons.AlertCircle size={16} />}
          title={t("recipes:details.notFound")}
          color="red"
        >
          {t("recipes:details.notFoundDescription")}
        </Alert>
      </PageLayout>
    );
  }

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

  const cardBg = isDark ? theme.colors.dark[7] : theme.white;
  const surfaceBg = isDark ? theme.colors.dark[6] : theme.colors.gray[0];

  // Ensure theme properties are available
  const shadows = mantineTheme.shadows || {
    sm: "0 1px 3px rgba(0, 0, 0, 0.12)",
    md: "0 4px 6px rgba(0, 0, 0, 0.12)",
  };

  // Animation styles
  const cardTransition = {
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: shadows.md,
    },
  };

  const metricCardStyle = {
    backgroundColor: surfaceBg,
    transition: "all 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: isDark ? theme.colors.dark[5] : theme.colors.gray[1],
      transform: "scale(1.02)",
    },
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .transition-tabs .mantine-Tabs-panel {
          animation: fadeIn 0.3s ease;
        }
        
        .metric-card-enter {
          animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      <PageLayout>
        <Stack gap="lg">
          {/* Header */}
          <Transition
            mounted={mounted}
            transition="fade-up"
            duration={400}
            timingFunction="ease"
          >
            {(styles) => (
              <Paper p="lg" radius="md" withBorder style={styles}>
                <Group justify="space-between" align="flex-start">
                  <Group>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="lg"
                      onClick={() => navigate("/recipes")}
                      style={{ transition: "all 0.2s ease" }}
                      sx={{
                        "&:hover": {
                          transform: "translateX(-2px)",
                        },
                      }}
                    >
                      <Icons.ArrowLeft size={20} />
                    </ActionIcon>
                    <Box>
                      <Title order={3}>{recipe.name}</Title>
                      <Group gap="xs" mt="xs">
                        <Badge
                          color={getTaskTypeColor(recipe.taskType)}
                          variant="light"
                          style={{
                            animation: "fadeIn 0.5s ease",
                            animationDelay: "0.2s",
                            animationFillMode: "both",
                          }}
                        >
                          {t(`recipes:taskType.${recipe.taskType}`)}
                        </Badge>
                        <Badge
                          variant="light"
                          color={recipe.status === "active" ? "green" : "gray"}
                          style={{
                            animation: "fadeIn 0.5s ease",
                            animationDelay: "0.3s",
                            animationFillMode: "both",
                          }}
                        >
                          {t(`recipes:status.${recipe.status}`)}
                        </Badge>
                        <Text size="sm" c="dimmed">
                          {t("recipes:details.createdOn", {
                            date: new Date(
                              recipe.createdAt
                            ).toLocaleDateString(),
                          })}
                        </Text>
                      </Group>
                    </Box>
                  </Group>

                  <Group gap="sm">
                    <Button
                      variant="light"
                      leftSection={<Icons.Rocket size={16} />}
                      onClick={handleCreateTask}
                    >
                      {t("recipes:actions.createTask")}
                    </Button>
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<Icons.Edit size={16} />}
                      onClick={handleEdit}
                    >
                      {t("common:action.edit")}
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      leftSection={<Icons.Trash size={16} />}
                      onClick={handleDelete}
                    >
                      {t("common:action.delete")}
                    </Button>
                  </Group>
                </Group>
              </Paper>
            )}
          </Transition>

          {/* Content Tabs */}
          <Transition
            mounted={mounted}
            transition="fade-up"
            duration={500}
            delay={200}
            timingFunction="ease"
          >
            {(styles) => (
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                style={styles}
                className="transition-tabs"
              >
                <Tabs.List>
                  <Tabs.Tab
                    value="regions"
                    leftSection={<Icons.Map size={16} />}
                  >
                    {t("recipes:details.tabs.regions")}
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="model"
                    leftSection={<Icons.Brain size={16} />}
                  >
                    {t("recipes:details.tabs.model")}
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="regions" pt="xl">
                  <Paper
                    p="lg"
                    radius="md"
                    withBorder
                    style={{ backgroundColor: cardBg }}
                  >
                    <Title order={5} mb="md">
                      {t("recipes:details.regionConfiguration")}
                    </Title>

                    <Grid>
                      <Grid.Col span={{ base: 12, md: 7 }}>
                        {/* Region Visualization Placeholder */}
                        <Box
                          style={{
                            position: "relative",
                            backgroundColor: surfaceBg,
                            borderRadius: mantineTheme.radius.md,
                            minHeight: 400,
                            border: `2px dashed ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                            overflow: "hidden",
                          }}
                        >
                          {/* Background pattern */}
                          <Box
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              opacity: 0.1,
                              backgroundImage: `
                                linear-gradient(45deg, ${theme.colors.gray[5]} 25%, transparent 25%),
                                linear-gradient(-45deg, ${theme.colors.gray[5]} 25%, transparent 25%),
                                linear-gradient(45deg, transparent 75%, ${theme.colors.gray[5]} 75%),
                                linear-gradient(-45deg, transparent 75%, ${theme.colors.gray[5]} 75%)
                              `,
                              backgroundSize: "20px 20px",
                              backgroundPosition:
                                "0 0, 0 10px, 10px -10px, -10px 0px",
                            }}
                          />

                          {/* Main content */}
                          <Stack
                            align="center"
                            justify="center"
                            style={{
                              height: "100%",
                              minHeight: 400,
                              padding: mantineTheme.spacing.xl,
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            {/* Icon */}
                            <ThemeIcon
                              size={80}
                              radius="xl"
                              variant="light"
                              color="blue"
                              style={{
                                backgroundColor: isDark
                                  ? theme.colors.dark[6]
                                  : theme.colors.gray[1],
                                border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                              }}
                            >
                              <Icons.Map size={40} />
                            </ThemeIcon>

                            {/* Title */}
                            <Title order={4} ta="center" c="dimmed">
                              {t("recipes:details.regionVisualization")}
                            </Title>

                            {/* Description */}
                            <Text size="sm" ta="center" c="dimmed" maw={300}>
                              Interactive region visualization will display
                              here.
                            </Text>

                            {/* Coming Soon badge */}
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
                          </Stack>
                        </Box>
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 5 }}>
                        <ScrollArea h={400}>
                          <Stack gap="md">
                            {recipe.regions.map((region) => (
                              <Card
                                key={region.id}
                                p="md"
                                radius="md"
                                withBorder
                              >
                                <Group justify="space-between" mb="xs">
                                  <Group gap="xs">
                                    <Box
                                      style={{
                                        width: 16,
                                        height: 16,
                                        backgroundColor: region.color,
                                        borderRadius: mantineTheme.radius.sm,
                                      }}
                                    />
                                    <Text fw={500}>{region.name}</Text>
                                  </Group>
                                  <Badge variant="light" size="sm">
                                    {region.type}
                                  </Badge>
                                </Group>
                                <Text size="xs" c="dimmed" mb="xs">
                                  {region.points.length} points
                                </Text>
                                {Object.entries(region.settings).map(
                                  ([key, value]) => (
                                    <Group key={key} justify="space-between">
                                      <Text size="xs" c="dimmed">
                                        {key}:
                                      </Text>
                                      <Text size="xs">{String(value)}</Text>
                                    </Group>
                                  )
                                )}
                              </Card>
                            ))}
                          </Stack>
                        </ScrollArea>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="model" pt="xl">
                  <Paper
                    p="lg"
                    radius="md"
                    withBorder
                    style={{ backgroundColor: cardBg }}
                  >
                    <Group justify="space-between" mb="md">
                      <Title order={5}>
                        {t("recipes:details.modelConfiguration")}
                      </Title>
                      <Badge variant="light" color="blue">
                        {recipe.model.type} • {recipe.model.version}
                      </Badge>
                    </Group>

                    <Grid>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card
                          p="lg"
                          radius="md"
                          style={{ backgroundColor: surfaceBg }}
                        >
                          <ThemeIcon
                            size={48}
                            radius="md"
                            variant="light"
                            color="blue"
                            mb="md"
                          >
                            <Icons.Brain size={24} />
                          </ThemeIcon>
                          <Text fw={500} mb="xs">
                            {recipe.model.name}
                          </Text>
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                Type:
                              </Text>
                              <Text size="xs">{recipe.model.type}</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                Version:
                              </Text>
                              <Text size="xs">{recipe.model.version}</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                Size:
                              </Text>
                              <Text size="xs">{recipe.model.size}</Text>
                            </Group>
                          </Stack>
                        </Card>
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 8 }}>
                        <Box>
                          <Text size="sm" fw={500} mb="md">
                            {t("recipes:details.detectionLabels")}
                          </Text>
                          <Table striped highlightOnHover>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Label</Table.Th>
                                <Table.Th>Color</Table.Th>
                                <Table.Th>Confidence</Table.Th>
                                <Table.Th>Status</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {recipe.model.labels.map((label) => (
                                <Table.Tr key={label.id}>
                                  <Table.Td>{label.name}</Table.Td>
                                  <Table.Td>
                                    <Box
                                      style={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: label.color,
                                        borderRadius: mantineTheme.radius.sm,
                                      }}
                                    />
                                  </Table.Td>
                                  <Table.Td>
                                    <Group gap="xs">
                                      <Progress
                                        value={label.confidence * 100}
                                        w={60}
                                        size="sm"
                                      />
                                      <Text size="xs">
                                        {(label.confidence * 100).toFixed(0)}%
                                      </Text>
                                    </Group>
                                  </Table.Td>
                                  <Table.Td>
                                    <Badge
                                      variant="light"
                                      color={label.enabled ? "green" : "gray"}
                                      size="sm"
                                    >
                                      {label.enabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                            </Table.Tbody>
                          </Table>
                        </Box>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                </Tabs.Panel>

              </Tabs>
            )}
          </Transition>
        </Stack>
      </PageLayout>
    </>
  );
}
