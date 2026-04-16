import express from 'express';
import crypto from 'crypto';
import { getDatabaseInstance } from '../database.js';

export function registerChatRoutes(app: express.Application): void {
  // send
  app.post('/api/chat/send', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const { message, senderId, relatedTurnId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    try {
      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const status = 'pending'; // or 'unread'
      
      const insert = db.prepare(`
        INSERT INTO inbox_messages (id, message, senderId, relatedTurnId, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insert.run(id, message, senderId || 'user', relatedTurnId || null, status, timestamp);
      
      res.json({ success: true, id, message, status, timestamp });
    } catch (err: any) {
      if (err.message.includes('no such table')) {
         // Create the table automatically or return a friendly error
         return res.status(500).json({ error: 'Inbox mechanism is not initialized on the agent database.' });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // history (combines inbox_messages and related turns)
  app.get('/api/chat/history', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const limit = parseInt(req.query.limit as string) || 20;

    try {
      let inboxMessages: any[] = [];
      let turns: any[] = [];

      try {
        inboxMessages = db.prepare('SELECT * FROM inbox_messages ORDER BY timestamp DESC LIMIT ?').all(limit);
      } catch (e) {
        // ignore if inbox_messages missing
      }

      try {
        turns = db.prepare('SELECT * FROM turns ORDER BY timestamp DESC LIMIT ?').all(limit);
      } catch (e) {
        // ignore if turns missing
      }

      // Combine and sort
      // To properly compare, ensure both have parsing-friendly timestamps or Date objects
      const combined = [...inboxMessages, ...turns];
      combined.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      res.json(combined.slice(0, limit));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
