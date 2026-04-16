'use client';

import { Child } from '@/lib/api';
import { formatCredits, formatTimeAgo } from '@/lib/formatters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { LifecycleTimeline } from './LifecycleTimeline';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ChildDetailProps {
  child: Child | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stateColors: Record<Child['state'], { bg: string; text: string }> = {
  spawning: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
  },
  alive: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
  },
  unhealthy: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
  },
  dead: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
  },
  recovering: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
  },
};

export function ChildDetail({ child, open, onOpenChange }: ChildDetailProps) {
  const [genesisOpen, setGenesisOpen] = useState(false);

  if (!child) return null;

  const colors = stateColors[child.state];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-xl">{child.name}</span>
            <Badge className={`${colors.bg} ${colors.text} border-0 capitalize`}>
              {child.state}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Address
              </label>
              <p className="text-sm font-mono text-foreground break-all">
                {child.address}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Sandbox ID
              </label>
              <p className="text-sm font-mono text-foreground break-all">
                {child.sandbox_id}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Credits
              </label>
              <p className="text-sm font-medium text-foreground">
                {formatCredits(child.credits)}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Created
              </label>
              <p className="text-sm text-foreground">
                {formatTimeAgo(child.created_at)}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Last Health Check
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">
                  {child.last_health_check
                    ? formatTimeAgo(child.last_health_check)
                    : 'Never'}
                </span>
                {child.health_status && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      child.health_status === 'healthy'
                        ? 'border-emerald-500/50 text-emerald-400'
                        : child.health_status === 'unhealthy'
                        ? 'border-yellow-500/50 text-yellow-400'
                        : 'border-red-500/50 text-red-400'
                    }`}
                  >
                    {child.health_status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Genesis Prompt Collapsible */}
          {child.genesis_prompt && (
            <Collapsible open={genesisOpen} onOpenChange={setGenesisOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto hover:bg-muted"
                >
                  <span className="text-sm font-medium">Genesis Prompt</span>
                  {genesisOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-muted/50 rounded-md p-4 mt-2">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                    {child.genesis_prompt}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Lifecycle Timeline */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Lifecycle History
            </h4>
            <LifecycleTimeline childId={child.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
