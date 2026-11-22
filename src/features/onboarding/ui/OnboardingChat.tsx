'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import { streamChat } from '../api/onboardingClient';
import type { ChatMessage, BasicInfo } from '../model/schemas';

interface Props {
  messages: ChatMessage[];
  onMessagesChange: (msgs: ChatMessage[]) => void;
  onDone: (finalMessages: ChatMessage[]) => void;
  basicInfo?: BasicInfo;
  disabled?: boolean;
}

export function OnboardingChat({ messages, onMessagesChange, onDone, basicInfo, disabled }: Props) {
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming || disabled) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMsgs = [...messages, userMsg];
    onMessagesChange(updatedMsgs);

    setStreaming(true);
    let assistantText = '';

    try {
      await streamChat(
        updatedMsgs,
        (token) => {
          assistantText += token;
          onMessagesChange([...updatedMsgs, { role: 'assistant', content: assistantText }]);
        },
        undefined,
        basicInfo,
      );
      onMessagesChange([...updatedMsgs, { role: 'assistant', content: assistantText }]);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  const canFinish = userMsgCount >= 6 && !streaming;

  return (
    <div className="flex flex-col gap-4">
      <div
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        aria-busy={streaming}
        className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Starting your onboarding chat...
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <Skeleton className="h-9 w-32 rounded-2xl" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Textarea
        value={input}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send)"
        aria-label="Your message"
        className="min-h-[80px] resize-none"
        disabled={streaming || disabled}
      />

      <div className="flex gap-3">
        <Button
          onClick={() => void sendMessage()}
          disabled={!input.trim() || streaming || disabled}
          className="flex-1"
        >
          {streaming ? 'Sending…' : 'Send'}
        </Button>
        {canFinish && (
          <Button variant="outline" onClick={() => onDone(messages)}>
            Done — extract my profile
          </Button>
        )}
      </div>
    </div>
  );
}
