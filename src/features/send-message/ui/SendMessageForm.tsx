'use client';

import { type FormEvent, useRef, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';

interface Props {
  matchId: string;
  onOptimistic?: (body: string) => void;
}

export function SendMessageForm({ matchId, onOptimistic }: Props) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = value.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);
    onOptimistic?.(body);
    setValue('');

    try {
      const res = await fetch(`/api/chat/${matchId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        const msg = data.error?.message ?? 'Failed to send message';
        setError(msg);
        setValue(body);
      }
    } catch {
      setError('Network error. Please try again.');
      setValue(body);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="min-h-[40px] max-h-32 resize-none"
          disabled={sending}
        />
        <Button type="submit" disabled={!value.trim() || sending} size="sm">
          {sending ? '…' : 'Send'}
        </Button>
      </div>
    </form>
  );
}
