import express from 'express';
import { getDatabaseInstance, queryPaginated } from '../database.js';

export function registerMemoryRoutes(app: express.Application): void {
  // working
  app.get('/api/memory/working', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const status = req.query.status as string;
    
    try {
      let query = 'SELECT * FROM working_memory';
      const params: any[] = [];
      
      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }
      query += ' ORDER BY timestamp DESC';
      
      const data = db.prepare(query).all(...params);
      res.json(data);
    } catch (err: any) {
      if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // episodic
  app.get('/api/memory/episodic', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const limit = parseInt(req.query.limit as string) || 20;
    const importance = req.query.importance ? parseInt(req.query.importance as string) : undefined;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const where: Record<string, any> = {};
      if (importance !== undefined) {
        where.importance = importance;
      }

      const result = queryPaginated('episodic_memory', {
        limit,
        offset,
        where,
        orderBy: 'timestamp',
        orderDirection: 'DESC'
      });
      res.json(result);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json({ data: [], total: 0, limit, offset });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // semantic
  app.get('/api/memory/semantic', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const category = req.query.category as string;
    
    try {
      let query = 'SELECT * FROM semantic_memory';
      const params: any[] = [];
      
      if (category) {
        query += ' WHERE category = ?';
        params.push(category);
      }
      
      const statements = db.prepare(query).all(...params);
      
      // The user requested grouping by category. Let's send it grouped if no specific category was requested
      if (!category) {
        const grouped = (statements as any[]).reduce((acc, curr) => {
          const cat = curr.category || 'uncategorized';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(curr);
          return acc;
        }, {} as Record<string, any[]>);
        return res.json(grouped);
      }
      
      res.json(statements);
    } catch (err: any) {
      if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // procedural
  app.get('/api/memory/procedural', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    try {
      const data = db.prepare('SELECT * FROM procedural_memory ORDER BY success_rate DESC').all();
      res.json(data);
    } catch (err: any) {
      if (err.code === 'SQLITE_ERROR' && (err.message.includes('no such table') || err.message.includes('no such column'))) {
        try {
            // fallback without ordering by success_rate if it doesn't exist
            const data = db.prepare('SELECT * FROM procedural_memory').all();
            return res.json(data);
        } catch (innerErr: any) {
             if (innerErr.message.includes('no such table')) return res.json([]);
             return res.status(500).json({ error: innerErr.message });
        }
      }
      res.status(500).json({ error: err.message });
    }
  });

  // relationships
  app.get('/api/memory/relationships', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    try {
      const data = db.prepare('SELECT * FROM relationship_memory').all();
      res.json(data);
    } catch (err: any) {
      if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // stats
  app.get('/api/memory/stats', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const getCount = (table: string) => {
      try {
        const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
        return result?.count || 0;
      } catch (e: any) {
        return 0; // table probably doesn't exist
      }
    };

    const stats = {
      working: getCount('working_memory'),
      episodic: getCount('episodic_memory'),
      semantic: getCount('semantic_memory'),
      procedural: getCount('procedural_memory'),
      relationships: getCount('relationship_memory'),
    };

    res.json(stats);
  });
}
