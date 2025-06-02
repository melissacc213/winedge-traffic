import { useState, useEffect, useMemo, Fragment } from "react";
import {
  Stack,
  Text,
  Group,
  Paper,
  Badge,
  Button,
  Table,
  ScrollArea,
  TextInput,
  ActionIcon,
  Alert,
  Loader,
  Center,
  Tabs,
  Checkbox,
  Box,
  Pagination,
  Select,
} from "@mantine/core";
import { Icons } from "../../icons";
import { useDisclosure } from "@mantine/hooks";
import { useRecipeStore } from "../../../lib/store/recipe-store";
import { useTheme } from "@/providers/theme-provider";
import { getRegionColor } from "@/lib/theme-utils";
import { useModels } from "../../../lib/queries/model";
import { ModelUploadDialog } from "../../model-config-editor/model-upload-dialog";
import { LabelEditor } from "../../model-config-editor/label-editor";
import type { ModelLabel, ModelConfig } from "../../../types/model";
import type { MantineTheme } from "@mantine/core";

// Generate mock data for model labels - in a real app this would come from the selected model's config
const generateMockLabels = (theme: MantineTheme): ModelLabel[] => [
  { id: "1", name: "Person", color: getRegionColor(theme, 0), confidence: 0.7, width_threshold: 32, height_threshold: 32, enabled: true },
  {
    id: "2",
    name: "Vehicle",
    color: getRegionColor(theme, 1),
    confidence: 0.75,
    width_threshold: 32,
    height_threshold: 32,
    enabled: true,
  },
  { id: "3", name: "Truck", color: getRegionColor(theme, 2), confidence: 0.8, width_threshold: 32, height_threshold: 32, enabled: true },
  {
    id: "4",
    name: "Motorcycle",
    color: getRegionColor(theme, 3),
    confidence: 0.65,
    width_threshold: 32,
    height_threshold: 32,
    enabled: false,
  },
  {
    id: "5",
    name: "Bicycle",
    color: getRegionColor(theme, 4),
    confidence: 0.6,
    width_threshold: 32,
    height_threshold: 32,
    enabled: true,
  },
];

export function ModelConfigStep() {
  const { theme } = useTheme();
  const { formValues, setModel, setModelConfig } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [labels, setLabels] = useState<ModelLabel[]>(
    formValues.modelConfig?.labels || generateMockLabels(theme)
  );
  const [opened, { open, close }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string | null>("models");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get available models
  const { data: models = [], isLoading, refetch } = useModels();

  // Filter models based on search
  const filteredModels = useMemo(() => {
    return models.filter((model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / pageSize);
  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredModels.slice(start, end);
  }, [filteredModels, currentPage, pageSize]);

  // Update store when configuration changes
  useEffect(() => {
    if (formValues.modelId) {
      setModelConfig({
        modelId: formValues.modelId,
        confidence: 0.7,
        labels: labels,
      });
    }
  }, [formValues.modelId, labels, setModelConfig]);

  const handleLabelUpdate = (labelId: string, updates: Partial<ModelLabel>) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === labelId ? { ...label, ...updates } : label
      )
    );
  };


  const handleToggleEnabled = (labelId: string) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === labelId ? { ...label, enabled: !label.enabled } : label
      )
    );
  };

  const handleModelConfigured = (config: ModelConfig) => {
    // When a model is configured from the upload dialog, use it
    if (config.labels) {
      setLabels(config.labels);
    }
    close();
    refetch();
  };

  return (
    <Fragment>
      <Stack gap="lg">
        <Group justify="end" align="start">
          <Stack gap="xs"></Stack>
          <Button leftSection={<Icons.Plus size={16} />} onClick={open}>
            Create Model
          </Button>
        </Group>

        {/* Model Selection with Tabs */}
        <Paper withBorder radius="md">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="models" leftSection={<Icons.Brain size={16} />}>
                Select Model
              </Tabs.Tab>
              <Tabs.Tab
                value="labels"
                leftSection={<Icons.Tag size={16} />}
                disabled={!formValues.modelId}
              >
                Configure Labels
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="models" p="lg">
              <Stack>
                <TextInput
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  leftSection={<Icons.Search size={16} />}
                  rightSection={
                    searchQuery && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => setSearchQuery("")}
                      >
                        <Icons.X size={16} />
                      </ActionIcon>
                    )
                  }
                  mb="md"
                />

                {isLoading ? (
                  <Center py="xl">
                    <Loader size="sm" />
                  </Center>
                ) : filteredModels.length === 0 ? (
                  <Stack align="center" py="xl" gap="md">
                    <Icons.Brain size={48} color="gray" />
                    <Text c="dimmed" ta="center">
                      {searchQuery
                        ? `No models found matching "${searchQuery}"`
                        : "No models available. Create your first model to get started."}
                    </Text>
                    {!searchQuery && (
                      <Button
                        leftSection={<Icons.Plus size={16} />}
                        onClick={open}
                      >
                        Create Model
                      </Button>
                    )}
                  </Stack>
                ) : (
                  <Stack gap="md">
                    <Box style={{ position: "relative", height: 400 }}>
                      <ScrollArea h={400} offsetScrollbars>
                        <Table 
                          verticalSpacing="sm" 
                          highlightOnHover
                          stickyHeader
                          striped
                          withTableBorder
                        >
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th style={{ width: 40 }}></Table.Th>
                              <Table.Th>Model Name</Table.Th>
                              <Table.Th>Type</Table.Th>
                              <Table.Th>Size</Table.Th>
                              <Table.Th>Status</Table.Th>
                              <Table.Th>Created</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {paginatedModels.map((model) => (
                              <Table.Tr
                                key={model.id}
                                onClick={() => {
                                  setModel(model.id, model.name);
                                  setActiveTab("labels");
                                }}
                                style={{ cursor: "pointer" }}
                                className={
                                  formValues.modelId === model.id
                                    ? "bg-blue-50 dark:bg-blue-900/20"
                                    : ""
                                }
                              >
                                <Table.Td>
                                  <Checkbox
                                    checked={formValues.modelId === model.id}
                                    onChange={() => {
                                      setModel(model.id, model.name);
                                      setActiveTab("labels");
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <Group gap="xs">
                                    <Icons.Brain size={16} />
                                    <Text fw={500}>{model.name}</Text>
                                  </Group>
                                </Table.Td>
                                <Table.Td>{model.type}</Table.Td>
                                <Table.Td>
                                  {(model.size / (1024 * 1024)).toFixed(1)} MB
                                </Table.Td>
                                <Table.Td>
                                  <Badge
                                    size="sm"
                                    color={
                                      model.status === "active" ? "green" : "yellow"
                                    }
                                    variant="dot"
                                  >
                                    {model.status}
                                  </Badge>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" c="dimmed">
                                    {new Date(model.createdAt).toLocaleDateString()}
                                  </Text>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </ScrollArea>
                    </Box>
                    
                    {/* Pagination */}
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text size="sm">
                          Showing {((currentPage - 1) * pageSize) + 1} -{" "}
                          {Math.min(currentPage * pageSize, filteredModels.length)} of{" "}
                          {filteredModels.length}
                        </Text>
                        <Select
                          size="xs"
                          value={String(pageSize)}
                          onChange={(value) => {
                            setPageSize(Number(value));
                            setCurrentPage(1);
                          }}
                          data={["5", "10", "20", "30", "40", "50"].map((size) => ({
                            value: size,
                            label: `${size} per page`,
                          }))}
                          w={110}
                          radius="xl"
                        />
                      </Group>
                      <Pagination
                        total={totalPages}
                        value={currentPage}
                        onChange={setCurrentPage}
                        color="blue"
                        size="sm"
                        radius="xl"
                        withEdges
                      />
                    </Group>
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="labels" p="lg">
              {formValues.modelId ? (
                <Stack>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">
                        Detection Labels
                      </Text>
                      <Text size="sm" c="dimmed">
                        Configure which objects the model should detect and
                        their confidence thresholds
                      </Text>
                    </div>
                  </Group>

                  <ScrollArea h={400} offsetScrollbars>
                    <Stack gap="sm">
                      {labels.map((label, index) => (
                        <LabelEditor
                          key={label.id}
                          label={label}
                          index={index}
                          onUpdate={handleLabelUpdate}
                          onToggleEnabled={handleToggleEnabled}
                          showReorderControls={false}
                        />
                      ))}
                    </Stack>
                  </ScrollArea>

                  {labels.length === 0 && (
                    <Alert
                      variant="light"
                      color="blue"
                      icon={<Icons.AlertCircle size={16} />}
                    >
                      No labels configured. Add labels to define what objects
                      the model should detect.
                    </Alert>
                  )}
                </Stack>
              ) : (
                <Alert
                  variant="light"
                  color="yellow"
                  icon={<Icons.AlertCircle size={16} />}
                >
                  Please select a model first to configure its labels.
                </Alert>
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>

      {/* Model Upload Dialog */}
      <ModelUploadDialog
        opened={opened}
        onClose={close}
        onModelConfigured={handleModelConfigured}
        title="Create & Configure Model"
      />
    </Fragment>
  );
}
