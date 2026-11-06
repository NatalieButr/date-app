import 'server-only';

import { z } from 'zod';
import { type NextRequest, NextResponse } from 'next/server';

import { getMatchForViewer } from '@/entities/match/server';
import { requireViewer } from '@/entities/viewer/server';
import { badRequest, forbidden, unauthorized } from '@/shared/lib/http';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';

import { MessageRowSchema, type Message, type MessageRow } from '../model/schemas';

const GetMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().uuid().optional(),
});

export async function listMessages(
  matchId: string,
  limit = 50,
  before?: string,
): Promise<Message[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    const { data: cursor } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', before)
      .single();
    if (cursor) {
      query = query.lt('created_at', cursor.created_at);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`listMessages failed: ${error.message}`);

  return (data ?? []).map((row) => MessageRowSchema.parse(row));
}

export async function createMessage(
  matchId: string,
  senderId: string,
  body: string,
  moderation: MessageRow['moderation'],
  modReason?: string | null,
): Promise<Message> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      body,
      moderation,
      mod_reason: modReason ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`createMessage failed: ${error.message}`);
  return MessageRowSchema.parse(data);
}

/** Atomically inserts a warning and returns the user's total warning count. */
export async function insertWarningAndCount(
  userId: string,
  matchId: string,
  messageId: string | null,
  reason: string,
): Promise<number> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc('insert_warning_and_count', {
    p_user_id: userId,
    p_match_id: matchId,
    p_message_id: messageId ?? undefined,
    p_reason: reason,
  });
  if (error) throw new Error(`insertWarningAndCount failed: ${error.message}`);
  return data ?? 0;
}

export async function listMessagesGET(req: NextRequest, matchId: string) {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
  }

  const match = await getMatchForViewer(matchId, viewer.id);
  if (!match) return forbidden();

  const { searchParams } = req.nextUrl;
  const parsed = GetMessagesQuerySchema.safeParse({
    limit: searchParams.get('limit'),
    before: searchParams.get('before') ?? undefined,
  });
  if (!parsed.success) {
    return badRequest('validation_error', parsed.error.issues[0]?.message ?? 'Invalid query');
  }

  const messages = await listMessages(matchId, parsed.data.limit, parsed.data.before);
  return NextResponse.json({ messages });
}
