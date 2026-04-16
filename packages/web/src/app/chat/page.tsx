'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickActions } from '@/components/chat/QuickActions';
import { sendChatMessage, getChatHistory, type ChatMessage } from '@/lib/api';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useWebSocketContext();

  // Fetch chat history
  const fetchHistory = useCallback(async () => {
    try {
      const result = await getChatHistory({ limit: 50 });
      setMessages(result.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchHistory]);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'new_turn') {
        // Check if the turn references inbox/chat
        const data = event.data as { input_source?: string; turn_id?: number };
        if (data.input_source === 'inbox' || data.turn_id) {
          fetchHistory();
        }
      }
    });

    return unsubscribe;
  }, [subscribe, fetchHistory]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    setSending(true);

    // Optimistic update - add message immediately
    const optimisticMessage: ChatMessage = {
      id: Date.now(), // temporary ID
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      status: 'queued',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const result = await sendChatMessage(content);
      // Refresh to get the actual message with proper ID
      await fetchHistory();
    } catch (err) {
      console.error('Failed to send message:', err);
      // Update the optimistic message to show error state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, status: 'queued' as const, content: msg.content + ' (failed to send - server unavailable)' }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50">
        <h1 className="text-lg font-semibold text-foreground">Chat with Agent</h1>
        <span className="text-xs text-muted-foreground">
          {messages.length} messages
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-hidden" ref={scrollRef}>
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-4 pb-8">
            {loading ? (
              // Loading skeletons
              <>
                <div className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="w-64 h-12 rounded-2xl" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col gap-2 items-end">
                    <Skeleton className="w-48 h-10 rounded-2xl" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="w-72 h-16 rounded-2xl" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                </div>
              </>
            ) : messages.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Start a conversation
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Send a message to the agent or use the quick actions below to get started.
                </p>
              </div>
            ) : (
              // Messages list
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick actions */}
      <QuickActions onAction={handleSend} disabled={sending} />

      {/* Input area */}
      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
}
