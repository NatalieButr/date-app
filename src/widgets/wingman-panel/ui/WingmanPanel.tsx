'use client';

import { useState } from 'react';

import type { PublicProfile } from '@/entities/profile';
import type { WingmanEvent, WingmanDraft } from '@/features/wingman';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';

interface Step {
  tool: string;
  label: string;
}

interface FinalResult {
  text: string;
  profiles: PublicProfile[];
  drafts: WingmanDraft[];
}

type PanelState = 'idle' | 'running' | 'done' | 'error';

export function WingmanPanel() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<PanelState>('idle');
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState<FinalResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [sendingDraft, setSendingDraft] = useState<string | null>(null);
  const [sentDrafts, setSentDrafts] = useState<Set<string>>(new Set());
  const [sendErrors, setSendErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || state === 'running') return;

    setState('running');
    setSteps([]);
    setResult(null);
    setErrorMsg('');
    setSentDrafts(new Set());
    setSendErrors({});

    try {
      const res = await fetch('/api/wingman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        setErrorMsg(data.error?.message ?? `Request failed (${res.status})`);
        setState('error');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          try {
            const event = JSON.parse(payload) as WingmanEvent;
            if (event.type === 'step') {
              setSteps((prev) => [...prev, { tool: event.tool, label: event.label }]);
            } else if (event.type === 'final') {
              setResult({ text: event.text, profiles: event.profiles, drafts: event.drafts });
              setState('done');
              done = true;
            } else if (event.type === 'error') {
              setErrorMsg(event.message);
              setState('error');
              done = true;
            }
          } catch {
            // ignore malformed events
          }
        }
      }

      setState((prev) => (prev === 'running' ? 'done' : prev));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Connection error');
      setState('error');
    }
  }

  async function handleSendDraft(draft: WingmanDraft) {
    setSendingDraft(draft.targetId);
    setSendErrors((prev) => ({ ...prev, [draft.targetId]: '' }));
    try {
      const res = await fetch('/api/wingman/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: draft.targetId, text: draft.text }),
      });
      if (res.ok) {
        setSentDrafts((prev) => new Set([...prev, draft.targetId]));
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        const msg = data.error?.message ?? `Send failed (${res.status})`;
        if (res.status === 404) {
          setSendErrors((prev) => ({
            ...prev,
            [draft.targetId]: 'No match yet — like their profile first!',
          }));
        } else {
          setSendErrors((prev) => ({ ...prev, [draft.targetId]: msg }));
        }
      }
    } catch (err) {
      setSendErrors((prev) => ({
        ...prev,
        [draft.targetId]: err instanceof Error ? err.message : 'Send failed',
      }));
    } finally {
      setSendingDraft(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find someone who loves hiking and suggest a date in Warsaw…"
          disabled={state === 'running'}
          className="flex-1"
          aria-label="Wingman query"
        />
        <Button type="submit" disabled={!query.trim() || state === 'running'}>
          {state === 'running' ? 'Searching…' : 'Ask Wingman'}
        </Button>
      </form>

      {state === 'running' && steps.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : null}

      {steps.length > 0 ? (
        <ol className="space-y-1 text-sm text-muted-foreground">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">{step.tool}</span>
              <span>{step.label}</span>
            </li>
          ))}
          {state === 'running' ? <li className="animate-pulse">…</li> : null}
        </ol>
      ) : null}

      {state === 'error' ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-6">
          <p className="text-sm">{result.text}</p>

          {result.profiles.length > 0 ? (
            <section aria-label="Suggested profiles">
              <h2 className="mb-3 text-sm font-semibold">Suggested profiles</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {result.profiles.map((profile) => (
                  <li key={profile.id} className="rounded-lg border bg-card p-3 text-sm shadow-sm">
                    <p className="font-medium">
                      {profile.name}, {profile.age}
                    </p>
                    <p className="text-muted-foreground">{profile.city}</p>
                    {profile.bio ? (
                      <p className="mt-1 line-clamp-2 text-muted-foreground">{profile.bio}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.drafts.length > 0 ? (
            <section aria-label="Message drafts">
              <h2 className="mb-3 text-sm font-semibold">Message drafts</h2>
              <ul className="space-y-3">
                {result.drafts.map((draft) => {
                  const sent = sentDrafts.has(draft.targetId);
                  const sending = sendingDraft === draft.targetId;
                  const draftError = sendErrors[draft.targetId];
                  return (
                    <li
                      key={draft.targetId}
                      className="rounded-lg border bg-card p-3 text-sm shadow-sm"
                    >
                      <p className="mb-2">{draft.text}</p>
                      {draftError ? (
                        <p className="mb-2 text-xs text-destructive" role="alert">
                          {draftError}
                        </p>
                      ) : null}
                      <Button
                        size="sm"
                        variant={sent ? 'secondary' : 'default'}
                        disabled={sent || sending}
                        onClick={() => void handleSendDraft(draft)}
                      >
                        {sent ? 'Sent ✓' : sending ? 'Sending…' : 'Send'}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
