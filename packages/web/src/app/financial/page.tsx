'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/useApi';
import { getFinancialSummary, getSpending, getTransactions } from '@/lib/api';
import { formatCredits, formatAddress } from '@/lib/formatters';
import { BalanceChart } from '@/components/financial/BalanceChart';
import { SpendBreakdown } from '@/components/financial/SpendBreakdown';
import { TransactionTable } from '@/components/financial/TransactionTable';
import { Wallet, Coins, Flame, Clock, Brain } from 'lucide-react';

type Period = '24h' | '7d' | '30d';

export default function FinancialPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [txType, setTxType] = useState<string>('all');
  const [txPage, setTxPage] = useState(1);

  // Fetch financial summary
  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useApi(() => getFinancialSummary(), []);

  // Fetch spending data based on period
  const {
    data: spendingData,
    loading: spendingLoading,
    error: spendingError,
  } = useApi(() => getSpending(period), [period]);

  // Fetch transactions
  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
  } = useApi(
    () => getTransactions({
      limit: 20,
      offset: (txPage - 1) * 20,
      type: txType === 'all' ? undefined : txType,
    }),
    [txPage, txType]
  );

  // Get tier color for styling
  const getTierColorVar = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'premium':
      case 'pro':
        return 'var(--tier-high)';
      case 'standard':
      case 'basic':
        return 'var(--tier-normal)';
      case 'free':
      default:
        return 'var(--tier-low)';
    }
  };

  // Get projected days left color
  const getDaysLeftColor = (days: number | null) => {
    if (days === null) return 'text-muted-foreground';
    if (days < 3) return 'text-destructive';
    if (days < 7) return 'text-warning';
    return 'text-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financial</h1>
        <p className="text-muted-foreground mt-1">
          Financial overview, transactions, and spending analytics
        </p>
      </div>

      {/* Error Display */}
      {(summaryError || spendingError || transactionsError) && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive">
            {summaryError && `Failed to load financial summary: ${summaryError}`}
            {spendingError && ` Failed to load spending data: ${spendingError}`}
            {transactionsError && ` Failed to load transactions: ${transactionsError}`}
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credit Balance */}
        <Card
          className="bg-card/80 backdrop-blur-sm overflow-hidden"
          style={{
            background: summary
              ? `linear-gradient(to bottom right, ${getTierColorVar(summary.tier)}10, transparent)`
              : undefined,
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div
                className="text-2xl font-bold"
                style={{ color: summary ? getTierColorVar(summary.tier) : undefined }}
              >
                {formatCredits(summary?.credits || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Tier: {summary?.tier || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        {/* USDC Balance */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              USDC Balance
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                ${(summary?.usdc || 0).toFixed(2)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {summary ? formatAddress('0x1234567890abcdef1234567890abcdef12345678') : '-'}
            </p>
          </CardContent>
        </Card>

        {/* Daily Burn Rate */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Burn Rate
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCredits(summary?.burnRate || 0)}/day
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Based on 7-day average
            </p>
          </CardContent>
        </Card>

        {/* Projected Days Left */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projected Days Left
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className={`text-2xl font-bold ${getDaysLeftColor(summary?.projectedDaysLeft || null)}`}>
                {summary?.projectedDaysLeft !== null && summary?.projectedDaysLeft !== undefined
                  ? `${summary.projectedDaysLeft} days`
                  : 'N/A'}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              At current burn rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList>
          <TabsTrigger value="24h">24h</TabsTrigger>
          <TabsTrigger value="7d">7d</TabsTrigger>
          <TabsTrigger value="30d">30d</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Chart */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Balance History</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceChart data={spendingData} loading={spendingLoading} />
          </CardContent>
        </Card>

        {/* Spend Breakdown */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Spend Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendBreakdown data={spendingData} loading={spendingLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable
            data={transactionsData}
            loading={transactionsLoading}
            typeFilter={txType}
            onTypeFilterChange={(type) => {
              setTxType(type);
              setTxPage(1);
            }}
            page={txPage}
            onPageChange={setTxPage}
          />
        </CardContent>
      </Card>

      {/* Inference Cost Section */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Inference Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Model</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Total Tokens</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2">GPT-4</td>
                    <td className="px-4 py-2 text-right">1,245,890</td>
                    <td className="px-4 py-2 text-right">{formatCredits(45230)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Claude 3.5 Sonnet</td>
                    <td className="px-4 py-2 text-right">892,456</td>
                    <td className="px-4 py-2 text-right">{formatCredits(28450)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">GPT-3.5 Turbo</td>
                    <td className="px-4 py-2 text-right">2,156,234</td>
                    <td className="px-4 py-2 text-right">{formatCredits(12450)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
