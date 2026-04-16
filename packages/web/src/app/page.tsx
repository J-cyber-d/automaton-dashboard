'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/useApi';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { getStatus, getTurns, getSpending, type AgentStatus, type Turn, type SpendingData } from '@/lib/api';
import { formatCredits, formatAddress, formatTimeAgo } from '@/lib/formatters';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { TierBadge } from '@/components/common/TierBadge';
import { SpendMiniChart } from '@/components/dashboard/SpendMiniChart';
import { RecentTurns } from '@/components/dashboard/RecentTurns';
import { Wallet, RotateCcw, Brain, Users } from 'lucide-react';

// Type for tier that matches TierBadge component
type TierType = 'high' | 'normal' | 'low' | 'critical' | 'dead';

function mapStatusToTier(status: AgentStatus | null): TierType {
  if (!status) return 'normal';
  switch (status.tier.toLowerCase()) {
    case 'premium':
    case 'pro':
      return 'high';
    case 'standard':
    case 'basic':
      return 'normal';
    case 'free':
      return 'low';
    default:
      return 'normal';
  }
}

function getTierGlowColor(tier: TierType): string {
  switch (tier) {
    case 'high':
      return 'rgba(16, 185, 129, 0.5)'; // --tier-high
    case 'normal':
      return 'rgba(99, 102, 241, 0.5)'; // --tier-normal
    case 'low':
      return 'rgba(245, 158, 11, 0.5)'; // --tier-low
    case 'critical':
      return 'rgba(239, 68, 68, 0.5)'; // --tier-critical
    case 'dead':
      return 'rgba(107, 114, 128, 0.5)'; // --tier-dead
    default:
      return 'rgba(99, 102, 241, 0.5)';
  }
}

function getStateType(state: string): 'running' | 'idle' | 'paused' | 'error' {
  switch (state.toLowerCase()) {
    case 'running':
    case 'active':
      return 'running';
    case 'idle':
    case 'sleeping':
    case 'sleep':
      return 'idle';
    case 'paused':
    case 'pause':
      return 'paused';
    case 'error':
    case 'failed':
      return 'error';
    default:
      return 'idle';
  }
}

export default function OverviewPage() {
  const { data: status, loading: statusLoading, error: statusError, refetch: refetchStatus } = useApi<AgentStatus>(getStatus);
  const { data: turnsData, loading: turnsLoading, error: turnsError, refetch: refetchTurns } = useApi<{ data: Turn[] }>(() => getTurns({ limit: 5 }));
  const { data: spendingData, loading: spendingLoading, error: spendingError } = useApi<SpendingData>(() => getSpending('24h'));
  const { connected, subscribe } = useWebSocketContext();

  // Subscribe to WebSocket events for real-time updates
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'status_update') {
        refetchStatus();
      }
      if (event.type === 'new_turn') {
        refetchTurns();
      }
    });

    return () => unsubscribe();
  }, [subscribe, refetchStatus, refetchTurns]);

  const tier = mapStatusToTier(status);
  const tierGlowColor = getTierGlowColor(tier);
  const turns = turnsData?.data || [];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold text-foreground mb-1">Overview</h1>
        <p className="text-muted-foreground">System monitoring and control center</p>
        {connected && (
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-muted-foreground">Live updates</span>
          </div>
        )}
      </header>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits Card */}
        <Card 
          className="bg-card/80 backdrop-blur-sm border-border/50"
          style={{ boxShadow: `0 0 15px ${tierGlowColor}` }}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Credits
            </CardDescription>
            <CardTitle className="text-2xl">
              {statusLoading ? <Skeleton className="h-8 w-24" /> : formatCredits(status?.credits || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TierBadge tier={tier} />
          </CardContent>
        </Card>

        {/* Total Turns Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Total Turns
            </CardDescription>
            <CardTitle className="text-2xl">
              {statusLoading ? <Skeleton className="h-8 w-16" /> : (status?.totalTurns || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Lifetime executions</span>
          </CardContent>
        </Card>

        {/* Active Memories Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Active Memories
            </CardDescription>
            <CardTitle className="text-2xl">
              {statusLoading ? <Skeleton className="h-8 w-16" /> : (status?.skillsActive || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Working + Episodic</span>
          </CardContent>
        </Card>

        {/* Children Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Children
            </CardDescription>
            <CardTitle className="text-2xl">
              {statusLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span>
                  {status?.childrenAlive || 0}
                  <span className="text-muted-foreground text-lg"> / {status?.childrenTotal || 0}</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Alive / Total</span>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: SpendMiniChart + RecentTurns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SpendMiniChart */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Spending</CardTitle>
            <CardDescription>Inference, Tools, Domains</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendMiniChart data={spendingData} loading={spendingLoading} />
          </CardContent>
        </Card>

        {/* RecentTurns */}
        <RecentTurns turns={turns} loading={turnsLoading} />
      </div>

      {/* Agent Identity Card */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{statusLoading ? <Skeleton className="h-7 w-32" /> : status?.name || 'Unknown Agent'}</CardTitle>
              <CardDescription className="mt-1">
                {statusLoading ? <Skeleton className="h-4 w-48" /> : `v${status?.version || '1.0.0'}`}
              </CardDescription>
            </div>
            <LiveIndicator state={getStateType(status?.state || 'idle')} showLabel />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs mb-1">Address</span>
              <span className="font-mono text-foreground">
                {statusLoading ? <Skeleton className="h-4 w-24" /> : formatAddress(status?.address || '')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs mb-1">Creator</span>
              <span className="font-mono text-foreground">
                {statusLoading ? <Skeleton className="h-4 w-24" /> : formatAddress(status?.creator || '')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs mb-1">Last Activity</span>
              <span className="text-foreground">
                {statusLoading ? <Skeleton className="h-4 w-20" /> : (status?.lastActivity ? formatTimeAgo(status.lastActivity) : 'Never')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs mb-1">USDC Balance</span>
              <span className="text-foreground">
                {statusLoading ? <Skeleton className="h-4 w-16" /> : `$${(status?.usdc || 0).toFixed(2)}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {(statusError || turnsError || spendingError) && (
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-sm text-destructive space-y-1">
              {statusError && <p>Error loading status: {statusError}</p>}
              {turnsError && <p>Error loading turns: {turnsError}</p>}
              {spendingError && <p>Error loading spending data: {spendingError}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
