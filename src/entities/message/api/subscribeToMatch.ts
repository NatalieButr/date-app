'use client';

import { createClient } from '@supabase/supabase-js';

import type { Message } from '../model/schemas';
import { MessageRowSchema } from '../model/schemas';

type MessageCallback = (message: Message) => void;

export function subscribeToMatch(
  supabaseUrl: string,
  supabaseKey: string,
  matchId: string,
  onMessage: MessageCallback,
) {
  const client = createClient(supabaseUrl, supabaseKey);

  const channel = client
    .channel(`match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        const parsed = MessageRowSchema.safeParse(payload.new);
        if (parsed.success) {
          onMessage(parsed.data);
        }
      },
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
