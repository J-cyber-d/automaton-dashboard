'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

type WebSocketEvent = { type: string; data: unknown };
type Listener = (event: WebSocketEvent) => void;

interface WebSocketContextType {
  connected: boolean;
  subscribe: (listener: Listener) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  subscribe: () => () => {},
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [listeners] = useState<Set<Listener>>(() => new Set());

  const handleEvent = useCallback((event: WebSocketEvent) => {
    listeners.forEach(fn => fn(event));
  }, [listeners]);

  const { connected } = useWebSocket(handleEvent);

  const subscribe = useCallback((listener: Listener) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, [listeners]);

  return (
    <WebSocketContext.Provider value={{ connected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
