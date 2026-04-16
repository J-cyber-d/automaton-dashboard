import express from 'express';
import { registerStatusRoutes } from './status.js';
import { registerTurnRoutes } from './turns.js';
import { registerFinancialRoutes } from './financial.js';
import { registerMemoryRoutes } from './memory.js';
import { registerSoulRoutes } from './soul.js';
import { registerHeartbeatRoutes } from './heartbeat.js';
import { registerChildrenRoutes } from './children.js';
import { registerSecurityRoutes } from './security.js';
import { registerChatRoutes } from './chat.js';
import { registerSettingsRoutes } from './settings.js';

export function registerAllRoutes(app: express.Application): void {
  registerStatusRoutes(app);
  registerTurnRoutes(app);
  registerFinancialRoutes(app);
  registerMemoryRoutes(app);
  registerSoulRoutes(app);
  registerHeartbeatRoutes(app);
  registerChildrenRoutes(app);
  registerSecurityRoutes(app);
  registerChatRoutes(app);
  registerSettingsRoutes(app);
}
