'use client';

import { useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { getWakeEvents, type WakeEvent } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/common/EmptyState';
import { HeartPulse } from 'lucide-react';

function getSourceBadgeColor(source: string): string {
  switch (source.toLowerCase()) {
    case 'schedule':
      return 'bg-indigo-500 hover:bg-indigo-600';
    case 'webhook':
      return 'bg-emerald-500 hover:bg-emerald-600';
    case 'manual':
      return 'bg-amber-500 hover:bg-amber-600';
    case 'inbox':
      return 'bg-blue-500 hover:bg-blue-600';
    default:
      return 'bg-muted hover:bg-muted/80';
  }
}

function WakeEventItem({ event }: { event: WakeEvent }) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={getSourceBadgeColor(event.source)}>
            {event.source}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(event.timestamp)}
        </span>
      </div>
      <p className="text-sm text-foreground mt-2">{event.reason}</p>
    </div>
  );
}

function WakeEventsContent({ newEvents = [] }: { newEvents?: WakeEvent[] }) {
  const { data, loading, error } = useApi(() => getWakeEvents({ limit: 30 }));

  const allEvents = useMemo(() => {
    const base = data?.data || [];
    // Prepend new real-time events
    return [...newEvents, ...base];
  }, [data, newEvents]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load wake events: {error}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        icon={HeartPulse}
        title="No heartbeat data"
        description="Wake events will appear here when the agent is triggered"
      />
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="pr-4">
        {allEvents.map((event, index) => (
          <div key={`${event.id}-${index}`}>
            <WakeEventItem event={event} />
            {index < allEvents.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

interface WakeEventsProps {
  newEvents?: WakeEvent[];
}

export function WakeEvents({ newEvents }: WakeEventsProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Wake Events</CardTitle>
      </CardHeader>
      <CardContent>
        <WakeEventsContent newEvents={newEvents} />
      </CardContent>
    </Card>
  );
}
