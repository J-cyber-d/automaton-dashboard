'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '@/lib/api';

type WebSocketEvent = {
  type: string;
  data: unknown;
};

export function useWebSocket(onEvent?: (event: WebSocketEvent) => void) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Don't connect during SSR
    if (typeof window === 'undefined') return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onEvent?.(parsed);
        } catch {
          // Ignore parse errors
        }
      };
    } catch {
      // Connection failed, will retry
    }
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected };
}
