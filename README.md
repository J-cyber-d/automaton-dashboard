# Automaton Dashboard

> Real-time monitoring dashboard for autonomous AI agents built with [Automaton](https://github.com/autonomous-agent/automaton).

![Dashboard Preview](docs/screenshot-placeholder.png)

## Features

- 🔍 **Real-time Monitoring** — Live WebSocket updates for agent status, turns, and events
- 💰 **Financial Tracking** — Credit balance, spending charts, and transaction history
- 🧠 **Memory Explorer** — Browse all 5 memory tiers: working, episodic, semantic, procedural, relationships
- 👻 **Soul Viewer** — Read and diff soul document versions with alignment gauge
- 📊 **Activity Feed** — Searchable, filterable turn history with tool call details
- 💓 **Heartbeat Monitor** — Background task schedules, execution history, wake events
- 🛡️ **Security Audit** — Policy decisions, risk breakdown, self-modification log
- 💬 **Chat Interface** — Send messages to your agent's inbox
- 👶 **Children Manager** — Monitor spawned child agents and their lifecycle
- 🌙 **Dark Theme** — Glassmorphism UI with tier-colored accents

## Quick Start

```bash
# Run directly (no install needed)
npx automaton-dashboard --db ~/.automaton/state.db

# Or install globally
npm install -g automaton-dashboard
automaton-dashboard
```

## Docker

```bash
docker run -p 4820:4820 -v ~/.automaton:/data:ro automaton-dashboard
```

Or with docker-compose:

```bash
cd docker
docker-compose up -d
```

## CLI Options

| Option          | Default                 | Description                         |
| --------------- | ----------------------- | ----------------------------------- |
| `--port <port>` | `4820`                  | Server port                         |
| `--db <path>`   | `~/.automaton/state.db` | Path to Automaton's SQLite database |
| `--help`        |                         | Show help message                   |
| `--version`     |                         | Show version number                 |

## Environment Variables

| Variable             | Default                 | Description              |
| -------------------- | ----------------------- | ------------------------ |
| `DASHBOARD_PORT`     | `4820`                  | Server port              |
| `AUTOMATON_DB_PATH`  | `~/.automaton/state.db` | Database path            |
| `DASHBOARD_PASSWORD` | _(none)_                | Optional access password |

## Architecture

```
┌─────────────────────────────────────────────────┐
│              automaton-dashboard                 │
│                                                  │
│  ┌──────────────┐     ┌──────────────────────┐  │
│  │ Express API   │────▶│ Static Frontend      │  │
│  │ Port 4820     │     │ (Next.js export)     │  │
│  │               │     │                      │  │
│  │ REST + WS     │     │ 10 pages             │  │
│  │ 40+ endpoints │     │ 50+ components       │  │
│  └──────┬───────┘     │ shadcn/ui + Recharts │  │
│         │              └──────────────────────┘  │
│         ▼                                        │
│  ┌──────────────┐                                │
│  │ SQLite (R/O)  │◀── Automaton's state.db       │
│  │ + File Watch  │    (read-only access)         │
│  └──────────────┘                                │
└─────────────────────────────────────────────────┘
```

## Development

```bash
# Clone and install
git clone https://github.com/yourusername/automaton-dashboard.git
cd automaton-dashboard
pnpm install

# Run in development mode (hot reload)
pnpm dev

# Server: http://localhost:4820
# Frontend: http://localhost:3000

# Build for production
pnpm build:release

# Run production build
node packages/server/dist/index.js
```

### Project Structure

```
automaton-dashboard/
├── packages/
│   ├── server/          # Express API + WebSocket + static serving
│   │   ├── src/
│   │   │   ├── index.ts       # Entry point
│   │   │   ├── routes/        # 11 API route modules
│   │   │   ├── database.ts    # SQLite connection
│   │   │   ├── websocket.ts   # Real-time updates
│   │   │   └── types.ts       # Shared types
│   │   └── bin/cli.js         # CLI entry
│   └── web/             # Next.js frontend
│       └── src/
│           ├── app/           # 10 page routes
│           ├── components/    # 50+ UI components
│           ├── hooks/         # useApi, useWebSocket
│           ├── contexts/      # WebSocket provider
│           └── lib/           # API client, formatters
├── docker/              # Docker configuration
├── scripts/             # Build utilities
└── .github/workflows/   # CI/CD pipelines
```

## Tech Stack

- **Backend**: Node.js, Express, better-sqlite3, ws, TypeScript
- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui, Recharts
- **Database**: SQLite (read-only access to Automaton's state.db)
- **Build**: pnpm workspaces, tsup, static export

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE)
