import express from 'express';
import { getDatabaseInstance, getIdentity, getKV } from '../database.js';

export function registerStatusRoutes(app: express.Application): void {
  app.get('/api/status', (_req, res) => {
    try {
      const db = getDatabaseInstance();
      if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
      }

      // Get identity values
      const name = getIdentity('name') || 'Unknown';
      const address = getIdentity('address') || '';
      const creator = getIdentity('creator') || '';
      const version = getIdentity('version') || '';

      // Get KV values
      const state = (getKV('agent_state') as string) || 'unknown';
      const creditsRaw = getKV('last_known_credits');
      const credits = typeof creditsRaw === 'number' ? creditsRaw : 0;
      const tier = (getKV('tier') as string) || 'free';
      const usdcRaw = getKV('usdc');
      const usdc = typeof usdcRaw === 'number' ? usdcRaw : 0;

      // Get counts from tables (handle missing tables gracefully)
      let totalTurns = 0;
      let childrenAlive = 0;
      let childrenTotal = 0;
      let skillsActive = 0;
      let lastActivity: string | null = null;

      try {
        const turnsCount = db.prepare('SELECT COUNT(*) as count FROM turns').get() as { count: number };
        totalTurns = turnsCount.count;
      } catch {
        // Table may not exist
      }

      try {
        const childrenAliveCount = db.prepare("SELECT COUNT(*) as count FROM children WHERE state = 'active'").get() as { count: number };
        childrenAlive = childrenAliveCount.count;
      } catch {
        // Table may not exist
      }

      try {
        const childrenCount = db.prepare('SELECT COUNT(*) as count FROM children').get() as { count: number };
        childrenTotal = childrenCount.count;
      } catch {
        // Table may not exist
      }

      try {
        const skillsCount = db.prepare('SELECT COUNT(*) as count FROM skills WHERE enabled = 1').get() as { count: number };
        skillsActive = skillsCount.count;
      } catch {
        // Table may not exist
      }

      try {
        const lastTurn = db.prepare('SELECT timestamp FROM turns ORDER BY timestamp DESC LIMIT 1').get() as { timestamp: string } | undefined;
        lastActivity = lastTurn?.timestamp || null;
      } catch {
        // Table may not exist
      }

      res.json({
        name,
        address,
        creator,
        state,
        tier,
        credits,
        usdc,
        totalTurns,
        childrenAlive,
        childrenTotal,
        skillsActive,
        version,
        lastActivity,
      });
    } catch (error) {
      console.error('Error in /api/status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
