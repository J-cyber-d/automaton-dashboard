import express from 'express';
import { getDatabaseInstance } from '../database.js';

export function registerSecurityRoutes(app: express.Application): void {
  // policy decisions
  app.get('/api/security/policy-decisions', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const limit = parseInt(req.query.limit as string) || 50;
    const decision = req.query.decision as string;
    const tool = req.query.tool as string;

    try {
      let query = 'SELECT * FROM policy_decisions';
      const params: any[] = [];
      const conditions: string[] = [];
      
      if (decision) {
        conditions.push('decision = ?');
        params.push(decision);
      }
      
      if (tool) {
        // Checking for tool field, which could be 'tool' or embedded in 'policy'
        conditions.push('policy LIKE ?');
        params.push(`%${tool}%`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      const data = db.prepare(query).all(...params);
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // modifications
  app.get('/api/security/modifications', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const limit = parseInt(req.query.limit as string) || 50;

    try {
      // Assuming security_modifications table or similar exists
      const data = db.prepare('SELECT * FROM security_modifications ORDER BY timestamp DESC LIMIT ?').all(limit);
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // stats
  app.get('/api/security/stats', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    try {
      const stats = {
        total_decisions: 0,
        allowed: 0,
        denied: 0,
        reviewed: 0,
        modifications: 0
      };

      try {
        const decisions = db.prepare('SELECT decision, COUNT(*) as count FROM policy_decisions GROUP BY decision').all() as any[];
        decisions.forEach(d => {
          stats.total_decisions += d.count;
          if (d.decision === 'allow') stats.allowed = d.count;
          if (d.decision === 'deny') stats.denied = d.count;
          if (d.decision === 'review') stats.reviewed = d.count;
        });
      } catch (e) {
        // ignore if table missing
      }

      try {
        const mods = db.prepare('SELECT COUNT(*) as count FROM security_modifications').get() as any;
        stats.modifications = mods?.count || 0;
      } catch (e) {
        // ignore if table missing
      }

      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
