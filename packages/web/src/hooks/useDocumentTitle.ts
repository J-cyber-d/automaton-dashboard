'use client';

import { useEffect } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useApi } from '@/hooks/useApi';
import { getStatus } from '@/lib/api';
import { formatCredits } from '@/lib/formatters';

export function useDocumentTitle() {
  const { subscribe } = useWebSocketContext();
  const { data: status } = useApi(getStatus);

  useEffect(() => {
    if (status) {
      const name = status.name || 'Automaton';
      const state = status.state ? status.state.charAt(0).toUpperCase() + status.state.slice(1) : 'Unknown';
      const credits = status.credits != null ? formatCredits(status.credits) : '';
      document.title = `${name} — ${state}${credits ? ` | ${credits}` : ''}`;
    }
  }, [status]);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'status_update' && event.data) {
        const d = event.data as { name?: string; state?: string; credits?: number };
        const name = d.name || 'Automaton';
        const state = d.state ? d.state.charAt(0).toUpperCase() + d.state.slice(1) : 'Unknown';
        const credits = d.credits != null ? formatCredits(d.credits) : '';
        document.title = `${name} — ${state}${credits ? ` | ${credits}` : ''}`;
      }
    });
    return unsubscribe;
  }, [subscribe]);
}
