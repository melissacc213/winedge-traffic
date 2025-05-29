/**
 * Simple WebSocket Server for Testing
 * 
 * To run this server:
 * 1. npm install ws express cors
 * 2. node websocket-server-example.js
 * 3. Update your React app to connect to ws://localhost:8080
 */

const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT + 1 }); // WebSocket on 8081

// Store active connections and task states
const connections = new Map(); // taskId -> Set of WebSocket connections
const taskStates = new Map(); // taskId -> task state

console.log(`🚀 WebSocket server running on port ${PORT + 1}`);
console.log(`📡 HTTP server running on port ${PORT}`);

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'subscribe' && data.taskId) {
        // Subscribe to task updates
        if (!connections.has(data.taskId)) {
          connections.set(data.taskId, new Set());
        }
        connections.get(data.taskId).add(ws);
        
        console.log(`Client subscribed to task: ${data.taskId}`);
        
        // Send connection confirmation
        ws.send(JSON.stringify({
          type: 'connected',
          taskId: data.taskId,
          timestamp: new Date().toISOString()
        }));
        
        // Start sending mock data if task is running
        const taskState = taskStates.get(data.taskId);
        if (taskState?.status === 'running') {
          startMockDataStream(data.taskId);
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // Remove connection from all task subscriptions
    connections.forEach((wsSet, taskId) => {
      wsSet.delete(ws);
      if (wsSet.size === 0) {
        connections.delete(taskId);
      }
    });
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Mock data generation
function generateMockProgress(taskId, currentProgress = 0) {
  const increment = Math.random() * 3 + 0.5; // 0.5% to 3.5% increment
  const newProgress = Math.min(currentProgress + increment, 100);
  
  return {
    taskId,
    progress: newProgress,
    currentFrame: Math.floor(newProgress * 100),
    totalFrames: 10000,
    fps: 20 + Math.random() * 10,
    eta: Math.floor((100 - newProgress) * 8),
    processingSpeed: 0.8 + Math.random() * 0.8,
    cpuUsage: 40 + Math.random() * 40,
    memoryUsage: 50 + Math.random() * 30,
    gpuUsage: 60 + Math.random() * 30,
    detections: {
      car: Math.floor(newProgress * 50) + Math.floor(Math.random() * 100),
      truck: Math.floor(newProgress * 20) + Math.floor(Math.random() * 50),
      bus: Math.floor(newProgress * 5) + Math.floor(Math.random() * 20),
      person: Math.floor(newProgress * 15) + Math.floor(Math.random() * 30),
      motorcycle: Math.floor(newProgress * 8) + Math.floor(Math.random() * 15),
    },
    timestamp: new Date().toISOString(),
  };
}

function generateMockLog(taskId) {
  const logTypes = ['info', 'warning', 'error', 'success'];
  const messages = [
    'Processing frame batch...',
    'Object detection completed',
    'Saving checkpoint...',
    'Region analysis in progress',
    'Traffic flow calculated',
    'Model inference running',
    'Buffer cleared successfully',
    'Connection health check passed',
  ];

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type: logTypes[Math.floor(Math.random() * logTypes.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date().toISOString(),
    details: Math.random() > 0.6 ? {
      frame: Math.floor(Math.random() * 10000),
      confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
      objects: Math.floor(Math.random() * 50),
    } : undefined,
  };
}

// Broadcast message to all connections for a specific task
function broadcast(taskId, message) {
  const taskConnections = connections.get(taskId);
  if (taskConnections) {
    const messageStr = JSON.stringify(message);
    taskConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}

// Mock data streaming for running tasks
const activeStreams = new Map(); // taskId -> interval

function startMockDataStream(taskId) {
  if (activeStreams.has(taskId)) {
    return; // Already streaming
  }

  console.log(`Starting mock data stream for task: ${taskId}`);
  
  let currentProgress = 0;
  
  const progressInterval = setInterval(() => {
    if (currentProgress >= 100) {
      // Task completed
      broadcast(taskId, {
        type: 'complete',
        taskId,
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
      });
      
      // Update task state
      const taskState = taskStates.get(taskId);
      if (taskState) {
        taskState.status = 'completed';
        taskState.progress = 1.0;
      }
      
      stopMockDataStream(taskId);
      return;
    }

    // Send progress update
    const progressData = generateMockProgress(taskId, currentProgress);
    currentProgress = progressData.progress;
    
    broadcast(taskId, {
      type: 'progress',
      data: progressData,
    });

    // Update task state
    const taskState = taskStates.get(taskId);
    if (taskState) {
      taskState.progress = currentProgress / 100;
    }
  }, 1000);

  const logInterval = setInterval(() => {
    broadcast(taskId, {
      type: 'log',
      data: generateMockLog(taskId),
    });
  }, 2000 + Math.random() * 3000);

  activeStreams.set(taskId, { progressInterval, logInterval });
}

function stopMockDataStream(taskId) {
  const intervals = activeStreams.get(taskId);
  if (intervals) {
    clearInterval(intervals.progressInterval);
    clearInterval(intervals.logInterval);
    activeStreams.delete(taskId);
    console.log(`Stopped mock data stream for task: ${taskId}`);
  }
}

// REST API endpoints
app.get('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  
  // Return mock task data
  const mockTask = {
    id: taskId,
    name: `Traffic Analysis Task ${taskId}`,
    description: 'Real-time traffic monitoring and analysis',
    recipeId: 'recipe-456',
    status: taskStates.get(taskId)?.status || 'pending',
    progress: taskStates.get(taskId)?.progress || 0,
    resultType: 'trafficStatistics',
    priority: 'high',
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    startedAt: taskStates.get(taskId)?.status !== 'pending' ? new Date().toISOString() : undefined,
  };
  
  res.json(mockTask);
});

app.post('/api/tasks/:id/start', (req, res) => {
  const taskId = req.params.id;
  
  // Update task state
  taskStates.set(taskId, {
    status: 'running',
    progress: 0,
    startedAt: new Date().toISOString(),
  });
  
  // Start mock data stream
  startMockDataStream(taskId);
  
  console.log(`Started task: ${taskId}`);
  
  res.json({
    success: true,
    message: 'Task started successfully',
    taskId,
  });
});

app.post('/api/tasks/:id/stop', (req, res) => {
  const taskId = req.params.id;
  
  // Update task state
  const taskState = taskStates.get(taskId);
  if (taskState) {
    taskState.status = 'stopped';
  }
  
  // Stop mock data stream
  stopMockDataStream(taskId);
  
  // Notify clients
  broadcast(taskId, {
    type: 'disconnected',
    taskId,
    reason: 'Task stopped by user',
  });
  
  console.log(`Stopped task: ${taskId}`);
  
  res.json({
    success: true,
    message: 'Task stopped successfully',
    taskId,
  });
});

app.post('/api/tasks/:id/restart', (req, res) => {
  const taskId = req.params.id;
  
  // Stop existing stream
  stopMockDataStream(taskId);
  
  // Reset task state
  taskStates.set(taskId, {
    status: 'running',
    progress: 0,
    startedAt: new Date().toISOString(),
  });
  
  // Start fresh stream
  startMockDataStream(taskId);
  
  console.log(`Restarted task: ${taskId}`);
  
  res.json({
    success: true,
    message: 'Task restarted successfully',
    taskId,
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: connections.size,
    activeTasks: taskStates.size,
  });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`
🎯 Mock WebSocket Server Ready!

To use with your React app:
1. Update your WebSocket URL to: ws://localhost:${PORT + 1}
2. Update your API URL to: http://localhost:${PORT}

Available endpoints:
- GET  /api/tasks/:id        - Get task details
- POST /api/tasks/:id/start  - Start a task
- POST /api/tasks/:id/stop   - Stop a task  
- POST /api/tasks/:id/restart - Restart a task
- GET  /health               - Health check

WebSocket endpoint: ws://localhost:${PORT + 1}

Test with curl:
curl http://localhost:${PORT}/api/tasks/test-123
curl -X POST http://localhost:${PORT}/api/tasks/test-123/start
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  activeStreams.forEach((intervals, taskId) => {
    stopMockDataStream(taskId);
  });
  wss.close();
  process.exit(0);
});