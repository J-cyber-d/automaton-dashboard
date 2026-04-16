import express from 'express';
import cors from 'cors';
import { getConfig } from './config.js';
import { getDatabase, getIdentity, getKV, closeDatabase } from './database.js';
import { registerAllRoutes } from './routes/index.js';
import { setupWebSocket, closeWebSocket } from './websocket.js';

const config = getConfig();

// Verify database connection on startup
let db;
try {
  db = getDatabase(config.dbPath);
} catch (error) {
  console.error('Failed to start server:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Register all API routes
registerAllRoutes(app);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', dbConnected: true });
});

// Error handling middleware (must be after all routes)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const server = app.listen(config.port, () => {
  // Print startup banner
  const agentName = getIdentity('name') || 'Unknown';
  const address = getIdentity('address') || 'N/A';
  const state = (getKV('state') as string) || 'unknown';
  const credits = (getKV('credits') as number) ?? 0;

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           AUTOMATON DASHBOARD SERVER                     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Agent:    ${agentName.padEnd(48)}║`);
  console.log(`║  Address:  ${address.padEnd(48)}║`);
  console.log(`║  State:    ${state.padEnd(48)}║`);
  console.log(`║  Credits:  ${String(credits).padEnd(48)}║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Server running on http://localhost:${config.port}${' '.repeat(26 - String(config.port).length)}║`);
  console.log(`║  Database: ${config.dbPath.padEnd(48)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Setup WebSocket server after HTTP server is ready
  setupWebSocket(server, config.dbPath);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  closeWebSocket();
  closeDatabase();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  closeWebSocket();
  closeDatabase();
  server.close(() => {
    process.exit(0);
  });
});
