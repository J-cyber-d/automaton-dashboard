'use client';

import { cn } from '@/lib/utils';

const stateConfig = {
  running: { label: 'Running', dotClass: 'bg-emerald-500', pulse: true },
  idle: { label: 'Sleeping', dotClass: 'bg-gray-500', pulse: false },
  paused: { label: 'Paused', dotClass: 'bg-gray-500', pulse: false },
  error: { label: 'Error', dotClass: 'bg-red-500', pulse: false },
};

interface LiveIndicatorProps {
  state: keyof typeof stateConfig;
  showLabel?: boolean;
  className?: string;
}

export function LiveIndicator({ state, showLabel = true, className }: LiveIndicatorProps) {
  const config = stateConfig[state] || stateConfig.idle;
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-[pulse-live_2s_ease-in-out_infinite]', config.dotClass)} />
        )}
        <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', config.dotClass)} />
      </span>
      {showLabel && <span className="text-xs text-muted-foreground">{config.label}</span>}
    </span>
  );
}
