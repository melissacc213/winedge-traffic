import { useState, useEffect, useCallback, useRef } from "react";
import { notifications } from "@mantine/notifications";
import type {
  TaskWebSocketEvent,
  TaskProgress,
  TaskLog,
  TaskStreamFrame,
  WebSocketState,
  TaskWebSocketConfig,
} from "@/types/task-websocket";

interface UseTaskWebSocketReturn {
  state: WebSocketState;
  progress: TaskProgress | null;
  logs: TaskLog[];
  latestFrame: TaskStreamFrame | null;
  connect: () => void;
  disconnect: () => void;
  clearLogs: () => void;
}

// Mock WebSocket implementation for development
class MockWebSocket {
  private listeners: Map<string, Set<Function>> = new Map();
  private intervalId?: NodeJS.Timeout;
  private currentProgress = 0;

  constructor(private taskId: string) {
    setTimeout(() => {
      this.emit("open", {});
      this.startMockDataStream();
    }, 1000);
  }

  addEventListener(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  removeEventListener(event: string, handler: Function) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }

  private startMockDataStream() {
    // Send progress updates every second
    this.intervalId = setInterval(() => {
      this.currentProgress = Math.min(this.currentProgress + Math.random() * 2, 100);
      
      const progressEvent: TaskWebSocketEvent = {
        type: "progress",
        data: {
          taskId: this.taskId,
          progress: this.currentProgress,
          currentFrame: Math.floor(this.currentProgress * 100),
          totalFrames: 10000,
          fps: 24 + Math.random() * 6,
          eta: Math.floor((100 - this.currentProgress) * 10),
          processingSpeed: 1.2 + Math.random() * 0.3,
          cpuUsage: 45 + Math.random() * 25,
          memoryUsage: 60 + Math.random() * 20,
          gpuUsage: 70 + Math.random() * 20,
          detections: {
            car: Math.floor(Math.random() * 500) + 100,
            truck: Math.floor(Math.random() * 200) + 50,
            bus: Math.floor(Math.random() * 100) + 20,
            person: Math.floor(Math.random() * 300) + 50,
          },
          timestamp: new Date().toISOString(),
        },
      };

      this.emit("message", { data: JSON.stringify(progressEvent) });

      // Send log updates occasionally
      if (Math.random() > 0.7) {
        const logTypes = ["info", "warning", "error", "success"] as const;
        const messages = [
          "Processing frame batch...",
          "Object detection completed",
          "Saving checkpoint...",
          "Region analysis in progress",
          "Traffic flow calculated",
        ];

        const logEvent: TaskWebSocketEvent = {
          type: "log",
          data: {
            id: Math.random().toString(36).substr(2, 9),
            type: logTypes[Math.floor(Math.random() * logTypes.length)],
            message: messages[Math.floor(Math.random() * messages.length)],
            timestamp: new Date().toISOString(),
          },
        };

        this.emit("message", { data: JSON.stringify(logEvent) });
      }

      // Complete when progress reaches 100
      if (this.currentProgress >= 100) {
        this.close();
      }
    }, 1000);
  }

  close() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    const completeEvent: TaskWebSocketEvent = {
      type: "complete",
      taskId: this.taskId,
      summary: {
        totalFramesProcessed: 10000,
        totalObjectsDetected: 4523,
        processingTime: 420,
        averageFps: 23.8,
        detectionsByType: {
          car: 2341,
          truck: 892,
          bus: 423,
          person: 867,
        },
        peakMemoryUsage: 82,
        peakCpuUsage: 76,
      },
    };

    this.emit("message", { data: JSON.stringify(completeEvent) });
    this.emit("close", {});
  }

  send(data: string) {
    console.log("MockWebSocket send:", data);
  }
}

export function useTaskWebSocket(config: TaskWebSocketConfig): UseTaskWebSocketReturn {
  const [state, setState] = useState<WebSocketState>("disconnected");
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [latestFrame, setLatestFrame] = useState<TaskStreamFrame | null>(null);
  
  const wsRef = useRef<WebSocket | MockWebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: TaskWebSocketEvent = JSON.parse(event.data);

      switch (data.type) {
        case "connected":
          setState("connected");
          notifications.show({
            title: "Connected",
            message: "Real-time updates enabled",
            color: "green",
          });
          break;

        case "progress":
          setProgress(data.data);
          break;

        case "log":
          setLogs(prev => [data.data, ...prev].slice(0, 100)); // Keep last 100 logs
          break;

        case "frame":
          setLatestFrame(data.data);
          break;

        case "error":
          notifications.show({
            title: "WebSocket Error",
            message: data.error,
            color: "red",
          });
          break;

        case "complete":
          // Task completion - no notification needed
          break;
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState("connecting");

    // Use real WebSocket if URL is provided, otherwise use mock
    const useRealWebSocket = config.url && config.url.startsWith('ws');
    const WebSocketClass = useRealWebSocket ? WebSocket : MockWebSocket;
    const wsUrl = useRealWebSocket ? config.url : config.taskId;
    
    const ws = new WebSocketClass(wsUrl) as any;
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      setState("connected");
      reconnectAttemptsRef.current = 0;
      
      // Send initial handshake
      if (ws instanceof WebSocket) {
        ws.send(JSON.stringify({ type: "subscribe", taskId: config.taskId }));
      }
    });

    ws.addEventListener("message", handleMessage);

    ws.addEventListener("error", (error: Event) => {
      setState("error");
      console.error("WebSocket error:", error);
    });

    ws.addEventListener("close", () => {
      setState("disconnected");
      wsRef.current = null;

      // Attempt reconnection
      if (
        reconnectAttemptsRef.current < (config.reconnectAttempts || 3)
      ) {
        reconnectAttemptsRef.current++;
        const delay = (config.reconnectDelay || 5000) * reconnectAttemptsRef.current;
        
        notifications.show({
          title: "Connection Lost",
          message: `Reconnecting in ${delay / 1000} seconds...`,
          color: "yellow",
        });

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    });
  }, [config, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setState("disconnected");
    setProgress(null);
    setLogs([]);
    setLatestFrame(null);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Auto-connect when config changes
  useEffect(() => {
    if (config.taskId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [config.taskId]); // Only reconnect if taskId changes

  return {
    state,
    progress,
    logs,
    latestFrame,
    connect,
    disconnect,
    clearLogs,
  };
}