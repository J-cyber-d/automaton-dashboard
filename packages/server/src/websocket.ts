import { WebSocketServer, WebSocket } from 'ws';
import { watch } from 'chokidar';
import type { Server } from 'http';
import { getDatabaseInstance, getKV } from './database.js';

let wss: WebSocketServer | null = null;
let watcher: ReturnType<typeof watch> | null = null;

// Track last seen IDs for each table
const lastSeenIds = {
  turns: 0,
  heartbeat_history: 0,
  wake_events: 0,
  child_lifecycle_events: 0,
};

/**
 * Initialize last seen IDs by querying MAX(id) from each table
 * Handles missing tables gracefully by setting ID to 0
 */
function initializeLastSeenIds(): void {
  const db = getDatabaseInstance();
  if (!db) {
    console.error('Database not initialized when initializing last seen IDs');
    return;
  }

  const tables: (keyof typeof lastSeenIds)[] = ['turns', 'heartbeat_history', 'wake_events', 'child_lifecycle_events'];

  for (const table of tables) {
    try {
      const stmt = db.prepare(`SELECT MAX(id) as maxId FROM ${table}`);
      const row = stmt.get() as { maxId: number | null } | undefined;
      lastSeenIds[table] = row?.maxId ?? 0;
    } catch {
      // Table doesn't exist yet, keep at 0
      lastSeenIds[table] = 0;
    }
  }
}

/**
 * Get current status from KV store
 */
function getCurrentStatus(): { state: string; credits: number; tier: string } {
  const state = (getKV('state') as string) ?? 'unknown';
  const credits = (getKV('credits') as number) ?? 0;
  const tier = (getKV('tier') as string) ?? 'unknown';

  return { state, credits, tier };
}

/**
 * Broadcast data to all connected WebSocket clients
 */
function broadcast(data: object): void {
  if (!wss) return;

  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Query and broadcast new rows from a table
 */
function broadcastNewRows<T extends { id: number }>(
  table: keyof typeof lastSeenIds,
  type: string
): void {
  const db = getDatabaseInstance();
  if (!db) return;

  try {
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE id > ? ORDER BY id ASC`);
    const rows = stmt.all(lastSeenIds[table]) as T[];

    for (const row of rows) {
      broadcast({ type, data: row });
      // Update last seen ID for this row
      if (row.id > lastSeenIds[table]) {
        lastSeenIds[table] = row.id;
      }
    }
  } catch {
    // Table doesn't exist or query failed, skip
  }
}

/**
 * Handle database file change - query new data and broadcast
 */
function handleDatabaseChange(): void {
  const db = getDatabaseInstance();
  if (!db) return;

  // Broadcast new rows from each tracked table
  broadcastNewRows('turns', 'new_turn');
  broadcastNewRows('heartbeat_history', 'heartbeat');
  broadcastNewRows('wake_events', 'wake_event');
  broadcastNewRows('child_lifecycle_events', 'child_update');

  // Always broadcast current status
  const status = getCurrentStatus();
  broadcast({ type: 'status_update', data: status });
}

/**
 * Setup WebSocket server with file watching
 */
export function setupWebSocket(server: Server, dbPath: string): void {
  // Initialize last seen IDs from current database state
  initializeLastSeenIds();

  // Create WebSocket server attached to HTTP server
  wss = new WebSocketServer({ server, path: '/ws' });

  // Setup file watcher for database changes
  watcher = watch(dbPath, {
    usePolling: true,
    interval: 1000,
    awaitWriteFinish: { stabilityThreshold: 500 },
  });

  watcher.on('change', () => {
    handleDatabaseChange();
  });

  // Handle client connections
  wss.on('connection', (ws) => {
    const clientCount = wss?.clients.size ?? 0;
    console.log(`WebSocket client connected (total: ${clientCount})`);

    // Send initial status to new client
    const status = getCurrentStatus();
    ws.send(JSON.stringify({ type: 'status_update', data: status }));

    ws.on('close', () => {
      const remainingCount = wss?.clients.size ?? 0;
      console.log(`WebSocket client disconnected (total: ${remainingCount})`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
    });
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  console.log('WebSocket server initialized on /ws');
}

/**
 * Close WebSocket server and file watcher
 */
export function closeWebSocket(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
  }

  if (wss) {
    // Close all client connections
    wss.clients.forEach((client) => {
      client.close();
    });
    wss.close();
    wss = null;
  }

  console.log('WebSocket server closed');
}
