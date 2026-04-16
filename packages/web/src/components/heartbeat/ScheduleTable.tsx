'use client';

import { useApi } from '@/hooks/useApi';
import { getHeartbeatSchedule, type HeartbeatTask } from '@/lib/api';
import { formatTimeAgo, formatDate } from '@/lib/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { HeartPulse } from 'lucide-react';

function getRowClassName(task: HeartbeatTask): string {
  if (!task.enabled) return 'border-l-4 border-l-muted bg-muted/5';
  if (task.last_result === 'error') return 'border-l-4 border-l-red-500 bg-red-500/5';
  if (task.last_result === 'success') return 'border-l-4 border-l-emerald-500 bg-emerald-500/5';
  return 'border-l-4 border-l-muted';
}

function ScheduleTableContent() {
  const { data: tasks, loading, error } = useApi(getHeartbeatSchedule);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load schedule: {error}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={HeartPulse}
        title="No heartbeat data"
        description="Scheduled tasks will appear here when configured"
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Name</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead>Min Tier</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Last Result</TableHead>
            <TableHead>Next Run</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className={getRowClassName(task)}>
              <TableCell className="font-medium">{task.task_name}</TableCell>
              <TableCell>
                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  {task.schedule}
                </code>
              </TableCell>
              <TableCell>
                <Badge
                  variant={task.enabled ? 'default' : 'secondary'}
                  className={task.enabled ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                >
                  {task.enabled ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{task.min_tier}</TableCell>
              <TableCell className="text-muted-foreground">
                {task.last_run ? formatTimeAgo(task.last_run) : '—'}
              </TableCell>
              <TableCell>
                {!task.last_result ? (
                  <Badge variant="secondary">—</Badge>
                ) : task.last_result === 'success' ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Success</Badge>
                ) : (
                  <Badge variant="destructive">Error</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.next_run ? formatTimeAgo(task.next_run) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ScheduleTable() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleTableContent />
      </CardContent>
    </Card>
  );
}
