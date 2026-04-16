'use client';

import { useState, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { getHeartbeatHistory, type HeartbeatExecution } from '@/lib/api';
import { formatTimeAgo, formatDuration } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, HeartPulse } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

function HistoryItem({ execution }: { execution: HeartbeatExecution }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{execution.task_name}</span>
          <Badge
            variant={execution.status === 'success' ? 'default' : 'destructive'}
            className={execution.status === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
          >
            {execution.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(execution.timestamp)}
        </span>
      </div>
      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
        <span>Duration: {formatDuration(execution.duration_ms)}</span>
      </div>
      {execution.error_message && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors">
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isOpen ? 'Hide error' : 'Show error'}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive font-mono break-all">
              {execution.error_message}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function HistoryTimelineContent({ newExecutions = [] }: { newExecutions?: HeartbeatExecution[] }) {
  const { data, loading, error } = useApi(() => getHeartbeatHistory({ limit: 50 }));
  const [selectedTask, setSelectedTask] = useState<string>('all');

  const allExecutions = useMemo(() => {
    const base = data?.data || [];
    // Prepend new real-time executions
    return [...newExecutions, ...base];
  }, [data, newExecutions]);

  const taskNames = useMemo(() => {
    if (!allExecutions.length) return [];
    const names = new Set(allExecutions.map((e) => e.task_name));
    return Array.from(names).sort();
  }, [allExecutions]);

  const filteredExecutions = useMemo(() => {
    if (!allExecutions.length) return [];
    if (selectedTask === 'all') return allExecutions;
    return allExecutions.filter((e) => e.task_name === selectedTask);
  }, [allExecutions, selectedTask]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load history: {error}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        icon={HeartPulse}
        title="No heartbeat data"
        description="Execution history will appear here when tasks run"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Select value={selectedTask} onValueChange={setSelectedTask}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by task" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          {taskNames.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ScrollArea className="h-[400px]">
        <div className="pr-4">
          {filteredExecutions.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">
              No executions for selected task.
            </div>
          ) : (
            filteredExecutions.map((execution) => (
              <HistoryItem key={execution.id} execution={execution} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface HistoryTimelineProps {
  newExecutions?: HeartbeatExecution[];
}

export function HistoryTimeline({ newExecutions }: HistoryTimelineProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
      </CardHeader>
      <CardContent>
        <HistoryTimelineContent newExecutions={newExecutions} />
      </CardContent>
    </Card>
  );
}
