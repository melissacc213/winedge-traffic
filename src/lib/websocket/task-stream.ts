import { useState, useEffect, useCallback } from 'react';

interface UseTaskStreamOptions {
  url?: string;
  autoConnect?: boolean;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

export function useTaskStream({
  url,
  autoConnect = true,
  onMessage,
  onError,
  onClose
}: UseTaskStreamOptions) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<Event | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!url) return;
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        onMessage?.(data);
      } catch (e) {
        // If data is not JSON (e.g., binary stream), handle it directly
        setLastMessage(event.data);
        onMessage?.(event.data);
      }
    };
    
    ws.onerror = (e) => {
      setError(e);
      onError?.(e);
    };
    
    ws.onclose = (event) => {
      setIsConnected(false);
      onClose?.(event);
    };
    
    setSocket(ws);
    
    // Cleanup function
    return () => {
      ws.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [url, onMessage, onError, onClose]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Send message to WebSocket
  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (socket && isConnected) {
      socket.send(data);
    }
  }, [socket, isConnected]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      const cleanup = connect();
      return cleanup;
    }
  }, [autoConnect, connect]);

  // Reconnect when URL changes
  useEffect(() => {
    if (socket && url && socket.url !== url) {
      disconnect();
      connect();
    }
  }, [url, socket, disconnect, connect]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    send
  };
}

// Mock WebSocket implementation for development
export class MockWebSocket {
  private static FRAME_INTERVAL = 200; // milliseconds between frame updates
  private interval: NodeJS.Timeout | null = null;
  private frameCount = 0;
  private taskId: string;
  private listeners: Record<string, Array<(event: any) => void>> = {
    open: [],
    message: [],
    error: [],
    close: []
  };
  
  url: string;

  constructor(url: string) {
    this.url = url;
    this.taskId = url.split('/').pop() || '';
    
    // Simulate connection delay
    setTimeout(() => {
      this.dispatchEvent('open', {});
      this.startStreaming();
    }, 500);
  }

  addEventListener(type: string, callback: (event: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type].push(callback);
    }
  }

  removeEventListener(type: string, callback: (event: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }

  dispatchEvent(type: string, event: any) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(callback => callback(event));
    }
  }

  set onopen(callback: (event: any) => void) {
    this.listeners.open = [callback];
  }

  set onmessage(callback: (event: any) => void) {
    this.listeners.message = [callback];
  }

  set onerror(callback: (event: any) => void) {
    this.listeners.error = [callback];
  }

  set onclose(callback: (event: any) => void) {
    this.listeners.close = [callback];
  }

  send(data: any) {
    // Mock send - you can add logic to simulate responses here
    console.log('Mock WebSocket sent data:', data);
  }

  close() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.dispatchEvent('close', { code: 1000, reason: 'Normal closure', wasClean: true });
  }

  private startStreaming() {
    // Simulate streaming updates
    this.interval = setInterval(() => {
      this.frameCount++;
      
      // Status update (lower frequency)
      if (this.frameCount % 5 === 0) {
        const progress = Math.min(100, Math.floor(this.frameCount / 3));
        const status = progress >= 100 ? 'completed' : 'running';
        
        const statusUpdate = {
          type: 'status',
          taskId: this.taskId,
          progress,
          status,
          metrics: {
            objectsCounted: this.frameCount * 5,
            detectionRate: 0.92 + (Math.random() * 0.06),
            processingFps: 24 + (Math.random() * 3 - 1.5),
            totalObjects: {
              car: Math.floor(this.frameCount * 3.5),
              truck: Math.floor(this.frameCount * 0.8),
              bus: Math.floor(this.frameCount * 0.2),
              motorcycle: Math.floor(this.frameCount * 1.2)
            }
          }
        };
        
        this.dispatchEvent('message', { data: JSON.stringify(statusUpdate) });
      }
      
      // Frame update (for binary stream this would be the video frame)
      // For the sake of mock implementation, we'll just send a placeholder
      this.dispatchEvent('message', { 
        data: JSON.stringify({
          type: 'frame',
          frameId: this.frameCount,
          timestamp: Date.now()
        })
      });
      
      // Auto-complete after 100 frames
      if (this.frameCount >= 300) {
        clearInterval(this.interval);
        this.interval = null;
        
        // Send completion message
        this.dispatchEvent('message', { 
          data: JSON.stringify({
            type: 'status',
            taskId: this.taskId,
            progress: 100,
            status: 'completed',
            endTime: new Date().toISOString()
          })
        });
        
        // Close connection
        setTimeout(() => {
          this.close();
        }, 1000);
      }
    }, MockWebSocket.FRAME_INTERVAL);
  }
}

// Hook to use the mock WebSocket for development
export function useMockTaskStream({
  url,
  autoConnect = true,
  onMessage,
  onError,
  onClose
}: UseTaskStreamOptions) {
  const [socket, setSocket] = useState<MockWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<Event | null>(null);

  const connect = useCallback(() => {
    if (!url) return;
    
    const ws = new MockWebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        onMessage?.(data);
      } catch (e) {
        setLastMessage(event.data);
        onMessage?.(event.data);
      }
    };
    
    ws.onerror = (e) => {
      setError(e);
      onError?.(e);
    };
    
    ws.onclose = (event) => {
      setIsConnected(false);
      onClose?.(event);
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [url, onMessage, onError, onClose]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const send = useCallback((data: string | any) => {
    if (socket && isConnected) {
      socket.send(data);
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (autoConnect) {
      const cleanup = connect();
      return cleanup;
    }
  }, [autoConnect, connect]);

  useEffect(() => {
    if (socket && url && socket.url !== url) {
      disconnect();
      connect();
    }
  }, [url, socket, disconnect, connect]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    send
  };
}