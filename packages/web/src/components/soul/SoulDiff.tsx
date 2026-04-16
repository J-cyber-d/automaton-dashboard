'use client';

import { diffLines } from 'diff';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SoulDiffProps {
  fromContent: string;
  toContent: string;
  fromVersion: number;
  toVersion: number;
}

interface DiffLine {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function SoulDiff({
  fromContent,
  toContent,
  fromVersion,
  toVersion,
}: SoulDiffProps) {
  const diff = diffLines(fromContent, toContent) as DiffLine[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Comparing v{fromVersion} → v{toVersion}</span>
        <span className="text-xs">
          <span className="text-emerald-500">+ Added</span>
          {' · '}
          <span className="text-red-500">- Removed</span>
        </span>
      </div>
      <ScrollArea className="h-[400px] rounded-md border border-border bg-card/50">
        <div className="p-4 font-mono text-sm">
          {diff.map((part, index) => {
            if (part.added) {
              return (
                <div
                  key={index}
                  className="bg-emerald-500/10 text-emerald-400 whitespace-pre-wrap"
                >
                  <span className="select-none text-emerald-600 mr-2">+</span>
                  {part.value}
                </div>
              );
            }
            if (part.removed) {
              return (
                <div
                  key={index}
                  className="bg-red-500/10 text-red-400 whitespace-pre-wrap"
                >
                  <span className="select-none text-red-600 mr-2">-</span>
                  {part.value}
                </div>
              );
            }
            return (
              <div
                key={index}
                className="text-muted-foreground whitespace-pre-wrap"
              >
                <span className="select-none text-muted-foreground/50 mr-2">
                  {' '}
                </span>
                {part.value}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
