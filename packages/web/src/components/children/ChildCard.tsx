'use client';

import { Child } from '@/lib/api';
import { formatCredits, formatAddress, formatTimeAgo } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ChildCardProps {
  child: Child;
  onClick: () => void;
}

const stateColors: Record<Child['state'], { bg: string; text: string; glow: string }> = {
  spawning: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]',
  },
  alive: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
  },
  unhealthy: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    glow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
  },
  dead: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
  },
  recovering: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
  },
};

export function ChildCard({ child, onClick }: ChildCardProps) {
  const colors = stateColors[child.state];

  return (
    <Card
      onClick={onClick}
      className={`p-4 cursor-pointer bg-card/80 backdrop-blur-sm border-border hover:border-muted-foreground/50 transition-all duration-200 ${colors.glow}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-foreground truncate pr-2">
          {child.name}
        </h3>
        <Badge className={`${colors.bg} ${colors.text} border-0 capitalize`}>
          {child.state}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Address</span>
          <span className="text-foreground font-mono">{formatAddress(child.address)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Sandbox</span>
          <span className="text-foreground font-mono text-xs truncate max-w-[150px]">
            {child.sandbox_id}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Credits</span>
          <span className="text-foreground font-medium">{formatCredits(child.credits)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Health Check</span>
          <div className="flex items-center gap-2">
            {child.last_health_check ? (
              <span className="text-muted-foreground text-xs">
                {formatTimeAgo(child.last_health_check)}
              </span>
            ) : (
              <span className="text-muted-foreground text-xs">Never</span>
            )}
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

        <div className="flex justify-between items-center pt-1 border-t border-border/50">
          <span className="text-muted-foreground">Created</span>
          <span className="text-muted-foreground text-xs">
            {formatTimeAgo(child.created_at)}
          </span>
        </div>
      </div>
    </Card>
  );
}
