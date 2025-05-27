import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Paper,
  TextInput,
  Textarea,
  Badge,
  Divider,
  Alert,
  Box,
  Image,
  SimpleGrid,
  ThemeIcon,
  List,
  ColorSwatch,
  Progress,
  Title,
  Card,
  ScrollArea,
} from "@mantine/core";
import { 
  IconAlertCircle, 
  IconVideo, 
  IconBrain, 
  IconMapPin,
  IconCheck,
  IconTag,
  IconSettings,
  IconFileDescription
} from "@tabler/icons-react";
import { useRecipeStore } from "../../../lib/store/recipe-store";
import { useCreateRecipe } from "../../../lib/queries/recipe";
import { useModels } from "../../../lib/queries/model";

export function ReviewStep() {
  const { t } = useTranslation(["recipes"]);
  const { formValues, updateForm } = useRecipeStore();
  const [recipeName, setRecipeName] = useState(formValues.name || "");
  const [recipeDescription, setRecipeDescription] = useState(
    formValues.description || ""
  );

  // Get models data to find selected model details
  const { data: models = [] } = useModels();
  
  // Create recipe mutation
  const createRecipe = useCreateRecipe();

  // Update store when name or description change
  useEffect(() => {
    updateForm({ name: recipeName, description: recipeDescription });
  }, [recipeName, recipeDescription, updateForm]);

  // Get selected model details
  const selectedModel = models.find(m => m.id === formValues.modelId);
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 5;
    
    if (formValues.taskType) completed++;
    if (formValues.videoFile || formValues.extractedFrame) completed++;
    if (formValues.regions && formValues.regions.length > 0) completed++;
    if (formValues.modelId) completed++;
    if (recipeName && recipeName.length >= 3) completed++;
    
    return (completed / total) * 100;
  };
  
  const completionPercentage = getCompletionPercentage();
  const isComplete = completionPercentage === 100;
  
  // Count enabled labels
  const enabledLabelsCount = formValues.modelConfig?.labels?.filter(l => l.enabled).length || 0;
  const totalLabelsCount = formValues.modelConfig?.labels?.length || 0;

  return (
    <Stack gap="lg">
      {/* Header */}
      <Stack gap="xs">
        <Title order={2}>Review & Create Recipe</Title>
        <Text c="dimmed">
          Review your configuration and provide a name for your recipe
        </Text>
      </Stack>
      
      {/* Completion Progress */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="xs">
          <Text fw={500}>Configuration Progress</Text>
          <Text size="sm" c="dimmed">{Math.round(completionPercentage)}% Complete</Text>
        </Group>
        <Progress value={completionPercentage} color={isComplete ? "green" : "blue"} size="lg" radius="xl" />
      </Paper>

      {/* Recipe Details */}
      <Paper withBorder p="lg" radius="md">
        <Group mb="md">
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconFileDescription size={20} />
          </ThemeIcon>
          <Text fw={600} size="lg">Recipe Details</Text>
        </Group>
        
        <Stack>
          <TextInput
            label="Recipe Name"
            value={recipeName}
            onChange={(e) => setRecipeName(e.currentTarget.value)}
            placeholder="Enter a descriptive name for this recipe"
            required
            error=""
          />

          <Textarea
            label="Description"
            value={recipeDescription}
            onChange={(e) => setRecipeDescription(e.currentTarget.value)}
            placeholder="Describe what this recipe does (optional)"
            autosize
            minRows={3}
            maxRows={6}
          />
        </Stack>
      </Paper>

      {/* Configuration Summary Cards */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Task Type & Video */}
        <Card withBorder p="lg" radius="md">
          <Stack>
            <Group>
              <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                <IconVideo size={20} />
              </ThemeIcon>
              <Text fw={600}>Task Configuration</Text>
            </Group>
            
            <Stack gap="sm" pl="xl">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Task Type:</Text>
                <Badge color="indigo" variant="dot">
                  {formValues.taskType || "Not selected"}
                </Badge>
              </Group>
              
              <Divider />
              
              <div>
                <Text size="sm" c="dimmed" mb="xs">Video Source:</Text>
                {formValues.extractedFrame ? (
                  <Box>
                    <Image
                      src={formValues.extractedFrame}
                      height={120}
                      fit="contain"
                      radius="sm"
                      style={{ border: '1px solid var(--mantine-color-gray-3)' }}
                    />
                    {formValues.videoName && (
                      <Text size="xs" c="dimmed" mt="xs">{formValues.videoName}</Text>
                    )}
                  </Box>
                ) : (
                  <Text size="sm">No video selected</Text>
                )}
              </div>
            </Stack>
          </Stack>
        </Card>
        
        {/* Model Configuration */}
        <Card withBorder p="lg" radius="md">
          <Stack>
            <Group>
              <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                <IconBrain size={20} />
              </ThemeIcon>
              <Text fw={600}>Model Configuration</Text>
            </Group>
            
            <Stack gap="sm" pl="xl">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Model:</Text>
                <Text size="sm" fw={500}>
                  {selectedModel?.name || formValues.modelName || "Not selected"}
                </Text>
              </Group>
              
              {selectedModel && (
                <>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Type:</Text>
                    <Badge size="sm" variant="outline">{selectedModel.type}</Badge>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Status:</Text>
                    <Badge size="sm" color={selectedModel.status === 'ready' ? 'green' : 'yellow'}>
                      {selectedModel.status}
                    </Badge>
                  </Group>
                </>
              )}
              
              <Divider />
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Detection Labels:</Text>
                <Text size="sm" fw={500}>
                  {enabledLabelsCount} / {totalLabelsCount} enabled
                </Text>
              </Group>
              
              {formValues.modelConfig?.labels && (
                <ScrollArea h={80} offsetScrollbars>
                  <Group gap="xs">
                    {formValues.modelConfig.labels
                      .filter(label => label.enabled)
                      .map(label => (
                        <Badge 
                          key={label.id}
                          leftSection={<ColorSwatch color={label.color} size={10} />}
                          variant="dot"
                          size="sm"
                        >
                          {label.name}
                        </Badge>
                      ))}
                  </Group>
                </ScrollArea>
              )}
            </Stack>
          </Stack>
        </Card>
      </SimpleGrid>
      
      {/* Regions Configuration */}
      <Paper withBorder p="lg" radius="md">
        <Group mb="md">
          <ThemeIcon size="lg" radius="md" variant="light" color="orange">
            <IconMapPin size={20} />
          </ThemeIcon>
          <Text fw={600}>Region Configuration</Text>
          <Badge variant="filled" color="orange">
            {formValues.regions?.length || 0} regions
          </Badge>
        </Group>
        
        {formValues.regions && formValues.regions.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {formValues.regions.map((region, index) => (
              <Card key={region.id} withBorder p="sm" radius="md">
                <Group gap="xs">
                  <Box
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: region.color
                    }}
                  />
                  <Text size="sm" fw={500}>{region.name}</Text>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  Type: {region.type} • {region.direction || 'N/A'}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Alert variant="light" color="orange" icon={<IconAlertCircle size={16} />}>
            No regions have been configured
          </Alert>
        )}
        
        {formValues.connections && formValues.connections.length > 0 && (
          <>
            <Divider my="md" />
            <Text size="sm" c="dimmed" mb="xs">
              {formValues.connections.length} connection{formValues.connections.length !== 1 ? 's' : ''} configured
            </Text>
          </>
        )}
      </Paper>
      
      {/* Validation Messages */}
      {!isComplete && (
        <Alert variant="light" color="yellow" icon={<IconAlertCircle size={16} />}>
          <Text fw={500} mb="xs">Missing Configuration</Text>
          <List size="sm" spacing="xs">
            {!formValues.taskType && <List.Item>Select a task type</List.Item>}
            {!formValues.extractedFrame && !formValues.videoFile && <List.Item>Upload or select a video</List.Item>}
            {(!formValues.regions || formValues.regions.length === 0) && <List.Item>Configure at least one region</List.Item>}
            {!formValues.modelId && <List.Item>Select an AI model</List.Item>}
            {!recipeName && <List.Item>Provide a recipe name</List.Item>}
          </List>
        </Alert>
      )}
      
      {isComplete && (
        <Alert variant="light" color="green" icon={<IconCheck size={16} />}>
          All configuration is complete! You can now create the recipe.
        </Alert>
      )}
      
      {/* Error/Success Messages */}
      {createRecipe.isError && (
        <Alert variant="filled" color="red" icon={<IconAlertCircle size={16} />}>
          Failed to create recipe: {createRecipe.error?.message}
        </Alert>
      )}
      
      {createRecipe.isSuccess && (
        <Alert variant="filled" color="green" icon={<IconCheck size={16} />}>
          Recipe created successfully!
        </Alert>
      )}
    </Stack>
  );
}
