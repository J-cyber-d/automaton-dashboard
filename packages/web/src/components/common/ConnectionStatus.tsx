'use client';

import { useState, useEffect } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { cn } from '@/lib/utils';

type ConnectionState = 'connected' | 'reconnecting' | 'disconnected';

export function ConnectionStatus() {
  const { connected } = useWebSocketContext();
  const [visible, setVisible] = useState(true);
  const [prevConnected, setPrevConnected] = useState(connected);
  const [state, setState] = useState<ConnectionState>(connected ? 'connected' : 'reconnecting');

  useEffect(() => {
    if (connected !== prevConnected) {
      if (connected) {
        setState('connected');
        // Auto-hide after 3 seconds when connected
        const timer = setTimeout(() => {
          setVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setState(prevConnected ? 'reconnecting' : 'disconnected');
        setVisible(true);
      }
      setPrevConnected(connected);
    }
  }, [connected, prevConnected]);

  if (!visible) return null;

  const config = {
    connected: {
      dotColor: 'bg-emerald-500',
      text: 'Connected',
      textColor: 'text-emerald-500',
    },
    reconnecting: {
      dotColor: 'bg-amber-500 animate-pulse',
      text: 'Reconnecting...',
      textColor: 'text-amber-500',
    },
    disconnected: {
      dotColor: 'bg-red-500',
      text: 'Disconnected',
      textColor: 'text-red-500',
    },
  }[state];

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'rounded-full px-3 py-1.5 text-xs',
        'bg-card/90 backdrop-blur-sm border shadow-lg',
        'flex items-center gap-2',
        'transition-opacity duration-300'
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
      <span className={config.textColor}>{config.text}</span>
    </div>
  );
}
