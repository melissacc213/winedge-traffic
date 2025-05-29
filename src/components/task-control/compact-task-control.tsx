import { useState, useEffect } from "react";
import {
  Card,
  Stack,
  Group,
  Button,
  Text,
  Badge,
  Progress,
  Paper,
  Grid,
  RingProgress,
  ActionIcon,
  Tooltip,
  Divider,
  Box,
  Title,
  Collapse,
  Timeline,
  Tabs,
  ScrollArea,
  SimpleGrid,
} from "@mantine/core";
import { Icons } from "@/components/icons";
import { useTheme } from "@/providers/theme-provider";
import { notifications } from "@mantine/notifications";
import { formatDistanceToNow, getTaskTypeColor } from "@/lib/utils";
import { useTaskWebSocket } from "@/hooks/use-task-websocket";
import type { Task } from "@/types/task";
import type { TaskProgress, TaskLog } from "@/types/task-websocket";

interface CompactTaskControlProps {
  task: Task;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  isStarting?: boolean;
  isStopping?: boolean;
  isRestarting?: boolean;
}

export function CompactTaskControl({
  task,
  onStart,
  onStop,
  onRestart,
  isStarting = false,
  isStopping = false,
  isRestarting = false,
}: CompactTaskControlProps) {
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("metrics");

  // WebSocket integration
  const {
    state: wsState,
    progress,
    logs,
    clearLogs,
  } = useTaskWebSocket({
    url: `ws://localhost:8080/tasks/${task.id}/stream`,
    taskId: task.id,
  });

  const getStatusColor = () => {
    switch (task.status) {
      case "running": return "blue";
      case "completed": return "green";
      case "failed": return "red";
      case "stopped": return "yellow";
      default: return "gray";
    }
  };

  const formatETA = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getLogIcon = (type: TaskLog["type"]) => {
    switch (type) {
      case "info": return <Icons.InfoCircle size={12} />;
      case "warning": return <Icons.AlertTriangle size={12} />;
      case "error": return <Icons.AlertCircle size={12} />;
      case "success": return <Icons.Check size={12} />;
    }
  };

  const getLogColor = (type: TaskLog["type"]) => {
    switch (type) {
      case "info": return "blue";
      case "warning": return "yellow";
      case "error": return "red";
      case "success": return "green";
    }
  };

  return (
    <Card p="lg" radius="md" withBorder>
      {/* Compact Header */}
      <Group justify="space-between" mb="md">
        <Group>
          <Title order={3}>{task.name}</Title>
          <Badge
            size="lg"
            color={getStatusColor()}
            variant="light"
            leftSection={
              task.status === "running" && wsState === "connected" ? (
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: theme.colors.green[6],
                    animation: "pulse 2s infinite",
                  }}
                />
              ) : null
            }
          >
            {task.status.toUpperCase()}
          </Badge>
          {wsState === "connected" && task.status === "running" && (
            <Badge color="green" variant="dot" size="sm">
              Live
            </Badge>
          )}
        </Group>
        
        <Group gap="xs">
          {task.status === "pending" && (
            <Button
              color="green"
              leftSection={<Icons.PlayerPlay size={16} />}
              onClick={onStart}
              loading={isStarting}
              size="sm"
            >
              Start
            </Button>
          )}
          
          {task.status === "running" && (
            <>
              <Button
                color="yellow"
                variant="outline"
                leftSection={<Icons.Pause size={16} />}
                onClick={onStop}
                loading={isStopping}
                size="sm"
              >
                Pause
              </Button>
              <Button
                color="red"
                leftSection={<Icons.PlayerStop size={16} />}
                onClick={onStop}
                loading={isStopping}
                size="sm"
              >
                Stop
              </Button>
            </>
          )}
          
          {(task.status === "completed" || task.status === "failed" || task.status === "stopped") && (
            <Button
              color="blue"
              leftSection={<Icons.Refresh size={16} />}
              onClick={onRestart}
              loading={isRestarting}
              size="sm"
            >
              Restart
            </Button>
          )}
          
          <ActionIcon
            variant="subtle"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
          >
            {detailsExpanded ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />}
          </ActionIcon>
        </Group>
      </Group>

      {/* Compact Info Row */}
      <Grid gutter="md" mb="md">
        <Grid.Col span={3}>
          <Paper p="sm" radius="md" withBorder>
            <Text size="xs" c="dimmed" mb={4}>Task Type</Text>
            <Badge
              color={getTaskTypeColor(task.resultType || "trafficStatistics")}
              variant="light"
              size="sm"
              fullWidth
            >
              {task.resultType || "Traffic"}
            </Badge>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={3}>
          <Paper p="sm" radius="md" withBorder>
            <Text size="xs" c="dimmed" mb={4}>Duration</Text>
            <Text size="sm" fw={500}>
              {formatDistanceToNow(new Date(task.startedAt || task.createdAt))}
            </Text>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={3}>
          <Paper p="sm" radius="md" withBorder>
            <Text size="xs" c="dimmed" mb={4}>Progress</Text>
            <Group gap={4}>
              <Progress
                value={progress?.progress || task.progress * 100}
                size="sm"
                radius="xl"
                color="blue"
                style={{ flex: 1 }}
              />
              <Text size="xs" fw={500}>
                {Math.round(progress?.progress || task.progress * 100)}%
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={3}>
          <Paper p="sm" radius="md" withBorder>
            <Text size="xs" c="dimmed" mb={4}>
              {progress ? "ETA" : "Recipe"}
            </Text>
            <Text size="sm" fw={500}>
              {progress ? formatETA(progress.eta) : task.recipeId}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Real-time Progress Bar (only when running) */}
      {task.status === "running" && progress && (
        <Box mb="md">
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <Text size="sm" fw={500}>Processing</Text>
              <Text size="xs" c="dimmed">
                Frame {progress.currentFrame} of {progress.totalFrames}
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {progress.fps.toFixed(1)} FPS
              </Text>
              <Text size="xs" c="dimmed">
                {progress.processingSpeed.toFixed(1)}x speed
              </Text>
            </Group>
          </Group>
          <Progress
            value={progress.progress}
            size="md"
            radius="xl"
            color="blue"
            animated
          />
        </Box>
      )}

      {/* Expandable Details */}
      <Collapse in={detailsExpanded}>
        <Divider mb="md" />
        
        {task.status === "running" && progress ? (
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="metrics" leftSection={<Icons.ChartBar size={14} />}>
                Metrics
              </Tabs.Tab>
              <Tabs.Tab value="detections" leftSection={<Icons.Target size={14} />}>
                Detections
              </Tabs.Tab>
              <Tabs.Tab value="logs" leftSection={<Icons.Terminal size={14} />}>
                Logs ({logs.length})
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="metrics" pt="md">
              <SimpleGrid cols={3} spacing="sm">
                <Paper p="sm" radius="md" withBorder>
                  <Text size="xs" c="dimmed" mb={4}>CPU Usage</Text>
                  <Group>
                    <RingProgress
                      size={50}
                      thickness={6}
                      sections={[{ value: progress.cpuUsage, color: "blue" }]}
                      label={
                        <Text size="xs" fw={700} ta="center">
                          {Math.round(progress.cpuUsage)}%
                        </Text>
                      }
                    />
                  </Group>
                </Paper>
                
                <Paper p="sm" radius="md" withBorder>
                  <Text size="xs" c="dimmed" mb={4}>Memory</Text>
                  <Group>
                    <RingProgress
                      size={50}
                      thickness={6}
                      sections={[{ value: progress.memoryUsage, color: "green" }]}
                      label={
                        <Text size="xs" fw={700} ta="center">
                          {Math.round(progress.memoryUsage)}%
                        </Text>
                      }
                    />
                  </Group>
                </Paper>
                
                <Paper p="sm" radius="md" withBorder>
                  <Text size="xs" c="dimmed" mb={4}>GPU Usage</Text>
                  <Group>
                    <RingProgress
                      size={50}
                      thickness={6}
                      sections={[{ value: progress.gpuUsage, color: "orange" }]}
                      label={
                        <Text size="xs" fw={700} ta="center">
                          {Math.round(progress.gpuUsage)}%
                        </Text>
                      }
                    />
                  </Group>
                </Paper>
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="detections" pt="md">
              <SimpleGrid cols={2} spacing="xs">
                {Object.entries(progress.detections).map(([type, count]) => (
                  <Paper key={type} p="sm" radius="md" withBorder>
                    <Group justify="space-between">
                      <Text size="sm" tt="capitalize">{type}</Text>
                      <Badge variant="light" size="sm">{count}</Badge>
                    </Group>
                  </Paper>
                ))}
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="logs" pt="md">
              <Group justify="space-between" mb="sm">
                <Text size="sm" fw={500}>Activity Log</Text>
                <ActionIcon size="sm" variant="subtle" onClick={clearLogs}>
                  <Icons.Trash size={14} />
                </ActionIcon>
              </Group>
              
              <ScrollArea h={200}>
                <Timeline
                  active={-1}
                  bulletSize={16}
                  lineWidth={1}
                >
                  {logs.slice(0, 20).map((log) => (
                    <Timeline.Item
                      key={log.id}
                      bullet={getLogIcon(log.type)}
                      color={getLogColor(log.type)}
                      title={
                        <Text size="xs" fw={500}>{log.message}</Text>
                      }
                    >
                      <Text size="xs" c="dimmed">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>
        ) : (
          // Static information for non-running tasks
          <Stack gap="sm">
            <Group>
              <Text size="sm" fw={500}>Description:</Text>
              <Text size="sm" c="dimmed">
                {task.description || "No description provided"}
              </Text>
            </Group>
            
            {task.error && (
              <Group>
                <Text size="sm" fw={500} c="red">Error:</Text>
                <Text size="sm" c="red">{task.error}</Text>
              </Group>
            )}
            
            <Group>
              <Text size="sm" fw={500}>Created:</Text>
              <Text size="sm" c="dimmed">
                {new Date(task.createdAt).toLocaleString()}
              </Text>
            </Group>
            
            {task.startedAt && (
              <Group>
                <Text size="sm" fw={500}>Started:</Text>
                <Text size="sm" c="dimmed">
                  {new Date(task.startedAt).toLocaleString()}
                </Text>
              </Group>
            )}
            
            {task.completedAt && (
              <Group>
                <Text size="sm" fw={500}>Completed:</Text>
                <Text size="sm" c="dimmed">
                  {new Date(task.completedAt).toLocaleString()}
                </Text>
              </Group>
            )}
          </Stack>
        )}
      </Collapse>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Card>
  );
}