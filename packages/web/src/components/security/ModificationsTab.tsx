'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Modification, PaginatedResult } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { EmptyState } from '@/components/common/EmptyState';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Shield } from 'lucide-react';

interface ModificationsTabProps {
  modifications: PaginatedResult<Modification>;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ModificationsTab({
  modifications,
  currentPage,
  onPageChange,
}: ModificationsTabProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpanded = (id: number) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'code_edit':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Code Edit</Badge>;
      case 'config_change':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Config Change</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const renderDiffLine = (line: string, index: number) => {
    const isAddition = line.startsWith('+');
    const isRemoval = line.startsWith('-');
    const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

    let bgClass = '';
    if (isAddition) bgClass = 'bg-emerald-500/10';
    else if (isRemoval) bgClass = 'bg-red-500/10';
    else if (isHeader) bgClass = 'bg-muted/50';

    return (
      <div key={index} className={`${bgClass} px-2 py-0.5 font-mono text-xs`}>
        <span className={isAddition ? 'text-emerald-400' : isRemoval ? 'text-red-400' : ''}>
          {line || ' '}
        </span>
      </div>
    );
  };

  const totalPages = Math.ceil(modifications.total / modifications.limit);

  return (
    <div className="space-y-4">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Self-Modifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modifications.data.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No policy decisions"
              description="Self-modifications will appear here when code changes are made"
            />
          ) : (
            modifications.data.map((mod) => (
              <Card key={mod.id} className="bg-background/50">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(mod.type)}
                        <span className="font-mono text-sm text-muted-foreground">
                          {mod.target_file}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Turn{' '}
                        <a
                          href={`/turns/${mod.turn_id}`}
                          className="text-primary hover:underline"
                        >
                          #{mod.turn_id}
                        </a>{' '}
                        • {formatTimeAgo(mod.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-muted-foreground mb-4">
                    Before: {mod.hash_before.substring(0, 8)}... → After:{' '}
                    {mod.hash_after.substring(0, 8)}...
                  </div>

                  <Collapsible
                    open={expandedIds.has(mod.id)}
                    onOpenChange={() => toggleExpanded(mod.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        {expandedIds.has(mod.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Diff
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show Diff
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-4 border rounded-md overflow-hidden bg-background">
                        <div className="max-h-96 overflow-auto">
                          {mod.diff.split('\n').map((line, idx) => renderDiffLine(line, idx))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination */}
          {modifications.data.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {modifications.offset + 1} -{' '}
                {Math.min(modifications.offset + modifications.data.length, modifications.total)} of{' '}
                {modifications.total}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
