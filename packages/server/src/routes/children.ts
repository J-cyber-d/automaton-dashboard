import express from 'express';
import { getDatabaseInstance } from '../database.js';

export function registerChildrenRoutes(app: express.Application): void {
  // children list + stats
  app.get('/api/children', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    try {
      const children = db.prepare('SELECT * FROM children').all();
      
      const stats = {
        total: children.length,
        active: children.filter((c: any) => c.state === 'active').length,
        inactive: children.filter((c: any) => c.state === 'inactive' || c.state === 'completed').length,
        failed: children.filter((c: any) => c.state === 'failed').length
      };

      res.json({
        data: children,
        stats
      });
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json({ data: [], stats: { total: 0, active: 0, inactive: 0, failed: 0 } });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // lifecycle
  app.get('/api/children/:id/lifecycle', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const childId = req.params.id;

    try {
      let query = 'SELECT * FROM child_lifecycle_events WHERE child_id = ? ORDER BY timestamp ASC';
      let data = [];
      try {
           data = db.prepare(query).all(childId);
      } catch {
           // Maybe column is childId, handle naming variations
           query = 'SELECT * FROM child_lifecycle_events WHERE childId = ? ORDER BY timestamp ASC';
           data = db.prepare(query).all(childId);
      }
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });
}
