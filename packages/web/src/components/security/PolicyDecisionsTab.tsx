'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PolicyDecision, PaginatedResult } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { EmptyState } from '@/components/common/EmptyState';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';

interface PolicyDecisionsTabProps {
  decisions: PaginatedResult<PolicyDecision>;
  currentPage: number;
  onPageChange: (page: number) => void;
  decisionFilter: string;
  onDecisionFilterChange: (value: string) => void;
  toolFilter: string;
  onToolFilterChange: (value: string) => void;
}

export function PolicyDecisionsTab({
  decisions,
  currentPage,
  onPageChange,
  decisionFilter,
  onDecisionFilterChange,
  toolFilter,
  onToolFilterChange,
}: PolicyDecisionsTabProps) {
  const [selectedDecision, setSelectedDecision] = useState<PolicyDecision | null>(null);

  const uniqueTools = useMemo(() => {
    const tools = new Set<string>();
    decisions.data.forEach((d) => tools.add(d.tool_name));
    return Array.from(tools).sort();
  }, [decisions.data]);

  const getDecisionBadge = (decision: string) => {
    if (decision === 'allow') {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Allow</Badge>;
    }
    return <Badge variant="destructive">Deny</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Safe</Badge>;
      case 'caution':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Caution</Badge>;
      case 'dangerous':
        return <Badge className="bg-red-500 hover:bg-red-600">Dangerous</Badge>;
      case 'forbidden':
        return <Badge className="bg-gray-700 hover:bg-gray-600">Forbidden</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const totalPages = Math.ceil(decisions.total / decisions.limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Decision:</span>
              <Select value={decisionFilter} onValueChange={onDecisionFilterChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="allow">Allow</SelectItem>
                  <SelectItem value="deny">Deny</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tool:</span>
              <Select value={toolFilter} onValueChange={onToolFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Tools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tools</SelectItem>
                  {uniqueTools.map((tool) => (
                    <SelectItem key={tool} value={tool}>
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Policy Decisions Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8">
                      <EmptyState
                        icon={Shield}
                        title="No policy decisions"
                        description="Policy decisions will appear here when tools are evaluated"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  decisions.data.map((decision) => (
                    <TableRow
                      key={decision.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedDecision(decision)}
                    >
                      <TableCell>{formatTimeAgo(decision.timestamp)}</TableCell>
                      <TableCell className="font-medium">{decision.tool_name}</TableCell>
                      <TableCell>{getDecisionBadge(decision.decision)}</TableCell>
                      <TableCell>{getRiskBadge(decision.risk_level)}</TableCell>
                      <TableCell className="font-mono text-xs">{decision.rule}</TableCell>
                      <TableCell className="max-w-xs truncate">{decision.reason}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {decisions.offset + 1} -{' '}
              {Math.min(decisions.offset + decisions.data.length, decisions.total)} of{' '}
              {decisions.total}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDecision} onOpenChange={() => setSelectedDecision(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Policy Decision Details</DialogTitle>
            <DialogDescription>
              Decision ID: {selectedDecision?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedDecision && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Tool</span>
                  <p className="font-medium">{selectedDecision.tool_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Timestamp</span>
                  <p className="font-medium">{new Date(selectedDecision.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Decision</span>
                  <div className="mt-1">{getDecisionBadge(selectedDecision.decision)}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <div className="mt-1">{getRiskBadge(selectedDecision.risk_level)}</div>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Rule</span>
                <p className="font-mono text-sm bg-muted p-2 rounded mt-1">{selectedDecision.rule}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Reason</span>
                <p className="text-sm bg-muted p-2 rounded mt-1">{selectedDecision.reason}</p>
              </div>
              {selectedDecision.details && (
                <div>
                  <span className="text-sm text-muted-foreground">Details</span>
                  <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-60">
                    {selectedDecision.details}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
