'use client';

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { SpendingData } from '@/lib/api';
import { formatCredits } from '@/lib/formatters';

interface BalanceChartProps {
  data: SpendingData | null;
  loading?: boolean;
}

const chartConfig = {
  credits: {
    label: 'Credits',
    color: '#6366f1',
  },
};

export function BalanceChart({ data, loading }: BalanceChartProps) {
  if (loading) {
    return (
      <div className="h-[300px] w-full rounded-xl bg-card/50 animate-pulse" />
    );
  }

  // Transform data for the chart - aggregate by timestamp
  const chartData = data?.data.reduce((acc: Array<{ time: string; credits: number }>, point) => {
    const date = new Date(point.timestamp);
    const timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.time === timeLabel);
    if (existing) {
      existing.credits += point.amount;
    } else {
      acc.push({ time: timeLabel, credits: point.amount });
    }
    return acc;
  }, []) || [];

  // Sort by time
  chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig} className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: number) => formatCredits(value)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="credits"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorCredits)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
