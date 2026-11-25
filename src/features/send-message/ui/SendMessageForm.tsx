'use client';

import { useRef, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';

interface Props {
  matchId: string;
  onOptimistic?: (body: string) => void;
  /** When provided, the input becomes controlled by the parent. */
  value?: string;
  onValueChange?: (v: string) => void;
}

export function SendMessageForm({
  matchId,
  onOptimistic,
  value: externalValue,
  onValueChange,
}: Props) {
  const [internalValue, setInternalValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : internalValue;

  function setValue(v: string) {
    if (isControlled) {
      onValueChange?.(v);
    } else {
      setInternalValue(v);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
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
      void handleSubmit(e as unknown as React.SyntheticEvent);
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
          aria-label="Message"
          rows={1}
          className="min-h-[40px] max-h-32 resize-none"
          disabled={sending}
        />
        <Button
          type="submit"
          disabled={!value.trim() || sending}
          size="sm"
          aria-label={sending ? 'Sending message' : undefined}
        >
          {sending ? '…' : 'Send'}
        </Button>
      </div>
    </form>
  );
}
