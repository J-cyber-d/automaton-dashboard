'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Turn, ToolCall } from '@/lib/api';
import {
  formatTimeAgo,
  formatDuration,
  formatCredits,
  formatTokens,
} from '@/lib/formatters';
import { ToolCallBadge } from './ToolCallBadge';
import { Clock, Coins, Hash, Cpu, User } from 'lucide-react';

interface TurnDetailProps {
  turn: Turn | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getSourceColor(source: string): string {
  switch (source.toLowerCase()) {
    case 'self':
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    case 'creator':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'peer':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function ToolCallDetail({ toolCall }: { toolCall: ToolCall }) {
  const hasError = toolCall.status === 'error';

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ToolCallBadge toolCall={toolCall} />
          {hasError && (
            <Badge variant="destructive" className="text-xs">
              Error
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDuration(toolCall.durationMs)}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Arguments:</p>
        <pre className="text-xs font-mono bg-background rounded p-2 overflow-x-auto text-foreground">
          {JSON.stringify(toolCall.arguments, null, 2)}
        </pre>
      </div>

      {toolCall.result && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Result:</p>
          <pre className="text-xs font-mono bg-background rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground">
            {toolCall.result}
          </pre>
        </div>
      )}


    </div>
  );
}

export function TurnDetail({ turn, open, onOpenChange }: TurnDetailProps) {
  if (!turn) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <span>Turn #{turn.id}</span>
            <Badge variant="outline" className={getSourceColor(turn.inputSource)}>
              <User className="w-3 h-3 mr-1" />
              {turn.inputSource}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timing Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(turn.timestamp)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">Duration:</span>
              <span>{formatDuration(turn.durationMs)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              <span>{formatTokens(turn.tokensUsed)} tokens</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4" />
              <span>{formatCredits(turn.cost)}</span>
            </div>
            {turn.model && (
              <div className="flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                <span>{turn.model}</span>
              </div>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Thinking */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Thinking</h4>
            <pre className="text-sm font-mono bg-muted rounded-lg p-4 overflow-x-auto whitespace-pre-wrap text-foreground">
              {turn.thinking}
            </pre>
          </div>

          <Separator className="bg-border" />

          {/* Tool Calls */}
          {turn.toolCalls && turn.toolCalls.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Tool Calls ({turn.toolCalls.length})
              </h4>
              <div className="space-y-3">
                {turn.toolCalls.map((tc) => (
                  <ToolCallDetail key={tc.id} toolCall={tc} />
                ))}
              </div>
            </div>
          )}

          {(!turn.toolCalls || turn.toolCalls.length === 0) && (
            <p className="text-sm text-muted-foreground italic">
              No tool calls in this turn
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
