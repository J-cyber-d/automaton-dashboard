'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { ScheduleTable } from '@/components/heartbeat/ScheduleTable';
import { HistoryTimeline } from '@/components/heartbeat/HistoryTimeline';
import { WakeEvents } from '@/components/heartbeat/WakeEvents';
import type { HeartbeatExecution, WakeEvent } from '@/lib/api';

export default function HeartbeatPage() {
  const { subscribe } = useWebSocketContext();
  const [newExecutions, setNewExecutions] = useState<HeartbeatExecution[]>([]);
  const [newWakeEvents, setNewWakeEvents] = useState<WakeEvent[]>([]);

  const handleWebSocketEvent = useCallback((event: { type: string; data: unknown }) => {
    if (event.type === 'heartbeat') {
      const execution = event.data as HeartbeatExecution;
      setNewExecutions((prev) => [execution, ...prev]);
    } else if (event.type === 'wake_event') {
      const wakeEvent = event.data as WakeEvent;
      setNewWakeEvents((prev) => [wakeEvent, ...prev]);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(handleWebSocketEvent);
    return unsubscribe;
  }, [subscribe, handleWebSocketEvent]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Heartbeat</h1>
        <p className="text-muted-foreground">
          Monitor scheduled tasks, execution history, and agent wake events.
        </p>
      </div>

      <ScheduleTable />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HistoryTimeline newExecutions={newExecutions} />
        <WakeEvents newEvents={newWakeEvents} />
      </div>
    </div>
  );
}
