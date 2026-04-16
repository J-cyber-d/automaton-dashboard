'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Transaction, PaginatedResult } from '@/lib/api';
import { formatCredits, formatTimeAgo, formatAddress } from '@/lib/formatters';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowUpDown, ChevronLeft, ChevronRight, ExternalLink, Receipt } from 'lucide-react';

interface TransactionTableProps {
  data: PaginatedResult<Transaction> | null;
  loading?: boolean;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

type SortField = 'time' | 'amount';
type SortDir = 'asc' | 'desc';

export function TransactionTable({
  data,
  loading,
  typeFilter,
  onTypeFilterChange,
  page,
  onPageChange,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const transactions = data?.data || [];
  const total = data?.total || 0;
  const limit = data?.limit || 20;
  const totalPages = Math.ceil(total / limit);

  // Sort transactions locally
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      if (sortField === 'time') {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortDir === 'asc' ? aTime - bTime : bTime - aTime;
      } else {
        return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });
    return sorted;
  }, [transactions, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getTxTypeBadge = (type: string) => {
    const isCredit = type.toLowerCase() === 'credit';
    return (
      <Badge variant={isCredit ? 'default' : 'destructive'} className="capitalize">
        {type}
      </Badge>
    );
  };

  const truncateHash = (hash: string) => {
    if (!hash || hash.length < 20) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="rounded-xl border">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {total} transactions
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card/80 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('time')}
              >
                <div className="flex items-center gap-1">
                  Time
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  Amount
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tx Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8">
                  <EmptyState
                    icon={Receipt}
                    title="No transactions"
                    description="Transactions will appear here when financial activity occurs"
                  />
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {formatTimeAgo(tx.createdAt)}
                  </TableCell>
                  <TableCell>{getTxTypeBadge(tx.type)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCredits(tx.amount)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={tx.description}>
                    {tx.description}
                  </TableCell>
                  <TableCell>
                    {tx.txHash ? (
                      <a
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {truncateHash(tx.txHash)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
