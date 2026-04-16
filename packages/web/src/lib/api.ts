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

// Heartbeat types
export interface HeartbeatTask {
  id: number;
  task_name: string;
  schedule: string;
  enabled: boolean;
  min_tier: string;
  last_run: string | null;
  last_result: 'success' | 'error' | null;
  last_error: string | null;
  next_run: string | null;
}

export interface HeartbeatExecution {
  id: number;
  task_name: string;
  status: 'success' | 'error';
  duration_ms: number;
  error_message: string | null;
  timestamp: string;
}

export interface WakeEvent {
  id: number;
  source: string;
  reason: string;
  timestamp: string;
}

// Memory types
export interface MemoryStats {
  working: number;
  episodic: number;
  semantic: number;
  procedural: number;
  relationships: number;
  total: number;
}

export interface WorkingMemoryItem {
  id: number;
  type: 'goal' | 'plan' | 'observation';
  content: string;
  priority: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface EpisodicMemoryItem {
  id: number;
  event_type: string;
  summary: string;
  details: string;
  importance: number;
  classification: string;
  timestamp: string;
}

export interface SemanticMemoryItem {
  id: number;
  category: string;
  key: string;
  value: string;
  confidence: number;
  updated_at: string;
}

export interface ProceduralMemoryItem {
  id: number;
  name: string;
  description: string;
  steps: string[];
  success_count: number;
  failure_count: number;
  last_used: string | null;
}

export interface RelationshipItem {
  id: number;
  entity_name: string;
  entity_address: string | null;
  entity_type: 'agent' | 'human' | 'service';
  trust_score: number;
  interaction_count: number;
  notes: string;
  last_interaction: string | null;
}

// Soul types
export interface SoulCurrent {
  content: string;
  version: number;
  last_modified: string;
  genesis_alignment: number;
}

export interface SoulVersion {
  version: number;
  timestamp: string;
  trigger: string;
  changes_summary: string;
  content: string;
}

export interface SoulDiff {
  from_version: number;
  to_version: number;
  diff: string;
}

// Security types
export interface SecurityStats {
  total_decisions: number;
  allowed: number;
  denied: number;
  modifications_count: number;
  risk_breakdown: {
    safe: number;
    caution: number;
    dangerous: number;
    forbidden: number;
  };
  top_denied_tools: Array<{ tool: string; count: number }>;
  injection_attempts: number;
}

export interface PolicyDecision {
  id: number;
  timestamp: string;
  tool_name: string;
  decision: 'allow' | 'deny';
  risk_level: 'safe' | 'caution' | 'dangerous' | 'forbidden';
  rule: string;
  reason: string;
  details?: string;
}

export interface Modification {
  id: number;
  type: string;
  target_file: string;
  timestamp: string;
  turn_id: number;
  hash_before: string;
  hash_after: string;
  diff: string;
}

// Chat types
export interface ChatMessage {
  id: number;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  status: 'queued' | 'processing' | 'processed';
  turn_id?: number;
}

// Child types
export interface Child {
  id: number;
  name: string;
  state: 'spawning' | 'alive' | 'unhealthy' | 'dead' | 'recovering';
  address: string;
  sandbox_id: string;
  credits: number;
  last_health_check: string | null;
  health_status: string | null;
  genesis_prompt: string | null;
  created_at: string;
}

export interface LifecycleEvent {
  id: number;
  child_id: number;
  from_state: string;
  to_state: string;
  reason: string;
  timestamp: string;
}

// Typed fetch wrapper
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
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

// Heartbeat
export async function getHeartbeatSchedule(): Promise<HeartbeatTask[]> {
  return fetchApi('/api/heartbeat/schedule');
}

export async function getHeartbeatHistory(params?: { limit?: number; offset?: number; task_name?: string }): Promise<PaginatedResult<HeartbeatExecution>> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.task_name) searchParams.set('task_name', params.task_name);
  return fetchApi(`/api/heartbeat/history?${searchParams}`);
}

export async function getWakeEvents(params?: { limit?: number; offset?: number }): Promise<PaginatedResult<WakeEvent>> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  return fetchApi(`/api/heartbeat/wake-events?${searchParams}`);
}

// Memory
export async function getMemoryStats(): Promise<MemoryStats> {
  return fetchApi('/api/memory/stats');
}

export async function getWorkingMemory(params?: { status?: string }): Promise<WorkingMemoryItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  return fetchApi(`/api/memory/working?${searchParams}`);
}

export async function getEpisodicMemory(params?: { min_importance?: number; classification?: string; limit?: number; offset?: number }): Promise<PaginatedResult<EpisodicMemoryItem>> {
  const searchParams = new URLSearchParams();
  if (params?.min_importance) searchParams.set('min_importance', String(params.min_importance));
  if (params?.classification) searchParams.set('classification', params.classification);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  return fetchApi(`/api/memory/episodic?${searchParams}`);
}

export async function getSemanticMemory(params?: { category?: string; search?: string }): Promise<SemanticMemoryItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  return fetchApi(`/api/memory/semantic?${searchParams}`);
}

export async function getProceduralMemory(): Promise<ProceduralMemoryItem[]> {
  return fetchApi('/api/memory/procedural');
}

export async function getRelationships(): Promise<RelationshipItem[]> {
  return fetchApi('/api/memory/relationships');
}

// Soul
export async function getSoulCurrent(): Promise<SoulCurrent> {
  return fetchApi('/api/soul/current');
}

export async function getSoulHistory(): Promise<SoulVersion[]> {
  return fetchApi('/api/soul/history');
}

export async function getSoulDiff(from: number, to: number): Promise<SoulDiff> {
  return fetchApi(`/api/soul/diff?from=${from}&to=${to}`);
}

// Security
export async function getSecurityStats(): Promise<SecurityStats> {
  return fetchApi('/api/security/stats');
}

export async function getPolicyDecisions(params?: { limit?: number; offset?: number; decision?: string; tool_name?: string }): Promise<PaginatedResult<PolicyDecision>> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.decision) searchParams.set('decision', params.decision);
  if (params?.tool_name) searchParams.set('tool_name', params.tool_name);
  return fetchApi(`/api/security/policy-decisions?${searchParams}`);
}

export async function getModifications(params?: { limit?: number; offset?: number }): Promise<PaginatedResult<Modification>> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  return fetchApi(`/api/security/modifications?${searchParams}`);
}

// Chat
export async function sendChatMessage(content: string): Promise<{ id: number; status: string }> {
  return fetchApi('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export async function getChatHistory(params?: { limit?: number; offset?: number }): Promise<PaginatedResult<ChatMessage>> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  return fetchApi(`/api/chat/history?${searchParams}`);
}

// Children API
export async function getChildren(): Promise<Child[]> {
  return fetchApi('/api/children');
}

export async function getChildLifecycle(childId: number): Promise<LifecycleEvent[]> {
  return fetchApi(`/api/children/${childId}/lifecycle`);
}

// Settings Types
export interface AgentSettings {
  name: string;
  address: string;
  creator: string;
  sandbox_id: string;
  version: string;
  genesis_prompt: string;
  api_keys: Record<string, string>;
}

export interface Constitution {
  content: string;
  laws: string[];
}

export interface TreasuryPolicy {
  max_per_transfer: number;
  max_hourly: number;
  max_daily: number;
  confirmation_threshold: number;
  minimum_reserve: number;
}

export interface Skill {
  name: string;
  description: string;
  source: string;
  active: boolean;
}

export interface Tool {
  name: string;
  type: 'npm' | 'mcp';
  package_name: string;
}

export interface Model {
  name: string;
  provider: string;
  input_price: number;
  output_price: number;
  max_tokens: number;
}

// Settings API
export async function getSettings(): Promise<AgentSettings> {
  return fetchApi('/api/settings');
}

export async function getConstitution(): Promise<Constitution> {
  return fetchApi('/api/settings/constitution');
}

export async function getTreasuryPolicy(): Promise<TreasuryPolicy> {
  return fetchApi('/api/settings/treasury-policy');
}

export async function getSkills(): Promise<Skill[]> {
  return fetchApi('/api/settings/skills');
}

export async function getTools(): Promise<Tool[]> {
  return fetchApi('/api/settings/tools');
}

export async function getModels(): Promise<Model[]> {
  return fetchApi('/api/settings/models');
}
