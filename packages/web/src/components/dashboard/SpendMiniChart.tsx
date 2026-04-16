'use client';

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { SpendingData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface SpendMiniChartProps {
  data: SpendingData | null;
  loading: boolean;
}

const chartConfig = {
  inference: {
    label: 'Inference',
    color: '#6366f1', // indigo
  },
  tools: {
    label: 'Tools',
    color: '#3b82f6', // blue
  },
  domains: {
    label: 'Domains',
    color: '#10b981', // emerald
  },
};

export function SpendMiniChart({ data, loading }: SpendMiniChartProps) {
  if (loading) {
    return (
      <div className="w-[300px] h-[150px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="w-[300px] h-[150px] flex items-center justify-center text-muted-foreground text-sm">
        No spending data available
      </div>
    );
  }

  // Transform data for stacked area chart
  // Group by timestamp and category
  const grouped = data.data.reduce((acc, item) => {
    const time = new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    if (!acc[time]) {
      acc[time] = { time, inference: 0, tools: 0, domains: 0 };
    }
    acc[time][item.category as 'inference' | 'tools' | 'domains'] += item.amount;
    return acc;
  }, {} as Record<string, { time: string; inference: number; tools: number; domains: number }>);

  const chartData = Object.values(grouped).slice(-24); // Last 24 data points

  return (
    <div className="w-[300px] h-[150px]">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="inferenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="toolsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="domainsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip content={<ChartTooltipContent formatter={(value) => `$${(Number(value) / 100).toFixed(2)}`} />} />
            <Area
              type="monotone"
              dataKey="inference"
              stackId="1"
              stroke="#6366f1"
              fill="url(#inferenceGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="tools"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#toolsGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="domains"
              stackId="1"
              stroke="#10b981"
              fill="url(#domainsGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
