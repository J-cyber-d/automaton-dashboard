'use client';

import { useState } from 'react';
import { Turn } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ToolCallBadge } from './ToolCallBadge';
import {
  formatTimeAgo,
  formatDuration,
  formatCredits,
  formatTokens,
} from '@/lib/formatters';
import { ChevronDown, ChevronUp, Hash, Coins, Clock } from 'lucide-react';

interface TurnCardProps {
  turn: Turn;
  onClick?: () => void;
  isNew?: boolean;
}

function getSourceBorderColor(source: string): string {
  switch (source.toLowerCase()) {
    case 'self':
      return 'border-l-indigo-500';
    case 'creator':
      return 'border-l-emerald-500';
    case 'peer':
      return 'border-l-amber-500';
    default:
      return 'border-l-muted-foreground';
  }
}

export function TurnCard({ turn, onClick, isNew }: TurnCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div
      className={isNew ? 'animate-slide-in-top' : ''}
      style={
        isNew
          ? {
              animation: 'slide-in-top 0.3s ease-out',
            }
          : undefined
      }
    >
      <Card
        onClick={handleClick}
        className={`
          relative border-l-4 ${getSourceBorderColor(turn.inputSource)} 
          bg-card hover:bg-muted/50 transition-colors cursor-pointer
          border-border
        `}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Left: Timestamp */}
            <div className="flex-shrink-0 w-20 text-xs text-muted-foreground">
              {formatTimeAgo(turn.timestamp)}
            </div>

            {/* Center: Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Thinking text - collapsible */}
              <Collapsible open={expanded} onOpenChange={setExpanded}>
                <CollapsibleTrigger asChild>
                  <div
                    onClick={handleExpandToggle}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    <p
                      className={`font-mono text-xs whitespace-pre-wrap ${
                        expanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {turn.thinking}
                    </p>
                    {!expanded && turn.thinking.length > 100 && (
                      <button className="text-xs text-muted-foreground hover:text-foreground mt-1 flex items-center gap-0.5">
                        <ChevronDown className="w-3 h-3" />
                        Show more
                      </button>
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {expanded && (
                    <button
                      onClick={handleExpandToggle}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2 flex items-center gap-0.5"
                    >
                      <ChevronUp className="w-3 h-3" />
                      Show less
                    </button>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Tool call badges */}
              {turn.toolCalls && turn.toolCalls.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {turn.toolCalls.map((tc) => (
                    <ToolCallBadge key={tc.id} toolCall={tc} />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Stats */}
            <div className="flex-shrink-0 flex flex-col items-end gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span>{formatTokens(turn.tokensUsed)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                <span>{formatCredits(turn.cost)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(turn.durationMs)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
