'use client';

import { Bot, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/formatters';
import type { ChatMessage } from '@/lib/api';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const statusConfig = {
    queued: { variant: 'secondary' as const, label: 'Queued', pulse: false },
    processing: { variant: 'default' as const, label: 'Processing', pulse: true },
    processed: { variant: 'outline' as const, label: 'Processed', pulse: false },
  };

  const status = statusConfig[message.status];

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600/30' : 'bg-muted'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-indigo-400" />
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`rounded-2xl px-4 py-2.5 border ${
            isUser
              ? 'bg-indigo-600/20 border-indigo-500/30 text-foreground'
              : 'bg-card border-border text-foreground'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(message.timestamp)}
          </span>
          <Badge
            variant={status.variant}
            className={`text-[10px] px-1.5 py-0 h-4 ${
              status.pulse ? 'animate-pulse bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''
            }`}
          >
            {status.label}
          </Badge>
        </div>

        {/* Info text for queued messages */}
        {message.status === 'queued' && isUser && (
          <p className="text-xs text-muted-foreground mt-1 italic">
            Agent will process this on next inbox check (~2 min)
          </p>
        )}
      </div>
    </div>
  );
}
