import express from 'express';
import fs from 'fs';
import path from 'path';
import { getDatabaseInstance } from '../database.js';
import { getConfig } from '../config.js';

export function registerSoulRoutes(app: express.Application): void {
  const config = getConfig();

  // current
  app.get('/api/soul/current', (req, res) => {
    let soulContent = '';
    const soulPath = path.join(config.automatonDir, 'SOUL.md');
    
    if (fs.existsSync(soulPath)) {
      try {
        soulContent = fs.readFileSync(soulPath, 'utf8');
      } catch (err) {
        console.error('Error reading SOUL.md', err);
      }
    }

    const db = getDatabaseInstance();
    let latestHistory = null;
    
    if (db) {
      try {
        // Assume timestamp or id can be used to order
        const query = 'SELECT * FROM soul_history ORDER BY id DESC LIMIT 1';
        latestHistory = db.prepare(query).get() || null;
      } catch (err: any) {
        // table might not exist
        if (!err.message.includes('no such table') && !err.message.includes('no such column')) {
           try {
               // Try ordering by timestamp if id doesn't exist
               latestHistory = db.prepare('SELECT * FROM soul_history ORDER BY timestamp DESC LIMIT 1').get() || null;
           } catch {
               // Ignore
           }
        }
      }
    }

    res.json({
      content: soulContent,
      latestHistory,
    });
  });

  // history
  app.get('/api/soul/history', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const limit = parseInt(req.query.limit as string) || 10;
    
    try {
      // Order safely mapping the schema variations
      let query = 'SELECT * FROM soul_history ORDER BY id DESC LIMIT ?';
      let data = [];
      try {
           data = db.prepare(query).all(limit);
      } catch (e: any) {
           query = 'SELECT * FROM soul_history ORDER BY timestamp DESC LIMIT ?';
           data = db.prepare(query).all(limit);
      }
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // diff
  app.get('/api/soul/diff', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const fromId = req.query.from;
    const toId = req.query.to;

    if (!fromId || !toId) {
      return res.status(400).json({ error: 'Missing from or to parameters' });
    }

    try {
      const fromObj = db.prepare('SELECT * FROM soul_history WHERE id = ?').get(fromId);
      const toObj = db.prepare('SELECT * FROM soul_history WHERE id = ?').get(toId);
      
      res.json({
        from: fromObj || null,
        to: toObj || null
      });
    } catch (err: any) {
      if (err.message.includes('no such table') || err.message.includes('no such column')) {
        return res.json({ from: null, to: null });
      }
      res.status(500).json({ error: err.message });
    }
  });
}
