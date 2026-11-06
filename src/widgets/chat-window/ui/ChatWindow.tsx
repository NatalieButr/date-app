'use client';

import { useEffect, useRef, useState } from 'react';

import { MessageBubble, subscribeToMatch, type Message } from '@/entities/message';
import { SendMessageForm } from '@/features/send-message';
import { Skeleton } from '@/shared/ui/skeleton';

interface Props {
  matchId: string;
  viewerId: string;
  initialMessages: Message[];
  supabaseUrl: string;
  supabaseKey: string;
}

export function ChatWindow({ matchId, viewerId, initialMessages, supabaseUrl, supabaseKey }: Props) {
  const [messages, setMessages] = useState<Message[]>(() =>
    [...initialMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length === 50);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMatch(supabaseUrl, supabaseKey, matchId, (newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });
    return unsubscribe;
  }, [matchId, supabaseUrl, supabaseKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMore() {
    const oldest = messages[0];
    if (!oldest || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/chat/${matchId}/messages?before=${oldest.id}&limit=50`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Message[] };
      const older = (data.messages ?? []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      setMessages((prev) => [...older, ...prev]);
      setHasMore(older.length === 50);
    } finally {
      setLoading(false);
    }
  }

  function handleOptimistic(body: string) {
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      match_id: matchId,
      sender_id: viewerId,
      body,
      moderation: 'ok',
      mod_reason: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 min-h-0">
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="self-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            {loading ? 'Loading…' : 'Load earlier messages'}
          </button>
        )}
        {loading && hasMore && (
          <div className="flex flex-col gap-2 mb-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2 self-end" />
          </div>
        )}
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} isOwn={m.sender_id === viewerId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t px-4 py-3">
        <SendMessageForm matchId={matchId} onOptimistic={handleOptimistic} />
      </div>
    </div>
  );
}
