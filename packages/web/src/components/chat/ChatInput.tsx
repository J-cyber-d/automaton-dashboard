'use client';

import { useRef, useState, useCallback } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const MAX_LINES = 4;
const LINE_HEIGHT = 24; // approximate line height in pixels

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate max height based on max lines
    const maxHeight = MAX_LINES * LINE_HEIGHT;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue('');

    // Reset height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = !value.trim();

  return (
    <div className="flex items-end gap-2 p-4 bg-card/80 backdrop-blur-sm border-t">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        rows={1}
        className="min-h-[44px] max-h-[96px] resize-none py-2.5 px-4 bg-background/50 border-border/50 focus:border-indigo-500/50 focus:ring-indigo-500/20"
      />
      <Button
        onClick={handleSend}
        disabled={isEmpty || disabled}
        size="icon"
        className="flex-shrink-0 h-11 w-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
      >
        <SendHorizontal className="w-4 h-4" />
      </Button>
    </div>
  );
}
