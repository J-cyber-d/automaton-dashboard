import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getConfig } from './config.js';
import { getDatabase, getIdentity, getKV, closeDatabase } from './database.js';
import { registerAllRoutes } from './routes/index.js';
import { setupWebSocket, closeWebSocket } from './websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI arguments
const cliArgs = process.argv.slice(2);
if (cliArgs.includes('--help') || cliArgs.includes('-h')) {
  console.log(`
automaton-dashboard - Web dashboard for Automaton agents

Usage: automaton-dashboard [options]

Options:
  --port <port>    Port to listen on (default: 4820, env: DASHBOARD_PORT)
  --db <path>      Path to state.db (default: ~/.automaton/state.db, env: AUTOMATON_DB_PATH)
  --help, -h       Show this help message
  --version, -v    Show version number
`);
  process.exit(0);
}
if (cliArgs.includes('--version') || cliArgs.includes('-v')) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    console.log(`automaton-dashboard v${pkg.version}`);
  } catch {
    console.log('automaton-dashboard v1.0.0');
  }
  process.exit(0);
}

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

// Serve static frontend files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Register all API routes
registerAllRoutes(app);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', dbConnected: true });
});

// SPA fallback: serve index.html for any non-API, non-WS route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
    res.sendFile(path.join(publicDir, 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
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
