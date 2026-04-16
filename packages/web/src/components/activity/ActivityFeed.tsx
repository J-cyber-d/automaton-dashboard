'use client';

import { useState, useEffect, useCallback } from 'react';
import { Turn, getTurns, PaginatedResult } from '@/lib/api';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TurnCard } from './TurnCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader2, Activity } from 'lucide-react';

interface ActivityFeedProps {
  search?: string;
  toolFilter?: string;
  sourceFilter?: string;
  onTurnSelect?: (turn: Turn) => void;
}

const LIMIT = 20;

export function ActivityFeed({
  search,
  toolFilter,
  sourceFilter,
  onTurnSelect,
}: ActivityFeedProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTurnIds, setNewTurnIds] = useState<Set<number>>(new Set());
  const { subscribe } = useWebSocketContext();

  // Load initial data
  const loadTurns = useCallback(
    async (currentOffset: number, append: boolean = false) => {
      if (currentOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const result: PaginatedResult<Turn> = await getTurns({
          limit: LIMIT,
          offset: currentOffset,
          search: search || undefined,
          tool: toolFilter && toolFilter !== 'all' ? toolFilter : undefined,
        });

        if (append) {
          setTurns((prev) => [...prev, ...result.data]);
        } else {
          setTurns(result.data);
          // Clear new turn indicators when refreshing
          setNewTurnIds(new Set());
        }

        setHasMore(result.data.length === LIMIT && currentOffset + result.data.length < result.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, toolFilter]
  );

  // Initial load
  useEffect(() => {
    setOffset(0);
    loadTurns(0, false);
  }, [loadTurns]);

  // WebSocket subscription for new turns
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'new_turn') {
        const newTurn = event.data as Turn;
        setTurns((prev) => {
          // Avoid duplicates
          if (prev.some((t) => t.id === newTurn.id)) {
            return prev;
          }
          // Mark as new for animation
          setNewTurnIds((prevIds) => new Set(prevIds).add(newTurn.id));
          // Remove from new set after animation
          setTimeout(() => {
            setNewTurnIds((prevIds) => {
              const next = new Set(prevIds);
              next.delete(newTurn.id);
              return next;
            });
          }, 500);
          return [newTurn, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, [subscribe]);

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    loadTurns(newOffset, true);
  };

  // Filter turns by source (client-side filtering)
  const filteredTurns = turns.filter((turn) => {
    if (sourceFilter && sourceFilter !== 'all') {
      return turn.inputSource.toLowerCase() === sourceFilter.toLowerCase();
    }
    return true;
  });

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive">Failed to load activity: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline container with connecting line */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[5.5rem] top-4 bottom-4 w-px bg-border hidden sm:block" />

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3 pr-4">
            {filteredTurns.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No turns yet"
                description={
                  search || toolFilter || sourceFilter
                    ? 'Try adjusting your filters'
                    : 'Activity will appear here when turns are processed'
                }
              />
            ) : (
              filteredTurns.map((turn) => (
                <TurnCard
                  key={turn.id}
                  turn={turn}
                  onClick={() => onTurnSelect?.(turn)}
                  isNew={newTurnIds.has(turn.id)}
                />
              ))
            )}

            {/* Load more button */}
            {hasMore && filteredTurns.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="border-border"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
