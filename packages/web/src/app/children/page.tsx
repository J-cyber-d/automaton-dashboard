'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { getChildren, Child } from '@/lib/api';
import { formatCredits } from '@/lib/formatters';
import { ChildCard } from '@/components/children/ChildCard';
import { ChildDetail } from '@/components/children/ChildDetail';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertCircle } from 'lucide-react';

export default function ChildrenPage() {
  const { data, loading, error } = useApi(getChildren);
  const children = data ?? [];
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChildClick = (child: Child) => {
    setSelectedChild(child);
    setDialogOpen(true);
  };

  // Calculate stats
  const totalChildren = children.length;
  const aliveCount = children.filter((c) => c.state === 'alive').length;
  const deadCount = children.filter((c) => c.state === 'dead').length;
  const totalCredits = children.reduce((sum, c) => sum + c.credits, 0);

  // Stats card component
  const StatCard = ({
    label,
    value,
    colorClass,
  }: {
    label: string;
    value: string | number;
    colorClass?: string;
  }) => (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClass || 'text-foreground'}`}>
        {value}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Children</h1>
          <p className="text-muted-foreground">
            Child agents and spawned processes
          </p>
        </div>

        {/* Skeleton stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 bg-card/80 backdrop-blur-sm">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>

        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 bg-card/80 backdrop-blur-sm">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Children</h1>
          <p className="text-muted-foreground">
            Child agents and spawned processes
          </p>
        </div>

        <Card className="p-8 bg-card/80 backdrop-blur-sm border-red-500/30">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Failed to load children
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Children</h1>
        <p className="text-muted-foreground">
          Child agents and spawned processes
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Children" value={totalChildren} />
        <StatCard
          label="Alive"
          value={aliveCount}
          colorClass="text-emerald-400"
        />
        <StatCard label="Dead" value={deadCount} colorClass="text-red-400" />
        <StatCard
          label="Total Credits"
          value={formatCredits(totalCredits)}
        />
      </div>

      {/* Children Grid or Empty State */}
      {children.length === 0 ? (
        <Card className="p-12 bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No children spawned yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Child agents will appear here when they are spawned by the
              automaton. Each child runs in its own sandbox with isolated
              resources.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onClick={() => handleChildClick(child)}
            />
          ))}
        </div>
      )}

      {/* Child Detail Dialog */}
      <ChildDetail
        child={selectedChild}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
