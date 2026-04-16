import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

const dbPath = path.join(os.homedir(), '.automaton', 'state.db');
const db = new Database(dbPath);

// Helper to generate timestamp relative to now
function relativeTime(minutesAgo: number): string {
  const date = new Date(Date.now() - minutesAgo * 60 * 1000);
  return date.toISOString();
}

// Helper to get random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to get random integer in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to get random float in range
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS identity (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS turns (
    id INTEGER PRIMARY KEY,
    timestamp TEXT NOT NULL,
    thinking TEXT,
    tool_calls TEXT,
    tokens_used INTEGER,
    cost REAL,
    model TEXT,
    duration_ms INTEGER,
    input_source TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tool_calls (
    id INTEGER PRIMARY KEY,
    turn_id INTEGER NOT NULL,
    tool_name TEXT NOT NULL,
    arguments TEXT,
    result TEXT,
    risk_level TEXT,
    duration_ms INTEGER,
    status TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (turn_id) REFERENCES turns(id)
  );
  CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    state TEXT NOT NULL DEFAULT 'active',
    purpose TEXT,
    created_at TEXT NOT NULL,
    last_seen TEXT
  );
  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    source TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    from_address TEXT,
    to_address TEXT,
    description TEXT,
    tx_hash TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS spend_tracking (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    window_start TEXT NOT NULL,
    window_type TEXT NOT NULL DEFAULT 'hourly',
    metadata TEXT,
    created_at TEXT NOT NULL
  );
`);

const insertIdentity = db.prepare('INSERT OR REPLACE INTO identity (key, value) VALUES (?, ?)');
insertIdentity.run('name', 'TestAgent');
insertIdentity.run('address', '0x1234567890abcdef');

const insertKV = db.prepare('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)');
insertKV.run('state', '"running"');
insertKV.run('credits', '1000');
insertKV.run('tier', 'explorer');
insertKV.run('usdc_balance', '42.50');

// Insert turns
const insertTurn = db.prepare(`
  INSERT OR REPLACE INTO turns (id, timestamp, thinking, tool_calls, tokens_used, cost, model, duration_ms, input_source, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const thinkingTexts = [
  'Analyzing the user request to understand the intent and context.',
  'Breaking down the task into smaller subtasks for better execution.',
  'Considering multiple approaches to solve this problem efficiently.',
  'Evaluating the trade-offs between different implementation strategies.',
  'Planning the execution steps based on available tools and context.',
  'Reviewing previous context to maintain conversation continuity.',
  'Determining the most appropriate tool for this specific request.',
  'Constructing a response that addresses all aspects of the query.',
  'Verifying the output against the original requirements.',
  'Optimizing the solution for better performance and clarity.',
  'Cross-referencing with knowledge base for accurate information.',
  'Synthesizing information from multiple sources.',
  'Formulating a step-by-step plan to achieve the goal.',
  'Checking for potential edge cases and handling them appropriately.',
  'Reflecting on the approach to ensure completeness.'
];

const models = ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku', 'gpt-4', 'gpt-4-turbo'];
const inputSources = ['user', 'system', 'child', 'skill'];

for (let i = 1; i <= 15; i++) {
  const minutesAgo = randomInt(60, 10080); // 1 hour to 7 days
  const timestamp = relativeTime(minutesAgo);
  const tokens = randomInt(500, 5000);
  const cost = randomFloat(0.001, 0.05);
  const duration = randomInt(500, 8000);
  
  insertTurn.run(
    i,
    timestamp,
    thinkingTexts[i - 1],
    JSON.stringify(['web_search', 'code_edit']),
    tokens,
    cost,
    randomItem(models),
    duration,
    randomItem(inputSources),
    timestamp
  );
}

// Insert tool_calls
const insertToolCall = db.prepare(`
  INSERT OR REPLACE INTO tool_calls (id, turn_id, tool_name, arguments, result, risk_level, duration_ms, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const toolNames = ['web_search', 'code_edit', 'file_read', 'terminal', 'send_message'];
const riskLevels = ['low', 'medium', 'high'];
const statuses = ['success', 'error', 'pending'];

const toolArguments: Record<string, object> = {
  web_search: { query: 'how to implement authentication in express', max_results: 5 },
  code_edit: { file_path: 'src/index.ts', line_start: 10, line_end: 25, replacement: 'new code here' },
  file_read: { path: 'package.json', encoding: 'utf-8' },
  terminal: { command: 'npm install better-sqlite3', cwd: '/project' },
  send_message: { recipient: 'user123', content: 'Task completed successfully', priority: 'normal' }
};

const toolResults: Record<string, object> = {
  web_search: { results: [{ title: 'Express Auth Guide', url: 'https://example.com' }], total: 5 },
  code_edit: { success: true, bytes_changed: 150, file_size: 2048 },
  file_read: { content: '{"name": "project"}', size: 256, encoding: 'utf-8' },
  terminal: { exit_code: 0, stdout: 'Package installed', stderr: '', duration_ms: 3000 },
  send_message: { message_id: 'msg_123', delivered: true, timestamp: new Date().toISOString() }
};

for (let i = 1; i <= 20; i++) {
  const turnId = randomInt(1, 15);
  const toolName = randomItem(toolNames);
  const minutesAgo = randomInt(30, 10080);
  const createdAt = relativeTime(minutesAgo);
  
  insertToolCall.run(
    i,
    turnId,
    toolName,
    JSON.stringify(toolArguments[toolName]),
    JSON.stringify(toolResults[toolName]),
    randomItem(riskLevels),
    randomInt(100, 5000),
    randomItem(statuses),
    createdAt
  );
}

// Insert children
const insertChild = db.prepare(`
  INSERT OR REPLACE INTO children (id, name, address, state, purpose, created_at, last_seen)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const children = [
  { name: 'ChildAlpha', address: '0xabcdef1234567890', state: 'active', purpose: 'Data processing worker' },
  { name: 'ChildBeta', address: '0x1234567890abcdef', state: 'active', purpose: 'API gateway handler' },
  { name: 'ChildGamma', address: '0xfedcba0987654321', state: 'inactive', purpose: 'Backup coordinator' },
  { name: 'ChildDelta', address: '0x9876543210abcdef', state: 'active', purpose: 'Monitoring agent' }
];

children.forEach((child, index) => {
  const createdAt = relativeTime(randomInt(10080, 43200)); // 7 to 30 days ago
  const lastSeen = child.state === 'active' ? relativeTime(randomInt(1, 60)) : relativeTime(randomInt(1440, 10080));
  
  insertChild.run(
    index + 1,
    child.name,
    child.address,
    child.state,
    child.purpose,
    createdAt,
    lastSeen
  );
});

// Insert skills
const insertSkill = db.prepare(`
  INSERT OR REPLACE INTO skills (id, name, description, enabled, source, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const skills = [
  { name: 'web_search', description: 'Search the web for information', enabled: 1, source: 'builtin' },
  { name: 'code_edit', description: 'Edit code files with precision', enabled: 1, source: 'builtin' },
  { name: 'file_read', description: 'Read file contents safely', enabled: 1, source: 'builtin' },
  { name: 'terminal', description: 'Execute terminal commands', enabled: 0, source: 'custom' },
  { name: 'send_message', description: 'Send messages to users', enabled: 1, source: 'builtin' },
  { name: 'database_query', description: 'Query database directly', enabled: 0, source: 'plugin' }
];

skills.forEach((skill, index) => {
  insertSkill.run(
    index + 1,
    skill.name,
    skill.description,
    skill.enabled,
    skill.source,
    relativeTime(randomInt(1440, 20160)) // 1 to 14 days ago
  );
});

// Insert transactions
const insertTransaction = db.prepare(`
  INSERT OR REPLACE INTO transactions (id, type, amount, from_address, to_address, description, tx_hash, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const txTypes = ['topup', 'transfer_out', 'transfer_in', 'x402', 'domain'];
const txDescriptions: Record<string, string> = {
  topup: 'Account balance top-up',
  transfer_out: 'Transfer to external wallet',
  transfer_in: 'Transfer from external wallet',
  x402: 'x402 protocol payment',
  domain: 'Domain registration fee'
};

for (let i = 1; i <= 15; i++) {
  const txType = randomItem(txTypes);
  const amount = randomFloat(0.5, 100);
  const minutesAgo = randomInt(60, 43200); // 1 hour to 30 days
  const createdAt = relativeTime(minutesAgo);
  
  insertTransaction.run(
    i,
    txType,
    amount,
    txType === 'transfer_in' ? '0xexternal123' : '0x1234567890abcdef',
    txType === 'transfer_out' ? '0xexternal456' : '0x1234567890abcdef',
    txDescriptions[txType],
    `0x${randomInt(10000000, 99999999).toString(16)}${randomInt(10000000, 99999999).toString(16)}`,
    randomItem(['confirmed', 'pending', 'failed']),
    createdAt
  );
}

// Insert spend_tracking
const insertSpendTracking = db.prepare(`
  INSERT OR REPLACE INTO spend_tracking (id, category, amount, window_start, window_type, metadata, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const spendCategories = ['inference', 'transfer', 'x402', 'domain'];
const windowTypes = ['hourly', 'daily'];

for (let i = 1; i <= 50; i++) {
  const category = randomItem(spendCategories);
  const amount = randomFloat(0.01, 5.0);
  const windowType = randomItem(windowTypes);
  const minutesAgo = randomInt(60, 43200); // 1 hour to 30 days
  const windowStart = relativeTime(minutesAgo);
  
  const metadata: Record<string, unknown> = {
    model: category === 'inference' ? randomItem(models) : undefined,
    tokens: category === 'inference' ? randomInt(100, 3000) : undefined,
    tx_count: category !== 'inference' ? randomInt(1, 10) : undefined
  };
  
  insertSpendTracking.run(
    i,
    category,
    amount,
    windowStart,
    windowType,
    JSON.stringify(metadata),
    windowStart
  );
}

console.log('Mock database created at:', dbPath);
db.close();
