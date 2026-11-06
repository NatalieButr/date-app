'use client';

import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

interface Props {
  matchId: string;
  onSelect: (text: string) => void;
}

type State = 'idle' | 'loading' | 'done' | 'error';

function parseSuggestions(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}

async function fetchIcebreakers(matchId: string): Promise<string[]> {
  const res = await fetch(`/api/chat/${matchId}/icebreakers`, { method: 'POST' });
  if (!res.ok || !res.body) throw new Error('Failed to load icebreakers');

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

  return parseSuggestions(fullText);
}

export function IcebreakersButton({ matchId, onSelect }: Props) {
  const [state, setState] = useState<State>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function handleClick() {
    setState('loading');
    try {
      const items = await fetchIcebreakers(matchId);
      setSuggestions(items);
      setState('done');
    } catch {
      setState('error');
    }
  }

  if (state === 'idle') {
    return (
      <Button variant="outline" size="sm" onClick={handleClick} className="text-xs">
        💬 Get icebreakers
      </Button>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-1 mt-1">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <p className="text-xs text-destructive">
        Could not load icebreakers.{' '}
        <button className="underline" onClick={handleClick}>
          Retry
        </button>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 mt-1">
      {suggestions.map((text, i) => (
        <button
          key={i}
          onClick={() => onSelect(text)}
          className="text-left text-xs px-3 py-1.5 rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
