import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface WebSocketContextType {
  isConnected: boolean;
  messageCount: number;
  lastHeartbeat: string | null;
  lastMessage: any | null;
  connectionId: string | null;
  connect: (sessionId?: string) => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  connectionHistory: Array<{
    timestamp: string;
    event: string;
    data?: any;
  }>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: string;
    event: string;
    data?: any;
  }>>([]);

  const addToHistory = useCallback((event: string, data?: any) => {
    setConnectionHistory(prev => [
      {
        timestamp: new Date().toISOString(),
        event,
        data
      },
      ...prev.slice(0, 99) // Keep last 100 events
    ]);
  }, []);

  const connect = useCallback((sessionId?: string) => {
    if (socket) {
      socket.close();
    }

    // In a real implementation, this would point to your Django WebSocket endpoint
    const wsUrl = sessionId 
      ? `ws://localhost:8000/ws/chat/?session_id=${sessionId}`
      : 'ws://localhost:8000/ws/chat/';
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      setIsConnected(true);
      addToHistory('connected');
      toast.success('WebSocket connected');
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        if (data.count !== undefined) {
          setMessageCount(data.count);
          addToHistory('message received', data);
        }
        
        if (data.ts) {
          setLastHeartbeat(data.ts);
          addToHistory('heartbeat', data);
        }

        if (data.connectionId) {
          setConnectionId(data.connectionId);
        }

      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };
    
    newSocket.onclose = (event) => {
      setIsConnected(false);
      addToHistory('disconnected', { code: event.code, reason: event.reason });
      
      if (event.code === 1001) {
        toast.info('Server is shutting down gracefully');
      } else if (event.code !== 1000) {
        toast.error(`WebSocket closed: ${event.reason || 'Unknown reason'}`);
      }
    };
    
    newSocket.onerror = () => {
      addToHistory('error');
      toast.error('WebSocket error occurred');
    };
    
    setSocket(newSocket);
  }, [socket, addToHistory]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, 'Client disconnected');
      setSocket(null);
    }
  }, [socket]);

  const sendMessage = useCallback((message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
      addToHistory('message sent', { content: message });
    } else {
      toast.error('WebSocket is not connected');
    }
  }, [socket, addToHistory]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        messageCount,
        lastHeartbeat,
        lastMessage,
        connectionId,
        connect,
        disconnect,
        sendMessage,
        connectionHistory
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};