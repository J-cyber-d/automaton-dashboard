'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/useApi';
import {
  getSecurityStats,
  getPolicyDecisions,
  getModifications,
  SecurityStats,
  PolicyDecision,
  Modification,
  PaginatedResult,
} from '@/lib/api';
import { OverviewTab } from '@/components/security/OverviewTab';
import { PolicyDecisionsTab } from '@/components/security/PolicyDecisionsTab';
import { ModificationsTab } from '@/components/security/ModificationsTab';
import { Shield } from 'lucide-react';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Pagination and filter states
  const [decisionsPage, setDecisionsPage] = useState(0);
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [toolFilter, setToolFilter] = useState('all');
  
  const [modificationsPage, setModificationsPage] = useState(0);

  // Fetch data
  const { data: stats, loading: statsLoading, error: statsError } = useApi<SecurityStats>(getSecurityStats);

  const { data: decisions, loading: decisionsLoading, error: decisionsError } = useApi<PaginatedResult<PolicyDecision>>(
    () =>
      getPolicyDecisions({
        limit: 20,
        offset: decisionsPage * 20,
        decision: decisionFilter === 'all' ? undefined : decisionFilter,
        tool_name: toolFilter === 'all' ? undefined : toolFilter,
      }),
    [decisionsPage, decisionFilter, toolFilter]
  );

  const { data: modifications, loading: modificationsLoading, error: modificationsError } = useApi<PaginatedResult<Modification>>(
    () =>
      getModifications({
        limit: 20,
        offset: modificationsPage * 20,
      }),
    [modificationsPage]
  );

  const defaultStats: SecurityStats = {
    total_decisions: 0,
    allowed: 0,
    denied: 0,
    modifications_count: 0,
    risk_breakdown: { safe: 0, caution: 0, dangerous: 0, forbidden: 0 },
    top_denied_tools: [],
    injection_attempts: 0,
  };

  const defaultPaginated = <T,>(): PaginatedResult<T> => ({
    data: [],
    total: 0,
    limit: 20,
    offset: 0,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security</h1>
          <p className="text-muted-foreground">
            Monitor security policies, access controls, and self-modifications
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="decisions">Policy Decisions</TabsTrigger>
          <TabsTrigger value="modifications">Modifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {statsError ? (
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <p className="text-sm text-destructive">Failed to load security stats: {statsError}</p>
            </div>
          ) : statsLoading || !stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-48" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>
          ) : (
            <OverviewTab stats={stats || defaultStats} />
          )}
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          {decisionsError ? (
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <p className="text-sm text-destructive">Failed to load policy decisions: {decisionsError}</p>
            </div>
          ) : decisionsLoading || !decisions ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-96" />
            </div>
          ) : (
            <PolicyDecisionsTab
              decisions={decisions || defaultPaginated<PolicyDecision>()}
              currentPage={decisionsPage}
              onPageChange={setDecisionsPage}
              decisionFilter={decisionFilter}
              onDecisionFilterChange={(value) => {
                setDecisionFilter(value);
                setDecisionsPage(0);
              }}
              toolFilter={toolFilter}
              onToolFilterChange={(value) => {
                setToolFilter(value);
                setDecisionsPage(0);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="modifications" className="space-y-4">
          {modificationsError ? (
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <p className="text-sm text-destructive">Failed to load modifications: {modificationsError}</p>
            </div>
          ) : modificationsLoading || !modifications ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-96" />
            </div>
          ) : (
            <ModificationsTab
              modifications={modifications || defaultPaginated<Modification>()}
              currentPage={modificationsPage}
              onPageChange={setModificationsPage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
