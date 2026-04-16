'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Heart, Star, Shield, Target, Zap, Brain, Wallet } from 'lucide-react';

interface SoulSectionCardProps {
  title: string;
  content: string;
}

const sectionStyles: Record<string, { border: string; bg: string; icon?: React.ReactNode }> = {
  'Core Purpose': {
    border: 'border-l-indigo-500',
    bg: 'bg-indigo-500/5',
    icon: <Target className="w-4 h-4 text-indigo-400" />,
  },
  'Values': {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    icon: <Heart className="w-4 h-4 text-amber-400" />,
  },
  'Personality': {
    border: 'border-l-purple-500',
    bg: 'bg-purple-500/5',
    icon: <Star className="w-4 h-4 text-purple-400" />,
  },
  'Boundaries': {
    border: 'border-l-red-500',
    bg: 'bg-red-500/5',
    icon: <Shield className="w-4 h-4 text-red-400" />,
  },
  'Strategy': {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/5',
    icon: <Brain className="w-4 h-4 text-blue-400" />,
  },
  'Capabilities': {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/5',
    icon: <Zap className="w-4 h-4 text-emerald-400" />,
  },
  'Financial Character': {
    border: 'border-l-cyan-500',
    bg: 'bg-cyan-500/5',
    icon: <Wallet className="w-4 h-4 text-cyan-400" />,
  },
};

export function SoulSectionCard({ title, content }: SoulSectionCardProps) {
  const style = sectionStyles[title] || {
    border: 'border-l-muted-foreground',
    bg: 'bg-card/80',
  };

  return (
    <div
      className={`rounded-lg border border-border ${style.border} border-l-4 ${style.bg} backdrop-blur-sm p-5`}
    >
      <div className="flex items-center gap-2 mb-3">
        {style.icon && <span>{style.icon}</span>}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-muted-foreground">{children}</li>
            ),
            p: ({ children }) => (
              <p className="text-muted-foreground leading-relaxed">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="text-foreground font-semibold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-foreground/80 italic">{children}</em>
            ),
            code: ({ children }) => (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
