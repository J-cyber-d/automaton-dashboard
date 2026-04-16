'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimeAgo } from '@/lib/formatters';
import type { Turn } from '@/lib/api';
import { ChevronRight } from 'lucide-react';

interface RecentTurnsProps {
  turns: Turn[];
  loading: boolean;
}

function truncateThinking(text: string, maxLength: number = 80): string {
  // Get first line or truncate
  const firstLine = text.split('\n')[0] || text;
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.slice(0, maxLength) + '...';
}

export function RecentTurns({ turns, loading }: RecentTurnsProps) {
  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-12 shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const recentTurns = turns.slice(0, 5);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTurns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <>
            {recentTurns.map((turn) => (
              <div key={turn.id} className="flex items-start gap-3 group">
                <span className="text-xs text-muted-foreground shrink-0 w-12">
                  {formatTimeAgo(turn.timestamp)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {truncateThinking(turn.thinking)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {turn.toolCalls?.length || 0} tools
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {turn.model}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Link
              href="/activity"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 border-t border-border/50"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
