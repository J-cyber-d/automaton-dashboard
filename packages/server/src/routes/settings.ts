import express from 'express';
import fs from 'fs';
import path from 'path';
import { getDatabaseInstance } from '../database.js';
import { getConfig } from '../config.js';

export function registerSettingsRoutes(app: express.Application): void {
  const config = getConfig();

  // automaton.json settings
  app.get('/api/settings', (req, res) => {
    try {
      const settingsPath = path.join(config.automatonDir, 'automaton.json');
      if (!fs.existsSync(settingsPath)) {
        return res.json({});
      }

      const fileContent = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(fileContent);

      // Mask sensitive fields
      const mask = (obj: any) => {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            mask(obj[key]);
          } else if (typeof obj[key] === 'string' && (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret'))) {
            // Mask all but first 4 and last 4 characters if long enough
            const val = obj[key];
            if (val.length > 8) {
              obj[key] = val.substring(0, 4) + '...' + val.substring(val.length - 4);
            } else {
              obj[key] = '********';
            }
          }
        }
      };

      mask(settings);
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // constitution
  app.get('/api/settings/constitution', (req, res) => {
    try {
      const constPath = path.join(config.automatonDir, 'constitution.md');
      if (!fs.existsSync(constPath)) {
        return res.json({ content: '' });
      }

      const content = fs.readFileSync(constPath, 'utf8');
      res.json({ content });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // skills
  app.get('/api/settings/skills', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    try {
      const data = db.prepare('SELECT * FROM skills').all();
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // tools
  app.get('/api/settings/tools', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    try {
      const data = db.prepare('SELECT * FROM installed_tools').all();
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // models
  app.get('/api/settings/models', (req, res) => {
    const db = getDatabaseInstance();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    try {
      const data = db.prepare('SELECT * FROM model_registry').all();
      res.json(data);
    } catch (err: any) {
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      res.status(500).json({ error: err.message });
    }
  });
}
