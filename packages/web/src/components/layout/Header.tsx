'use client';

import { useEffect, useState } from 'react';
import { Ghost } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/useApi';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { getStatus, type AgentStatus } from '@/lib/api';
import { formatCredits, formatTier } from '@/lib/formatters';
import { cn } from '@/lib/utils';

function ConnectionIndicator({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {connected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tier-high opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            connected ? 'bg-tier-high' : 'bg-tier-dead'
          )}
        />
      </span>
      <span className={cn(
        'text-xs',
        connected ? 'text-tier-high' : 'text-muted-foreground'
      )}>
        {connected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const getTierStyles = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium':
      case 'pro':
        return 'bg-tier-high/20 text-tier-high border-tier-high/30';
      case 'standard':
      case 'basic':
        return 'bg-tier-normal/20 text-tier-normal border-tier-normal/30';
      case 'free':
      default:
        return 'bg-tier-low/20 text-tier-low border-tier-low/30';
    }
  };

  return (
    <Badge variant="outline" className={cn('text-xs font-medium', getTierStyles(tier))}>
      {formatTier(tier)}
    </Badge>
  );
}

export function Header() {
  const { connected, subscribe } = useWebSocketContext();
  const { data: status, loading, refetch } = useApi<AgentStatus>(getStatus);
  const [liveCredits, setLiveCredits] = useState<number | null>(null);

  // Subscribe to WebSocket status updates
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'status_update') {
        const data = event.data as Partial<AgentStatus>;
        if (data.credits !== undefined) {
          setLiveCredits(data.credits);
        }
        // Refetch full status on any status update
        refetch();
      }
    });

    return unsubscribe;
  }, [subscribe, refetch]);

  // Reset live credits when status changes
  useEffect(() => {
    if (status) {
      setLiveCredits(null);
    }
  }, [status?.credits]);

  const displayCredits = liveCredits !== null ? liveCredits : status?.credits ?? 0;
  const agentName = status?.name || 'Unknown Agent';
  const tier = status?.tier || 'free';

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Left side - Logo */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
          <Ghost className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground hidden sm:inline">Automaton Dashboard</span>
      </div>

      {/* Right side - Status info */}
      <div className="flex items-center gap-4">
        {loading ? (
          <>
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-12" />
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {agentName}
            </span>
            <ConnectionIndicator connected={connected} />
            <span className="text-sm font-medium text-foreground">
              {formatCredits(displayCredits)}
            </span>
            <TierBadge tier={tier} />
          </>
        )}
      </div>
    </header>
  );
}
