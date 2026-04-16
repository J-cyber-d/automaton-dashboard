'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { SpendingData } from '@/lib/api';
import { formatCredits } from '@/lib/formatters';

interface SpendBreakdownProps {
  data: SpendingData | null;
  loading?: boolean;
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
  transfers: {
    label: 'Transfers',
    color: '#f59e0b', // amber
  },
};

const categoryColors: Record<string, string> = {
  inference: '#6366f1',
  tools: '#3b82f6',
  domains: '#10b981',
  transfers: '#f59e0b',
};

export function SpendBreakdown({ data, loading }: SpendBreakdownProps) {
  if (loading) {
    return (
      <div className="h-[300px] w-full rounded-xl bg-card/50 animate-pulse" />
    );
  }

  // Transform data for stacked bar chart - group by time period and category
  const groupedData = data?.data.reduce((acc: Record<string, Record<string, number>>, point) => {
    const date = new Date(point.timestamp);
    const timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (!acc[timeLabel]) {
      acc[timeLabel] = { inference: 0, tools: 0, domains: 0, transfers: 0 };
    }
    
    const category = point.category.toLowerCase();
    if (acc[timeLabel][category] !== undefined) {
      acc[timeLabel][category] += point.amount;
    } else {
      // Fallback for unknown categories - add to inference
      acc[timeLabel].inference += point.amount;
    }
    
    return acc;
  }, {}) || {};

  // Convert to array format for Recharts
  const chartData = Object.entries(groupedData).map(([time, categories]) => ({
    time,
    ...categories,
  }));

  // Sort by time
  chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig} className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            <Bar dataKey="inference" stackId="a" fill={categoryColors.inference} radius={[0, 0, 0, 0]} />
            <Bar dataKey="tools" stackId="a" fill={categoryColors.tools} radius={[0, 0, 0, 0]} />
            <Bar dataKey="domains" stackId="a" fill={categoryColors.domains} radius={[0, 0, 0, 0]} />
            <Bar dataKey="transfers" stackId="a" fill={categoryColors.transfers} radius={[2, 2, 0, 0]} />
            <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" height={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
