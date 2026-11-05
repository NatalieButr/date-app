'use client';

import type { ChatMessage, ProfileExtract, BioOptions, BasicInfo } from '../model/schemas';

export async function extractProfile(messages: ChatMessage[], basicInfo?: BasicInfo): Promise<ProfileExtract> {
  const res = await fetch('/api/onboarding/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, basicInfo }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? 'Extract failed');
  }
  return res.json() as Promise<ProfileExtract>; // server validates with ProfileExtractSchema; cast is safe
}

export async function generateBio(messages: ChatMessage[], basicInfo?: BasicInfo): Promise<BioOptions> {
  const res = await fetch('/api/onboarding/bio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, basicInfo }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? 'Bio generation failed');
  }
  return res.json() as Promise<BioOptions>; // server validates with BioOptionsSchema; cast is safe
}

export function streamChat(
  messages: ChatMessage[],
  onToken: (text: string) => void,
  signal?: AbortSignal,
  basicInfo?: BasicInfo,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch('/api/onboarding/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, basicInfo }),
      signal,
    })
      .then((res) => {
        if (!res.ok || !res.body) {
          reject(new Error('Chat stream failed'));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              resolve();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const event = JSON.parse(line.slice(6)) as { type?: string; delta?: { type?: string; text?: string } };
                if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                  onToken(event.delta.text ?? '');
                }
              } catch {
                // ignore parse errors
              }
            }
            return pump();
          });
        }
        return pump();
      })
      .catch(reject);
  });
}
