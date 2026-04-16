import express from 'express';
import { getDatabaseInstance } from '../database.js';

interface TurnRow {
  id: number;
  timestamp: string;
  thinking: string;
  tool_calls: string;
  tokens_used: number;
  cost: number;
  model: string;
  duration_ms: number;
  input_source: string;
  created_at: string;
}

interface ToolCallRow {
  id: number;
  turn_id: number;
  tool_name: string;
  arguments: string;
  result: string;
  risk_level: string;
  duration_ms: number;
  status: string;
  created_at: string;
}

interface TurnResponse {
  id: number;
  timestamp: string;
  thinking: string;
  tokensUsed: number;
  cost: number;
  model: string;
  durationMs: number;
  inputSource: string;
  createdAt: string;
  toolCalls: ToolCallResponse[];
}

interface ToolCallResponse {
  id: number;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  riskLevel: string;
  durationMs: number;
  status: string;
  createdAt: string;
}

export function registerTurnRoutes(app: express.Application): void {
  // GET /api/turns?limit=20&offset=0&search=&tool=
  app.get('/api/turns', (req, res) => {
    try {
      const db = getDatabaseInstance();
      if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const search = (req.query.search as string) || '';
      const tool = (req.query.tool as string) || '';

      // Build the query with optional filters
      let whereClause = 'WHERE 1=1';
      const params: (string | number)[] = [];

      if (search) {
        whereClause += ' AND t.thinking LIKE ?';
        params.push(`%${search}%`);
      }

      if (tool) {
        whereClause += ' AND tc.tool_name = ?';
        params.push(tool);
      }

      // Get total count
      let total = 0;
      try {
        const countQuery = `
          SELECT COUNT(DISTINCT t.id) as count 
          FROM turns t
          LEFT JOIN tool_calls tc ON t.id = tc.turn_id
          ${whereClause}
        `;
        const countRow = db.prepare(countQuery).get(...params) as { count: number };
        total = countRow.count;
      } catch (error) {
        console.error('Error counting turns:', error);
        res.status(500).json({ error: 'Failed to count turns' });
        return;
      }

      // Get paginated turns with their tool calls
      const turns: TurnResponse[] = [];
      try {
        const query = `
          SELECT DISTINCT t.*
          FROM turns t
          LEFT JOIN tool_calls tc ON t.id = tc.turn_id
          ${whereClause}
          ORDER BY t.timestamp DESC
          LIMIT ? OFFSET ?
        `;
        const turnRows = db.prepare(query).all(...params, limit, offset) as TurnRow[];

        for (const row of turnRows) {
          // Get tool calls for this turn
          const toolCallRows = db.prepare(
            'SELECT * FROM tool_calls WHERE turn_id = ? ORDER BY id'
          ).all(row.id) as ToolCallRow[];

          const toolCalls: ToolCallResponse[] = toolCallRows.map(tc => ({
            id: tc.id,
            name: tc.tool_name,
            arguments: parseJson(tc.arguments),
            result: tc.result,
            riskLevel: tc.risk_level,
            durationMs: tc.duration_ms,
            status: tc.status,
            createdAt: tc.created_at,
          }));

          turns.push({
            id: row.id,
            timestamp: row.timestamp,
            thinking: row.thinking,
            tokensUsed: row.tokens_used,
            cost: row.cost,
            model: row.model,
            durationMs: row.duration_ms,
            inputSource: row.input_source,
            createdAt: row.created_at,
            toolCalls,
          });
        }
      } catch (error) {
        console.error('Error fetching turns:', error);
        res.status(500).json({ error: 'Failed to fetch turns' });
        return;
      }

      res.json({
        data: turns,
        total,
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error in /api/turns:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/turns/:id
  app.get('/api/turns/:id', (req, res) => {
    try {
      const db = getDatabaseInstance();
      if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
      }

      const turnId = parseInt(req.params.id);
      if (isNaN(turnId)) {
        res.status(400).json({ error: 'Invalid turn ID' });
        return;
      }

      // Get the turn
      let turnRow: TurnRow | undefined;
      try {
        turnRow = db.prepare('SELECT * FROM turns WHERE id = ?').get(turnId) as TurnRow | undefined;
      } catch (error) {
        console.error('Error fetching turn:', error);
        res.status(500).json({ error: 'Failed to fetch turn' });
        return;
      }

      if (!turnRow) {
        res.status(404).json({ error: 'Turn not found' });
        return;
      }

      // Get tool calls for this turn
      let toolCalls: ToolCallResponse[] = [];
      try {
        const toolCallRows = db.prepare(
          'SELECT * FROM tool_calls WHERE turn_id = ? ORDER BY id'
        ).all(turnId) as ToolCallRow[];

        toolCalls = toolCallRows.map(tc => ({
          id: tc.id,
          name: tc.tool_name,
          arguments: parseJson(tc.arguments),
          result: tc.result,
          riskLevel: tc.risk_level,
          durationMs: tc.duration_ms,
          status: tc.status,
          createdAt: tc.created_at,
        }));
      } catch (error) {
        console.error('Error fetching tool calls:', error);
        // Continue without tool calls
      }

      const turn: TurnResponse = {
        id: turnRow.id,
        timestamp: turnRow.timestamp,
        thinking: turnRow.thinking,
        tokensUsed: turnRow.tokens_used,
        cost: turnRow.cost,
        model: turnRow.model,
        durationMs: turnRow.duration_ms,
        inputSource: turnRow.input_source,
        createdAt: turnRow.created_at,
        toolCalls,
      };

      res.json(turn);
    } catch (error) {
      console.error('Error in /api/turns/:id:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

function parseJson(jsonString: string): Record<string, unknown> {
  try {
    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch {
    return {};
  }
}
