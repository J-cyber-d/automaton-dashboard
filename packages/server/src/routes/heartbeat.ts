import express from 'express';
import { getDatabaseInstance } from '../database.js';

export function registerHeartbeatRoutes(app: express.Application): void {
  // schedule
  app.get('/api/heartbeat/schedule', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    try {
      const data = db.prepare('SELECT * FROM heartbeat_schedule ORDER BY scheduledAt ASC').all();
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table') || err.message.includes('no such column')) {
        try {
            const data = db.prepare('SELECT * FROM heartbeat_schedule').all();
            return res.json(data);
        } catch (inner) {
            return res.json([]);
        }
      }
      res.status(500).json({ error: err.message });
    }
  });

  // history
  app.get('/api/heartbeat/history', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const limit = parseInt(req.query.limit as string) || 50;
    const task = req.query.task as string;
    
    try {
      let query = 'SELECT * FROM heartbeat_history';
      const params: any[] = [];
      
      if (task) {
        query += ' WHERE task = ?';
        params.push(task);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      const data = db.prepare(query).all(...params);
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      if (err.message.includes('no such column')) {
           try {
               let fallbackQuery = 'SELECT * FROM heartbeat_history';
               let fallbackData = db.prepare(fallbackQuery).all();
               // Naive filter and slice since column queries might differ
               if (task) {
                   fallbackData = fallbackData.filter((r: any) => r.task === task || r.taskType === task);
               }
               return res.json(fallbackData.slice(0, limit));
           } catch {
               return res.json([]);
           }
      }
      res.status(500).json({ error: err.message });
    }
  });

  // wake-events
  app.get('/api/heartbeat/wake-events', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const limit = parseInt(req.query.limit as string) || 20;

    try {
      // Assuming a timestamp column exists
      let data = [];
      try {
           data = db.prepare('SELECT * FROM wake_events ORDER BY timestamp DESC LIMIT ?').all(limit);
      } catch {
           data = db.prepare('SELECT * FROM wake_events LIMIT ?').all(limit);
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
