'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, Legend } from 'recharts';

// Chart config type
export type ChartConfig = Record<string, {
  label?: string;
  color?: string;
  icon?: React.ComponentType;
}>;

// Context for chart config
const ChartContext = React.createContext<ChartConfig | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('useChart must be used within a ChartContainer');
  return context;
}

// ChartContainer wraps Recharts ResponsiveContainer
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
}

export function ChartContainer({ config, children, className, ...props }: ChartContainerProps) {
  // Set CSS variables from config
  const style = Object.entries(config).reduce((acc, [key, value]) => {
    if (value.color) {
      acc[`--color-${key}` as string] = value.color;
    }
    return acc;
  }, {} as Record<string, string>);

  return (
    <ChartContext.Provider value={config}>
      <div className={cn('w-full', className)} style={style} {...props}>
        <div className="w-full h-full [&_.recharts-surface]:outline-none">
          {children}
        </div>
      </div>
    </ChartContext.Provider>
  );
}

// ChartTooltip is just re-exported from recharts
export { Tooltip as ChartTooltip } from 'recharts';

// ChartTooltipContent
interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  hideLabel?: boolean;
  formatter?: (value: number, name: string) => React.ReactNode;
  className?: string;
}

export function ChartTooltipContent({ active, payload, label, hideLabel, formatter, className }: ChartTooltipContentProps) {
  const config = React.useContext(ChartContext);
  if (!active || !payload?.length) return null;

  return (
    <div className={cn('rounded-lg border bg-card p-2 shadow-md', className)}>
      {!hideLabel && label && <div className="mb-1 text-xs text-muted-foreground">{label}</div>}
      <div className="flex flex-col gap-1">
        {payload.map((item, i) => {
          const itemConfig = config?.[item.dataKey];
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
              <span className="ml-auto font-medium">
                {formatter ? formatter(item.value, item.name) : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ChartLegend (re-export)
export { Legend as ChartLegend } from 'recharts';

// ChartLegendContent
interface ChartLegendContentProps {
  payload?: Array<{ value: string; color: string; dataKey?: string }>;
  className?: string;
}

export function ChartLegendContent({ payload, className }: ChartLegendContentProps) {
  const config = React.useContext(ChartContext);
  if (!payload?.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-xs', className)}>
      {payload.map((item, i) => {
        const itemConfig = config?.[item.dataKey || item.value];
        return (
          <div key={i} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{itemConfig?.label || item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
