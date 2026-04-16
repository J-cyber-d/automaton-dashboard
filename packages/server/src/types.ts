export interface AgentStatus {
  id: string;
  name: string;
  state: 'idle' | 'running' | 'paused' | 'error';
  credits: number;
  address?: string;
  lastHeartbeat?: Date;
}

export interface Turn {
  id: string;
  agentId: string;
  timestamp: Date;
  input?: string;
  output?: string;
  toolCalls: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
  duration?: number;
}

export interface Transaction {
  id: string;
  agentId: string;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  timestamp: Date;
}

export interface MemoryItem {
  id: string;
  agentId: string;
  key: string;
  value: unknown;
  timestamp: Date;
}

export interface HeartbeatTask {
  id: string;
  agentId: string;
  taskType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledAt: Date;
  completedAt?: Date;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  state: 'active' | 'inactive';
  createdAt: Date;
}

export interface PolicyDecision {
  id: string;
  agentId: string;
  policy: string;
  decision: 'allow' | 'deny' | 'review';
  reason?: string;
  timestamp: Date;
}
