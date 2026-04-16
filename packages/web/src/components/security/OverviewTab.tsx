'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SecurityStats } from '@/lib/api';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface OverviewTabProps {
  stats: SecurityStats;
}

export function OverviewTab({ stats }: OverviewTabProps) {
  const total = stats.total_decisions || 1;
  const allowedPct = ((stats.allowed / total) * 100).toFixed(1);
  const deniedPct = ((stats.denied / total) * 100).toFixed(1);

  // Safe access to risk_breakdown with defaults
  const riskBreakdown = stats.risk_breakdown ?? { safe: 0, caution: 0, dangerous: 0, forbidden: 0 };

  const riskTotal =
    riskBreakdown.safe +
    riskBreakdown.caution +
    riskBreakdown.dangerous +
    riskBreakdown.forbidden;

  const getRiskWidth = (value: number) => {
    if (riskTotal === 0) return 0;
    return (value / riskTotal) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_decisions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Allowed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              {stats.allowed.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-2">({allowedPct}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Denied</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {stats.denied.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-2">({deniedPct}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Self-Modifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.modifications_count.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Level Breakdown */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Risk Level Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 w-full rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${getRiskWidth(riskBreakdown.safe)}%` }}
              title={`Safe: ${riskBreakdown.safe}`}
            />
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${getRiskWidth(riskBreakdown.caution)}%` }}
              title={`Caution: ${riskBreakdown.caution}`}
            />
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${getRiskWidth(riskBreakdown.dangerous)}%` }}
              title={`Dangerous: ${riskBreakdown.dangerous}`}
            />
            <div
              className="h-full bg-gray-700 transition-all"
              style={{ width: `${getRiskWidth(riskBreakdown.forbidden)}%` }}
              title={`Forbidden: ${riskBreakdown.forbidden}`}
            />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Safe: {riskBreakdown.safe}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Caution: {riskBreakdown.caution}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Dangerous: {riskBreakdown.dangerous}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-700" />
              <span>Forbidden: {riskBreakdown.forbidden}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Denied Tools */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Top Denied Tools</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.top_denied_tools.length === 0 ? (
              <p className="text-muted-foreground text-sm">No denied tools</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool Name</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.top_denied_tools.map((tool, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{tool.tool}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">{tool.count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Injection Attempts Alert */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Injection Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.injection_attempts > 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  {stats.injection_attempts} injection attempt{stats.injection_attempts !== 1 ? 's' : ''} detected
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-emerald-500/50 text-emerald-500">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Secure</AlertTitle>
                <AlertDescription>No injection attempts detected</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
