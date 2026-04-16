import path from 'path';
import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';

export interface Config {
  port: number;
  dbPath: string;
  automatonDir: string;
  corsOrigin: string;
}

export function getConfig(): Config {
  // Load .env file if exists
  dotenv.config();

  // Parse CLI args
  const args = parseCliArgs();

  // Default automaton directory
  const automatonDir = path.join(os.homedir(), '.automaton');
  const automatonDirExists = fs.existsSync(automatonDir);

  // Default DB path
  const defaultDbPath = path.join(automatonDir, 'state.db');

  // Resolve configuration (CLI args → env vars → defaults)
  const port = args.port ?? (parseInt(process.env.DASHBOARD_PORT || '', 10) || 4820);
  const dbPath = args.db ?? process.env.AUTOMATON_DB_PATH ?? defaultDbPath;
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

  return {
    port,
    dbPath,
    automatonDir,
    corsOrigin,
  };
}

function parseCliArgs(): { port?: number; db?: string } {
  const args: { port?: number; db?: string } = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--port' && argv[i + 1]) {
      args.port = parseInt(argv[i + 1], 10);
      i++;
    } else if (arg === '--db' && argv[i + 1]) {
      args.db = argv[i + 1];
      i++;
    } else if (arg.startsWith('--port=')) {
      args.port = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--db=')) {
      args.db = arg.split('=')[1];
    }
  }

  return args;
}
