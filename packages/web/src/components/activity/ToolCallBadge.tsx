'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ToolCall } from '@/lib/api';
import { Check, X } from 'lucide-react';

interface ToolCallBadgeProps {
  toolCall: ToolCall;
}

const DANGEROUS_TOOLS = ['execute_code', 'shell', 'write_file', 'delete'];
const CAUTION_TOOLS = ['http_request', 'browser', 'edit_file'];

function getRiskLevel(toolName: string): 'safe' | 'caution' | 'dangerous' {
  if (DANGEROUS_TOOLS.includes(toolName)) return 'dangerous';
  if (CAUTION_TOOLS.includes(toolName)) return 'caution';
  return 'safe';
}

function getRiskStyles(riskLevel: 'safe' | 'caution' | 'dangerous') {
  switch (riskLevel) {
    case 'dangerous':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'caution':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'safe':
    default:
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
}

export function ToolCallBadge({ toolCall }: ToolCallBadgeProps) {
  const riskLevel = getRiskLevel(toolCall.name);
  const hasError = toolCall.status === 'error';
  const resultPreview = toolCall.result
    ? toolCall.result.slice(0, 100) + (toolCall.result.length > 100 ? '...' : '')
    : 'No result';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${getRiskStyles(riskLevel)} text-xs font-medium px-2 py-0.5 cursor-help flex items-center gap-1`}
          >
            {hasError ? (
              <X className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            {toolCall.name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-popover border-border"
        >
          <div className="space-y-1">
            <p className="font-medium text-foreground">{toolCall.name}</p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {resultPreview}
            </p>
            {toolCall.durationMs > 0 && (
              <p className="text-xs text-muted-foreground">
                Duration: {toolCall.durationMs}ms
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
