import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Progress,
  RingProgress,
  Stack,
  Text,
  Timeline,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect,useState } from "react";

import { Icons } from "@/components/icons";
import { formatDistanceToNow } from "@/lib/utils";
import type { Task } from "@/types/task";
import type { TaskLog,TaskProgress } from "@/types/task-websocket";

interface TaskControlPanelProps {
  task: Task;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  isStarting?: boolean;
  isStopping?: boolean;
  isRestarting?: boolean;
}

// Mock WebSocket data generator
const generateMockProgress = (currentProgress: number): TaskProgress => {
  const newProgress = Math.min(currentProgress + (Math.random() * 2), 100);
  return {
    cpuUsage: 45 + Math.random() * 25,
    currentFrame: Math.floor(newProgress * 100),
    detections: {
      bus: Math.floor(Math.random() * 100) + 20,
      car: Math.floor(Math.random() * 500) + 100,
      person: Math.floor(Math.random() * 300) + 50,
      truck: Math.floor(Math.random() * 200) + 50,
    },
    eta: Math.floor((100 - newProgress) * 10),
    fps: 24 + Math.random() * 6,
    gpuUsage: 70 + Math.random() * 20, 
    memoryUsage: 60 + Math.random() * 20,
    
// seconds
processingSpeed: 1.2 + Math.random() * 0.3,
    

progress: newProgress,
    

taskId: "task-123",
    
timestamp: new Date().toISOString(),
    totalFrames: 10000,
  };
};

const generateMockLog = (): TaskLog => {
  const logTypes = ["info", "warning", "error", "success"];
  const messages = [
    "Processing frame batch...",
    "Object detection completed",
    "Saving checkpoint...",
    "Region analysis in progress",
    "Traffic flow calculated",
    "Model inference running",
    "Buffer cleared",
    "Connection stable",
  ];
  
  return {
    details: Math.random() > 0.7 ? {
      frame: Math.floor(Math.random() * 10000),
      objects: Math.floor(Math.random() * 20),
    } : undefined,
    id: Math.random().toString(36).substr(2, 9),
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date().toISOString(),
    type: logTypes[Math.floor(Math.random() * logTypes.length)] as TaskLog["type"],
  };
};

export function TaskControlPanel({
  task,
  onStart,
  onStop,
  onRestart,
  isStarting = false,
  isStopping = false,
  isRestarting = false,
}: TaskControlPanelProps) {
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  const [wsConnected, setWsConnected] = useState(false);
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Simulate WebSocket connection and data stream
  useEffect(() => {
    if (task.status === "running") {
      // Simulate connection
      const connectTimeout = setTimeout(() => {
        setWsConnected(true);
        notifications.show({
          color: "green",
          icon: <Icons.Wifi size={16} />,
          message: "Real-time updates enabled",
          title: "WebSocket Connected",
        });
      }, 1000);

      // Initialize progress
      let currentProgress = task.progress * 100;
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (currentProgress < 100) {
          const newProgress = generateMockProgress(currentProgress);
          setProgress(newProgress);
          currentProgress = newProgress.progress;
        }
      }, 1000);

      // Simulate log updates
      const logInterval = setInterval(() => {
        const newLog = generateMockLog();
        setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
      }, 2000 + Math.random() * 3000);

      return () => {
        clearTimeout(connectTimeout);
        clearInterval(progressInterval);
        clearInterval(logInterval);
        setWsConnected(false);
        setProgress(null);
        setLogs([]);
      };
    }
  }, [task.status, task.progress]);

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

  const getStatusColor = () => {
    switch (task.status) {
      case "running": return "blue";
      case "completed": return "green";
      case "failed": return "red";
      case "stopped": return "yellow";
      default: return "gray";
    }
  };

  const getLogIcon = (type: TaskLog["type"]) => {
    switch (type) {
      case "info": return <Icons.InfoCircle size={14} />;
      case "warning": return <Icons.AlertTriangle size={14} />;
      case "error": return <Icons.AlertCircle size={14} />;
      case "success": return <Icons.Check size={14} />;
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
    <Stack gap="lg">
      {/* Control Actions */}
      <Card p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <Title order={4}>Task Control</Title>
            {wsConnected && task.status === "running" && (
              <Badge
                color="green"
                variant="dot"
                size="sm"
                leftSection={<Icons.Wifi size={12} />}
              >
                Live
              </Badge>
            )}
          </Group>
          
          <Group>
            {task.status === "pending" && (
              <Button
                color="green"
                leftSection={<Icons.PlayerPlay size={16} />}
                onClick={onStart}
                loading={isStarting}
                disabled={isStarting}
              >
                Start Task
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
                  disabled={isStopping}
                >
                  Pause
                </Button>
                <Button
                  color="red"
                  leftSection={<Icons.PlayerStop size={16} />}
                  onClick={onStop}
                  loading={isStopping}
                  disabled={isStopping}
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
                disabled={isRestarting}
              >
                Restart
              </Button>
            )}
          </Group>
        </Group>

        {/* Task Status Overview */}
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: isDark ? theme.colors.dark?.[6] || theme.colors.gray[7] : theme.colors.gray[0],
          }}
        >
          <Group justify="space-between" align="center">
            <Group>
              <Badge
                size="lg"
                color={getStatusColor()}
                variant="light"
                leftSection={
                  task.status === "running" ? (
                    <Loader size={12} color={getStatusColor()} />
                  ) : null
                }
              >
                {task.status.toUpperCase()}
              </Badge>
              <Text size="sm" c="dimmed">
                Started {formatDistanceToNow(new Date(task.startedAt || task.createdAt))} ago
              </Text>
            </Group>
            
            {progress && task.status === "running" && (
              <Group gap="xs">
                <Text size="sm" fw={500}>ETA:</Text>
                <Text size="sm">{formatETA(progress.eta)}</Text>
              </Group>
            )}
          </Group>
        </Paper>
      </Card>

      {/* Progress & Metrics */}
      {task.status === "running" && progress && (
        <Card p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Processing Progress</Title>
            <ActionIcon
              variant="subtle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />}
            </ActionIcon>
          </Group>
          
          {isExpanded && (
            <>
              {/* Main Progress Bar */}
              <Box mb="xl">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>Overall Progress</Text>
                  <Text size="sm" fw={500}>{progress.progress.toFixed(1)}%</Text>
                </Group>
                <Progress
                  value={progress.progress}
                  size="xl"
                  radius="xl"
                  color="blue"
                  animated
                />
                <Group justify="space-between" mt="xs">
                  <Text size="xs" c="dimmed">
                    Frame {progress.currentFrame} of {progress.totalFrames}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {progress.fps.toFixed(1)} FPS • {progress.processingSpeed.toFixed(1)}x speed
                  </Text>
                </Group>
              </Box>

              <Divider mb="md" />

              {/* Resource Usage */}
              <Grid gutter="md" mb="md">
                <Grid.Col span={4}>
                  <Paper p="sm" radius="md" withBorder>
                    <Text size="xs" c="dimmed" mb={4}>CPU Usage</Text>
                    <Center>
                      <RingProgress
                        size={80}
                        thickness={8}
                        sections={[{ color: "blue", value: progress.cpuUsage }]}
                        label={
                          <Text size="sm" fw={700} ta="center">
                            {Math.round(progress.cpuUsage)}%
                          </Text>
                        }
                      />
                    </Center>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Paper p="sm" radius="md" withBorder>
                    <Text size="xs" c="dimmed" mb={4}>Memory</Text>
                    <Center>
                      <RingProgress
                        size={80}
                        thickness={8}
                        sections={[{ color: "green", value: progress.memoryUsage }]}
                        label={
                          <Text size="sm" fw={700} ta="center">
                            {Math.round(progress.memoryUsage)}%
                          </Text>
                        }
                      />
                    </Center>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Paper p="sm" radius="md" withBorder>
                    <Text size="xs" c="dimmed" mb={4}>GPU Usage</Text>
                    <Center>
                      <RingProgress
                        size={80}
                        thickness={8}
                        sections={[{ color: "orange", value: progress.gpuUsage }]}
                        label={
                          <Text size="sm" fw={700} ta="center">
                            {Math.round(progress.gpuUsage)}%
                          </Text>
                        }
                      />
                    </Center>
                  </Paper>
                </Grid.Col>
              </Grid>

              {/* Detection Counts */}
              <Paper p="md" radius="md" withBorder>
                <Text size="sm" fw={500} mb="sm">Objects Detected</Text>
                <Grid gutter="xs">
                  {Object.entries(progress.detections).map(([type, count]) => (
                    <Grid.Col span={6} key={type}>
                      <Group justify="space-between">
                        <Text size="sm" tt="capitalize">{type}:</Text>
                        <Badge variant="light">{count}</Badge>
                      </Group>
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>
            </>
          )}
        </Card>
      )}

      {/* Activity Logs */}
      {task.status === "running" && logs.length > 0 && (
        <Card p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Activity Log</Title>
            <Tooltip label="Clear logs">
              <ActionIcon
                variant="subtle"
                onClick={() => setLogs([])}
              >
                <Icons.Trash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          
          <Paper
            p="sm"
            radius="md"
            style={{
              backgroundColor: isDark ? theme.colors.dark?.[7] || theme.colors.gray[8] : theme.colors.gray[0],
              maxHeight: 300,
              overflow: "auto",
            }}
          >
            <Timeline
              active={-1}
              bulletSize={20}
              lineWidth={2}
            >
              {logs.slice(0, 10).map((log) => (
                <Timeline.Item
                  key={log.id}
                  bullet={getLogIcon(log.type)}
                  color={getLogColor(log.type)}
                  title={
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{log.message}</Text>
                      {log.details && (
                        <Badge size="xs" variant="light">
                          Frame {log.details.frame as number}
                        </Badge>
                      )}
                    </Group>
                  }
                >
                  <Text size="xs" c="dimmed">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Paper>
        </Card>
      )}

      {/* Error State */}
      {task.status === "failed" && task.error && (
        <Alert
          icon={<Icons.AlertCircle size={16} />}
          title="Task Failed"
          color="red"
          variant="light"
        >
          {task.error}
        </Alert>
      )}
    </Stack>
  );
}