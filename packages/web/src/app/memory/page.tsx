'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, Search, Brain, Target, BookOpen, Lightbulb, Users, Ghost } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import {
  getMemoryStats,
  getWorkingMemory,
  getEpisodicMemory,
  getSemanticMemory,
  getProceduralMemory,
  getRelationships,
  MemoryStats,
  WorkingMemoryItem,
  EpisodicMemoryItem,
  SemanticMemoryItem,
  ProceduralMemoryItem,
  RelationshipItem,
} from '@/lib/api';
import { formatTimeAgo, formatDate } from '@/lib/formatters';

// Tier colors for memory stats
const tierColors = {
  working: '#6366f1', // indigo
  episodic: '#10b981', // emerald
  semantic: '#f59e0b', // amber
  procedural: '#8b5cf6', // violet
  relationships: '#ec4899', // pink
};

// Type colors for working memory
const typeColors: Record<string, string> = {
  goal: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  plan: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  observation: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

// Status colors
const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  abandoned: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Entity type colors
const entityTypeColors: Record<string, string> = {
  agent: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  human: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  service: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

// Get importance color
function getImportanceColor(importance: number): string {
  if (importance <= 3) return 'bg-green-500';
  if (importance <= 6) return 'bg-yellow-500';
  if (importance <= 8) return 'bg-orange-500';
  return 'bg-red-500';
}

// Get trust score color
function getTrustColor(score: number): string {
  if (score < 0.3) return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (score < 0.7) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  return 'bg-green-500/20 text-green-400 border-green-500/30';
}

// Memory Stats Summary Component
function MemoryStatsCard({ stats, loading }: { stats: MemoryStats | null; loading: boolean }) {
  if (loading || !stats) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <div className="grid grid-cols-5 gap-4 mt-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = [
    { key: 'working', label: 'Working', value: stats.working, color: tierColors.working },
    { key: 'episodic', label: 'Episodic', value: stats.episodic, color: tierColors.episodic },
    { key: 'semantic', label: 'Semantic', value: stats.semantic, color: tierColors.semantic },
    { key: 'procedural', label: 'Procedural', value: stats.procedural, color: tierColors.procedural },
    { key: 'relationships', label: 'Relationships', value: stats.relationships, color: tierColors.relationships },
  ];

  const maxValue = Math.max(...items.map(i => i.value), 1);

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Memory Overview</h3>
            <p className="text-sm text-muted-foreground">Total items across all memory tiers</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-foreground">{stats.total}</span>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </div>
        </div>

        {/* Stacked bar visualization */}
        <div className="h-4 rounded-full overflow-hidden flex mb-4">
          {items.map(item =>
            item.value > 0 ? (
              <div
                key={item.key}
                className="h-full transition-all duration-500"
                style={{
                  width: `${(item.value / stats.total) * 100}%`,
                  backgroundColor: item.color,
                  minWidth: item.value > 0 ? '4px' : '0',
                }}
                title={`${item.label}: ${item.value}`}
              />
            ) : null
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-5 gap-2">
          {items.map(item => (
            <div key={item.key} className="text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: item.color }}
              />
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Working Memory Tab
function WorkingMemoryTab() {
  const [data, setData] = useState<WorkingMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = status !== 'all' ? { status } : undefined;
      const result = await getWorkingMemory(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load working memory');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="abandoned">Abandoned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No working memories"
          description="Working memory items will appear here when the agent creates goals, plans, or observations"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(item => (
            <Card key={item.id} className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={typeColors[item.type] || ''}>
                    {item.type}
                  </Badge>
                  <Badge variant="outline" className={statusColors[item.status] || ''}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-foreground line-clamp-3">{item.content}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="text-foreground">{item.priority}/10</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${item.priority * 10}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {formatTimeAgo(item.updated_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Episodic Memory Tab
function EpisodicMemoryTab() {
  const [data, setData] = useState<EpisodicMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minImportance, setMinImportance] = useState<string>('0');
  const [classification, setClassification] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEpisodicMemory({
        min_importance: parseInt(minImportance),
        classification: classification !== 'all' ? classification : undefined,
        limit: 50,
        offset: 0,
      });
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load episodic memory');
    } finally {
      setLoading(false);
    }
  }, [minImportance, classification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={minImportance} onValueChange={setMinImportance}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Min Importance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Importance</SelectItem>
            <SelectItem value="5">Importance ≥ 5</SelectItem>
            <SelectItem value="7">Importance ≥ 7</SelectItem>
            <SelectItem value="9">Importance ≥ 9</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classification} onValueChange={setClassification}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classifications</SelectItem>
            <SelectItem value="decision">Decision</SelectItem>
            <SelectItem value="interaction">Interaction</SelectItem>
            <SelectItem value="achievement">Achievement</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {loading ? (
              [...Array(8)].map((_, i) => <Skeleton key={i} className="h-20" />)
            ) : data.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="No memories recorded"
                description="Episodic memories will appear here when the agent records significant events"
              />
            ) : (
              data.map(item => (
              <Collapsible
                key={item.id}
                open={expandedId === item.id}
                onOpenChange={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < item.importance ? getImportanceColor(item.importance) : 'bg-secondary'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.event_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {item.classification}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{item.summary}</p>
                        <CollapsibleContent>
                          <p className="text-sm text-muted-foreground mt-2">{item.details}</p>
                        </CollapsibleContent>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedId === item.id ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </CardContent>
                </Card>
              </Collapsible>
            ))
          )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Semantic Memory Tab
function SemanticMemoryTab() {
  const [data, setData] = useState<SemanticMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSemanticMemory({ search: search || undefined });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load semantic memory');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group by category
  const grouped = data.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SemanticMemoryItem[]>);

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search facts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {error ? (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {loading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-40" />)
            ) : data.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="No memories recorded"
                description="Semantic memories will appear here when the agent learns facts and knowledge"
              />
            ) : (
              Object.entries(grouped).map(([category, items]) => (
              <Collapsible
                key={category}
                open={expandedCategories.has(category)}
                onOpenChange={() => toggleCategory(category)}
              >
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base capitalize">{category}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{items.length}</Badge>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedCategories.has(category) ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="w-[100px]">Confidence</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map(item => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.key}</TableCell>
                              <TableCell className="text-muted-foreground">{item.value}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                      style={{ width: `${item.confidence * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(item.confidence * 100)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Procedural Memory Tab
function ProceduralMemoryTab() {
  const [data, setData] = useState<ProceduralMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProceduralMemory();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load procedural memory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      {error ? (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No memories recorded"
          description="Procedural memories will appear here when the agent learns skills and procedures"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map(item => {
            const total = item.success_count + item.failure_count;
            const successRate = total > 0 ? (item.success_count / total) * 100 : 0;

            return (
              <Card key={item.id} className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>

                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    {item.steps.slice(0, 4).map((step, idx) => (
                      <li key={idx} className="truncate">
                        {step}
                      </li>
                    ))}
                    {item.steps.length > 4 && (
                      <li className="text-muted-foreground/60">
                        +{item.steps.length - 4} more steps
                      </li>
                    )}
                  </ol>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="text-foreground">{successRate.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${successRate}%` }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${100 - successRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.success_count} successes</span>
                      <span>{item.failure_count} failures</span>
                    </div>
                  </div>

                  {item.last_used && (
                    <p className="text-xs text-muted-foreground">
                      Last used {formatTimeAgo(item.last_used)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Relationships Tab
function RelationshipsTab() {
  const [data, setData] = useState<RelationshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRelationships();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load relationships');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      {error ? (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No memories recorded"
          description="Relationships will appear here when the agent interacts with entities"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(item => (
            <Card key={item.id} className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{item.entity_name}</h4>
                    {item.entity_address && (
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                        {item.entity_address.slice(0, 10)}...
                        {item.entity_address.slice(-6)}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={entityTypeColors[item.entity_type] || ''}>
                    {item.entity_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Trust</span>
                    <Badge variant="outline" className={getTrustColor(item.trust_score)}>
                      {item.trust_score.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Interactions</span>
                    <p className="text-sm font-semibold text-foreground">{item.interaction_count}</p>
                  </div>
                </div>

                {item.notes && (
                  <Collapsible
                    open={expandedId === item.id}
                    onOpenChange={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full">
                        <ChevronDown
                          className={`h-4 w-4 mr-2 transition-transform ${
                            expandedId === item.id ? 'rotate-180' : ''
                          }`}
                        />
                        Notes
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {item.last_interaction && (
                  <p className="text-xs text-muted-foreground">
                    Last interaction {formatTimeAgo(item.last_interaction)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Memory Page
export default function MemoryPage() {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('working');

  useEffect(() => {
    async function fetchStats() {
      try {
        const result = await getMemoryStats();
        setStats(result);
      } catch (err) {
        setStatsError(err instanceof Error ? err.message : 'Failed to load memory stats');
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Memory</h1>
        <p className="text-muted-foreground">
          Explore the agent&apos;s memory systems — from active working memory to long-term
          relationships.
        </p>
      </div>

      {/* Error Display */}
      {statsError && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive">{statsError}</p>
        </div>
      )}

      {/* Stats Summary */}
      <MemoryStatsCard stats={stats} loading={statsLoading} />

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="working" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Working</span>
          </TabsTrigger>
          <TabsTrigger value="episodic" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Episodic</span>
          </TabsTrigger>
          <TabsTrigger value="semantic" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Semantic</span>
          </TabsTrigger>
          <TabsTrigger value="procedural" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Procedural</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Relationships</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="working">
          <WorkingMemoryTab />
        </TabsContent>
        <TabsContent value="episodic">
          <EpisodicMemoryTab />
        </TabsContent>
        <TabsContent value="semantic">
          <SemanticMemoryTab />
        </TabsContent>
        <TabsContent value="procedural">
          <ProceduralMemoryTab />
        </TabsContent>
        <TabsContent value="relationships">
          <RelationshipsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
