'use client';

import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const ACTIONS = [
  { label: 'Check status', message: 'Report your current status' },
  { label: 'What are you working on?', message: 'What are you working on?' },
  { label: 'Check credits', message: 'Check your credit balance' },
  { label: 'Sleep', message: 'Go to sleep now' },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 bg-card/50 border-t">
      {ACTIONS.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.message)}
          disabled={disabled}
          className="text-xs h-8 border-border/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
