'use client';

import { useEffect, useState } from 'react';
import { getChildLifecycle, LifecycleEvent } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LifecycleTimelineProps {
  childId: number;
}

const stateColors: Record<string, string> = {
  spawning: 'bg-blue-500',
  alive: 'bg-emerald-500',
  unhealthy: 'bg-yellow-500',
  dead: 'bg-red-500',
  recovering: 'bg-amber-500',
};

function getStateColor(state: string): string {
  return stateColors[state] || 'bg-gray-500';
}

export function LifecycleTimeline({ childId }: LifecycleTimelineProps) {
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLifecycle() {
      setLoading(true);
      setError(null);
      try {
        const data = await getChildLifecycle(childId);
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lifecycle');
      } finally {
        setLoading(false);
      }
    }

    fetchLifecycle();
  }, [childId]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-3 h-3 rounded-full mt-1" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No lifecycle events recorded
      </div>
    );
  }

  // Sort events by timestamp descending (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="relative py-2">
        {/* Vertical connecting line */}
        <div className="absolute left-[5px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-0">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Colored dot */}
              <div
                className={`relative z-10 w-3 h-3 rounded-full ${getStateColor(
                  event.to_state
                )} ring-4 ring-card flex-shrink-0 mt-1`}
              />

              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground capitalize">
                    {event.from_state}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span
                    className={`text-sm font-medium capitalize ${
                      stateColors[event.to_state]?.replace('bg-', 'text-') || 'text-gray-400'
                    }`}
                  >
                    {event.to_state}
                  </span>
                </div>

                {event.reason && (
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    {event.reason}
                  </p>
                )}

                <span className="text-xs text-muted-foreground/60 mt-1 block">
                  {formatTimeAgo(event.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
