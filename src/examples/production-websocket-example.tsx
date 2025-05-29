/**
 * Production WebSocket Example
 * 
 * This file demonstrates how to implement the task control system
 * with a real WebSocket server for production use.
 */

import { useState, useEffect } from "react";
import { CompactTaskControl } from "@/components/task-control";
import { useTaskWebSocket } from "@/hooks/use-task-websocket";
import { notifications } from "@mantine/notifications";
import type { Task } from "@/types/task";

// Example configuration for production
const WEBSOCKET_CONFIG = {
  baseUrl: process.env.REACT_APP_WS_URL || "ws://localhost:8080",
  endpoints: {
    taskStream: (taskId: string) => `${WEBSOCKET_CONFIG.baseUrl}/tasks/${taskId}/stream`,
    taskControl: (taskId: string) => `${WEBSOCKET_CONFIG.baseUrl}/tasks/${taskId}/control`,
  },
  auth: {
    token: localStorage.getItem("authToken"),
  },
};

interface ProductionTaskControlProps {
  taskId: string;
}

export function ProductionTaskControl({ taskId }: ProductionTaskControlProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // WebSocket connection for real-time updates
  const {
    state: wsState,
    progress,
    logs,
    connect,
    disconnect,
  } = useTaskWebSocket({
    url: WEBSOCKET_CONFIG.endpoints.taskStream(taskId),
    taskId,
    reconnectAttempts: 3,
    reconnectDelay: 5000,
  });

  // Fetch initial task data
  useEffect(() => {
    fetchTaskData();
  }, [taskId]);

  // Connect to WebSocket when task starts running
  useEffect(() => {
    if (task?.status === "running") {
      connect();
    } else {
      disconnect();
    }
  }, [task?.status, connect, disconnect]);

  const fetchTaskData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${WEBSOCKET_CONFIG.auth.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const taskData = await response.json();
      setTask(taskData);
    } catch (error) {
      console.error("Failed to fetch task:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load task data",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WEBSOCKET_CONFIG.auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to start task");
      }

      const updatedTask = await response.json();
      setTask(updatedTask);

      notifications.show({
        title: "Task Started",
        message: "Task is now running",
        color: "green",
      });
    } catch (error) {
      console.error("Start task error:", error);
      notifications.show({
        title: "Start Failed",
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
      });
    }
  };

  const handleStopTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WEBSOCKET_CONFIG.auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to stop task");
      }

      const updatedTask = await response.json();
      setTask(updatedTask);

      notifications.show({
        title: "Task Stopped",
        message: "Task has been stopped",
        color: "yellow",
      });
    } catch (error) {
      console.error("Stop task error:", error);
      notifications.show({
        title: "Stop Failed",
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
      });
    }
  };

  const handleRestartTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/restart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WEBSOCKET_CONFIG.auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to restart task");
      }

      const updatedTask = await response.json();
      setTask(updatedTask);

      notifications.show({
        title: "Task Restarted",
        message: "Task has been restarted",
        color: "blue",
      });
    } catch (error) {
      console.error("Restart task error:", error);
      notifications.show({
        title: "Restart Failed",
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
      });
    }
  };

  if (isLoading) {
    return <div>Loading task...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <CompactTaskControl
      task={task}
      onStart={handleStartTask}
      onStop={handleStopTask}
      onRestart={handleRestartTask}
    />
  );
}

/**
 * Server-side WebSocket implementation example (Node.js/Express)
 * 
 * npm install ws express
 * 
 * const WebSocket = require('ws');
 * const express = require('express');
 * const app = express();
 * 
 * const wss = new WebSocket.Server({ port: 8080 });
 * 
 * // Store active connections by task ID
 * const connections = new Map();
 * 
 * wss.on('connection', (ws, req) => {
 *   const taskId = extractTaskIdFromUrl(req.url);
 *   
 *   if (!connections.has(taskId)) {
 *     connections.set(taskId, new Set());
 *   }
 *   connections.get(taskId).add(ws);
 * 
 *   ws.on('message', (message) => {
 *     const data = JSON.parse(message);
 *     if (data.type === 'subscribe') {
 *       // Handle subscription
 *       ws.send(JSON.stringify({
 *         type: 'connected',
 *         taskId: data.taskId
 *       }));
 *     }
 *   });
 * 
 *   ws.on('close', () => {
 *     connections.get(taskId)?.delete(ws);
 *   });
 * });
 * 
 * // Broadcast progress updates
 * function broadcastProgress(taskId, progressData) {
 *   const taskConnections = connections.get(taskId);
 *   if (taskConnections) {
 *     const message = JSON.stringify({
 *       type: 'progress',
 *       data: progressData
 *     });
 *     
 *     taskConnections.forEach(ws => {
 *       if (ws.readyState === WebSocket.OPEN) {
 *         ws.send(message);
 *       }
 *     });
 *   }
 * }
 * 
 * // Example REST endpoints
 * app.post('/api/tasks/:id/start', async (req, res) => {
 *   const taskId = req.params.id;
 *   try {
 *     await startTaskProcessing(taskId);
 *     res.json({ success: true });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * app.post('/api/tasks/:id/stop', async (req, res) => {
 *   const taskId = req.params.id;
 *   try {
 *     await stopTaskProcessing(taskId);
 *     res.json({ success: true });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 */

/**
 * Docker setup for development
 * 
 * Create docker-compose.yml:
 * 
 * version: '3.8'
 * services:
 *   websocket-server:
 *     build: ./server
 *     ports:
 *       - "8080:8080"
 *     environment:
 *       - NODE_ENV=development
 *     volumes:
 *       - ./server:/app
 *       - /app/node_modules
 * 
 *   frontend:
 *     build: ./frontend
 *     ports:
 *       - "3000:3000"
 *     environment:
 *       - REACT_APP_WS_URL=ws://localhost:8080
 *     volumes:
 *       - .:/app
 *       - /app/node_modules
 *     depends_on:
 *       - websocket-server
 */

/**
 * Environment variables for production
 * 
 * .env.production:
 * REACT_APP_WS_URL=wss://your-domain.com
 * REACT_APP_API_URL=https://api.your-domain.com
 * 
 * .env.development:
 * REACT_APP_WS_URL=ws://localhost:8080
 * REACT_APP_API_URL=http://localhost:3001
 */