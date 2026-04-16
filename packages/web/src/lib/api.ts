export const API_BASE_URL = 'http://localhost:4820';
export const WS_URL = 'ws://localhost:4820/ws';

// Agent Status Types
export interface AgentStatus {
  name: string;
  address: string;
  creator: string;
  state: string;
  tier: string;
  credits: number;
  usdc: number;
  totalTurns: number;
  childrenAlive: number;
  childrenTotal: number;
  skillsActive: number;
  version: string;
  lastActivity: string | null;
}

// Tool Call Types
export interface ToolCall {
  id: number;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  riskLevel: string;
  durationMs: number;
  status: string;
  createdAt: string;
}

// Turn Types
export interface Turn {
  id: number;
  timestamp: string;
  thinking: string;
  tokensUsed: number;
  cost: number;
  model: string;
  durationMs: number;
  inputSource: string;
  createdAt: string;
  toolCalls: ToolCall[];
}

// Paginated Result Type
export interface PaginatedResult<T = Turn> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Transaction Types
export interface Transaction {
  id: number;
  type: string;
  amount: number;
  fromAddress: string;
  toAddress: string;
  description: string;
  txHash: string;
  status: string;
  createdAt: string;
}

// Financial Summary Types
export interface SpendingWindow {
  today: number;
  week: number;
  month: number;
}

export interface SpendingBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialSummary {
  credits: number;
  usdc: number;
  tier: string;
  spending: SpendingWindow;
  breakdown: SpendingBreakdown[];
  burnRate: number;
  projectedDaysLeft: number | null;
}

// Spending Data Types
export interface SpendingDataPoint {
  timestamp: string;
  amount: number;
  category: string;
}

export interface SpendingData {
  period: string;
  data: SpendingDataPoint[];
}

// Typed fetch wrapper
async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Status API
export function getStatus() {
  return fetchApi<AgentStatus>('/api/status');
}

// Turns API
export function getTurns(params?: { limit?: number; offset?: number; search?: string; tool?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.tool) searchParams.set('tool', params.tool);
  return fetchApi<PaginatedResult>(`/api/turns?${searchParams}`);
}

export function getTurn(id: number) {
  return fetchApi<Turn>(`/api/turns/${id}`);
}

// Financial API
export function getFinancialSummary() {
  return fetchApi<FinancialSummary>('/api/financial/summary');
}

export function getTransactions(params?: { limit?: number; offset?: number; type?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.type) searchParams.set('type', params.type);
  return fetchApi<PaginatedResult<Transaction>>(`/api/financial/transactions?${searchParams}`);
}

export function getSpending(period?: string) {
  return fetchApi<SpendingData>(`/api/financial/spending?period=${period || '7d'}`);
}
