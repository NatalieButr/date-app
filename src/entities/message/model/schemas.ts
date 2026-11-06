import { z } from 'zod';

export const MessageRowSchema = z.object({
  id: z.string().uuid(),
  match_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  body: z.string(),
  moderation: z.enum(['ok', 'warn', 'block']),
  mod_reason: z.string().nullable(),
  created_at: z.string(),
});

export type MessageRow = z.infer<typeof MessageRowSchema>;

export const MessageSchema = MessageRowSchema;
export type Message = z.infer<typeof MessageSchema>;

export const SendMessageBodySchema = z.object({
  body: z.string().min(1).max(2000),
});

export type SendMessageBody = z.infer<typeof SendMessageBodySchema>;
