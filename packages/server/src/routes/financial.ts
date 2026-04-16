import express from 'express';
import { getDatabaseInstance, getKV } from '../database.js';

interface TransactionRow {
  id: number;
  type: string;
  amount: number;
  from_address: string;
  to_address: string;
  description: string;
  tx_hash: string;
  status: string;
  created_at: string;
}

interface SpendingRow {
  category: string;
  amount: number;
}

interface TimeSeriesRow {
  window_start: string;
  amount: number;
  category: string;
}

export function registerFinancialRoutes(app: express.Application): void {
  // GET /api/financial/summary
  app.get('/api/financial/summary', (_req, res) => {
    try {
      const db = getDatabaseInstance();
      if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
      }

      // Get KV values
      const creditsRaw = getKV('last_known_credits');
      const credits = typeof creditsRaw === 'number' ? creditsRaw : 0;
      const usdcRaw = getKV('usdc');
      const usdc = typeof usdcRaw === 'number' ? usdcRaw : 0;
      const tier = (getKV('tier') as string) || 'free';

      // Calculate spending windows
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      let spendingToday = 0;
      let spendingWeek = 0;
      let spendingMonth = 0;

      try {
        const todayRow = db.prepare(
          "SELECT SUM(amount) as total FROM spend_tracking WHERE window_start >= ?"
        ).get(todayStart) as { total: number } | undefined;
        spendingToday = todayRow?.total || 0;
      } catch {
        // Table may not exist
      }

      try {
        const weekRow = db.prepare(
          "SELECT SUM(amount) as total FROM spend_tracking WHERE window_start >= ?"
        ).get(weekStart) as { total: number } | undefined;
        spendingWeek = weekRow?.total || 0;
      } catch {
        // Table may not exist
      }

      try {
        const monthRow = db.prepare(
          "SELECT SUM(amount) as total FROM spend_tracking WHERE window_start >= ?"
        ).get(monthStart) as { total: number } | undefined;
        spendingMonth = monthRow?.total || 0;
      } catch {
        // Table may not exist
      }

      // Get breakdown by category
      const breakdown: { category: string; amount: number; percentage: number }[] = [];
      try {
        const categoryRows = db.prepare(
          `SELECT category, SUM(amount) as amount 
           FROM spend_tracking 
           WHERE window_start >= ? 
           GROUP BY category`
        ).all(weekStart) as SpendingRow[];

        const totalSpending = categoryRows.reduce((sum, row) => sum + row.amount, 0);

        for (const row of categoryRows) {
          breakdown.push({
            category: row.category,
            amount: row.amount,
            percentage: totalSpending > 0 ? Math.round((row.amount / totalSpending) * 100) : 0,
          });
        }
      } catch {
        // Table may not exist
      }

      // Calculate burn rate (average daily spend over last 7 days)
      let burnRate = 0;
      try {
        const burnRow = db.prepare(
          `SELECT SUM(amount) as total 
           FROM spend_tracking 
           WHERE window_start >= ?`
        ).get(weekStart) as { total: number } | undefined;
        burnRate = burnRow?.total ? burnRow.total / 7 : 0;
      } catch {
        // Table may not exist
      }

      // Calculate projected days left
      const projectedDaysLeft = burnRate > 0 ? Math.floor(credits / burnRate) : null;

      res.json({
        credits,
        usdc,
        tier,
        spending: {
          today: spendingToday,
          week: spendingWeek,
          month: spendingMonth,
        },
        breakdown,
        burnRate: Math.round(burnRate * 100) / 100,
        projectedDaysLeft,
      });
    } catch (error) {
      console.error('Error in /api/financial/summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/financial/transactions?limit=50&offset=0&type=
  app.get('/api/financial/transactions', (req, res) => {
    try {
      const db = getDatabaseInstance();
      if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const type = (req.query.type as string) || '';

      let whereClause = 'WHERE 1=1';
      const params: (string | number)[] = [];

      if (type) {
        whereClause += ' AND type = ?';
        params.push(type);
      }

      let total = 0;
      let transactions: TransactionRow[] = [];

      try {
        // Get total count
        const countRow = db.prepare(
          `SELECT COUNT(*) as count FROM transactions ${whereClause}`
        ).get(...params) as { count: number };
        total = countRow.count;

        // Get paginated transactions
        transactions = db.prepare(
          `SELECT * FROM transactions ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
        ).all(...params, limit, offset) as TransactionRow[];
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Return empty results if table doesn't exist
      }

      res.json({
        data: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          fromAddress: t.from_address,
          toAddress: t.to_address,
          description: t.description,
          txHash: t.tx_hash,
          status: t.status,
          createdAt: t.created_at,
        })),
        total,
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error in /api/financial/transactions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/financial/spending?period=24h|7d|30d
  app.get('/api/financial/spending', (req, res) => {
    try {
      const db = getDatabaseInstance();
      if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
      }

      const period = (req.query.period as string) || '7d';
      let hours = 24 * 7; // default 7d

      switch (period) {
        case '24h':
          hours = 24;
          break;
        case '7d':
          hours = 24 * 7;
          break;
        case '30d':
          hours = 24 * 30;
          break;
        default:
          hours = 24 * 7;
      }

      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const data: { timestamp: string; amount: number; category: string }[] = [];

      try {
        const rows = db.prepare(
          `SELECT window_start as timestamp, amount, category 
           FROM spend_tracking 
           WHERE window_start >= ? 
           ORDER BY window_start ASC`
        ).all(startTime) as TimeSeriesRow[];

        for (const row of rows) {
          data.push({
            timestamp: row.window_start,
            amount: row.amount,
            category: row.category,
          });
        }
      } catch (error) {
        console.error('Error fetching spending data:', error);
        // Return empty array if table doesn't exist
      }

      res.json({
        period,
        data,
      });
    } catch (error) {
      console.error('Error in /api/financial/spending:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
