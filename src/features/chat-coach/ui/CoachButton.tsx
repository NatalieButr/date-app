'use client';

import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

interface Props {
  matchId: string;
}

type State = 'idle' | 'loading' | 'done' | 'error';

async function fetchCoachSuggestions(matchId: string): Promise<string> {
  const res = await fetch(`/api/chat/${matchId}/coach`, { method: 'POST' });
  if (!res.ok || !res.body) throw new Error('Failed to load coach suggestions');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  let streamDone = false;
  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') {
        streamDone = true;
        break;
      }
      try {
        // JSON.parse returns unknown; Zod would be heavier than needed here
        const event = JSON.parse(payload) as {
          type: string;
          delta?: { type: string; text?: string };
        };
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          fullText += event.delta.text ?? '';
        }
      } catch {
        // ignore malformed SSE lines
      }
    }
  }

  return fullText;
}

export function CoachButton({ matchId }: Props) {
  const [state, setState] = useState<State>('idle');
  const [suggestion, setSuggestion] = useState('');

  async function handleClick() {
    setState('loading');
    try {
      const text = await fetchCoachSuggestions(matchId);
      setSuggestion(text);
      setState('done');
    } catch {
      setState('error');
    }
  }

  if (state === 'idle') {
    return (
      <Button variant="outline" size="sm" onClick={handleClick} className="text-xs">
        🧠 Ask coach
      </Button>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-1 mt-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <p className="text-xs text-destructive">
        Could not load suggestions.{' '}
        <button className="underline" onClick={handleClick}>
          Retry
        </button>
      </p>
    );
  }

  return (
    <div className="rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
      <p className="font-medium text-foreground mb-1">Coach suggests:</p>
      {suggestion}
      <button className="mt-2 block text-xs underline" onClick={() => setState('idle')}>
        Dismiss
      </button>
    </div>
  );
}
