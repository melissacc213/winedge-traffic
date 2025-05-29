import { useState } from "react";
import {
  Stack,
  Card,
  Title,
  Text,
  Button,
  Group,
  Code,
  Alert,
  Tabs,
  Paper,
  Badge,
  JsonInput,
  Select,
  NumberInput,
  Switch,
  Grid,
} from "@mantine/core";
import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { CompactTaskControl } from "@/components/task-control";
import { useTaskWebSocket } from "@/hooks/use-task-websocket";
import { useTheme } from "@/providers/theme-provider";
import { notifications } from "@mantine/notifications";
import type { Task } from "@/types/task";

// Mock task for demonstration
const createMockTask = (status: Task["status"] = "pending"): Task => ({
  id: "demo-task-123",
  name: "Traffic Analysis Demo",
  description: "Real-time traffic monitoring with WebSocket updates",
  recipeId: "recipe-456",
  status,
  progress: status === "running" ? 0.45 : 0,
  resultType: "trafficStatistics",
  priority: "high",
  createdAt: new Date().toISOString(),
  startedAt: status !== "pending" ? new Date().toISOString() : undefined,
  completedAt: status === "completed" ? new Date().toISOString() : undefined,
});

export function TaskWebSocketDemoPage() {
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const [task, setTask] = useState<Task>(createMockTask());
  const [mockConfig, setMockConfig] = useState({
    progressSpeed: 1,
    logFrequency: 2,
    enableErrors: false,
  });

  // WebSocket hook usage example
  const {
    state: wsState,
    progress,
    logs,
    connect,
    disconnect,
    clearLogs,
  } = useTaskWebSocket({
    url: `ws://localhost:8080/tasks/${task.id}/stream`,
    taskId: task.id,
    reconnectAttempts: 3,
    reconnectDelay: 5000,
  });

  const handleStart = async () => {
    setTask({ ...task, status: "running", startedAt: new Date().toISOString() });
    notifications.show({
      title: "Task Started",
      message: "WebSocket connection will be established",
      color: "green",
    });
  };

  const handleStop = async () => {
    setTask({ ...task, status: "stopped" });
    notifications.show({
      title: "Task Stopped",
      message: "WebSocket connection closed",
      color: "yellow",
    });
  };

  const handleRestart = async () => {
    setTask(createMockTask("running"));
    clearLogs();
    notifications.show({
      title: "Task Restarted",
      message: "Starting fresh with new connection",
      color: "blue",
    });
  };

  const webSocketExample = `
// Basic WebSocket usage
import { useTaskWebSocket } from '@/hooks/use-task-websocket';

function MyComponent() {
  const { state, progress, logs } = useTaskWebSocket({
    url: 'ws://api.example.com/tasks/123/stream',
    taskId: '123',
  });

  return (
    <div>
      <p>Connection: {state}</p>
      <p>Progress: {progress?.progress}%</p>
      <p>FPS: {progress?.fps}</p>
    </div>
  );
}`;

  const integrationExample = `
// Compact task control with real-time updates
import { CompactTaskControl } from '@/components/task-control';

function TaskPage({ task }: { task: Task }) {
  return (
    <CompactTaskControl
      task={task}
      onStart={handleStart}
      onStop={handleStop}
      onRestart={handleRestart}
    />
  );
}

// Handle WebSocket events
const handleTaskProgress = (event: TaskWebSocketEvent) => {
  switch (event.type) {
    case 'progress':
      updateTaskProgress(event.data);
      break;
    case 'complete':
      showCompletionSummary(event.summary);
      break;
    case 'error':
      handleTaskError(event.error);
      break;
  }
};`;

  return (
    <PageLayout
      title="Task WebSocket Demo"
      description="Test and explore real-time task updates with WebSocket integration"
    >
      <Stack gap="lg">
        {/* Demo Controls */}
        <Card p="lg" radius="md" withBorder>
          <Title order={4} mb="md">Demo Configuration</Title>
          <Grid>
            <Grid.Col span={4}>
              <Select
                label="Task Status"
                value={task.status}
                onChange={(value) => setTask({ ...task, status: value as Task["status"] })}
                data={[
                  { value: "pending", label: "Pending" },
                  { value: "running", label: "Running" },
                  { value: "completed", label: "Completed" },
                  { value: "failed", label: "Failed" },
                  { value: "stopped", label: "Stopped" },
                ]}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Progress Speed"
                value={mockConfig.progressSpeed}
                onChange={(value) => setMockConfig({ ...mockConfig, progressSpeed: value || 1 })}
                min={0.1}
                max={5}
                step={0.1}
                decimalScale={1}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Log Frequency (seconds)"
                value={mockConfig.logFrequency}
                onChange={(value) => setMockConfig({ ...mockConfig, logFrequency: value || 2 })}
                min={1}
                max={10}
              />
            </Grid.Col>
          </Grid>
          <Group mt="md">
            <Switch
              label="Enable random errors"
              checked={mockConfig.enableErrors}
              onChange={(e) => setMockConfig({ ...mockConfig, enableErrors: e.currentTarget.checked })}
            />
            <Badge
              color={wsState === "connected" ? "green" : wsState === "connecting" ? "yellow" : "gray"}
              variant="dot"
            >
              WebSocket: {wsState}
            </Badge>
          </Group>
        </Card>

        {/* Live Task Control */}
        <CompactTaskControl
          task={task}
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
        />

        {/* Implementation Guide */}
        <Card p="lg" radius="md" withBorder>
          <Tabs defaultValue="usage">
            <Tabs.List>
              <Tabs.Tab value="usage" leftSection={<Icons.Code size={16} />}>
                Usage
              </Tabs.Tab>
              <Tabs.Tab value="events" leftSection={<Icons.Zap size={16} />}>
                Events
              </Tabs.Tab>
              <Tabs.Tab value="types" leftSection={<Icons.FileCode size={16} />}>
                Types
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="usage" pt="md">
              <Stack gap="md">
                <Title order={5}>Basic Usage</Title>
                <Code block>{webSocketExample}</Code>
                
                <Title order={5}>Integration Example</Title>
                <Code block>{integrationExample}</Code>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="events" pt="md">
              <Stack gap="md">
                <Title order={5}>WebSocket Events</Title>
                <Paper p="md" radius="md" withBorder>
                  <Stack gap="sm">
                    <Group>
                      <Badge color="blue">progress</Badge>
                      <Text size="sm">Real-time progress updates with metrics</Text>
                    </Group>
                    <Group>
                      <Badge color="green">log</Badge>
                      <Text size="sm">Activity logs and processing events</Text>
                    </Group>
                    <Group>
                      <Badge color="purple">frame</Badge>
                      <Text size="sm">Video frame data with detections</Text>
                    </Group>
                    <Group>
                      <Badge color="green">complete</Badge>
                      <Text size="sm">Task completion with summary</Text>
                    </Group>
                    <Group>
                      <Badge color="red">error</Badge>
                      <Text size="sm">Error notifications</Text>
                    </Group>
                  </Stack>
                </Paper>

                <Title order={5}>Current Progress Data</Title>
                <JsonInput
                  value={JSON.stringify(progress, null, 2)}
                  formatOnBlur
                  autosize
                  minRows={4}
                  readOnly
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="types" pt="md">
              <Stack gap="md">
                <Title order={5}>TypeScript Types</Title>
                <Code block language="typescript">{`
interface TaskProgress {
  taskId: string;
  progress: number; // 0-100
  currentFrame: number;
  totalFrames: number;
  fps: number;
  eta: number; // seconds
  processingSpeed: number;
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  detections: Record<string, number>;
  timestamp: string;
}

interface TaskLog {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}
                `}</Code>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>

        {/* Connection Info */}
        <Alert
          icon={<Icons.InfoCircle size={16} />}
          title="WebSocket Integration"
          color="blue"
          variant="light"
        >
          <Stack gap="xs">
            <Text size="sm">
              This demo uses a mock WebSocket implementation for development. In production:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Replace the mock with actual WebSocket connection</li>
              <li>Implement server-side WebSocket endpoint</li>
              <li>Handle authentication and authorization</li>
              <li>Implement heartbeat for connection health</li>
            </ul>
          </Stack>
        </Alert>
      </Stack>
    </PageLayout>
  );
}