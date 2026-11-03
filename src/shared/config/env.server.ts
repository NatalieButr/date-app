import 'server-only';

import { z } from 'zod';

const ServerEnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  CLAUDE_MODEL_SMART: z.string().min(1),
  CLAUDE_MODEL_FAST: z.string().min(1),
  VOYAGE_API_KEY: z.string().min(1),
  VOYAGE_MODEL: z.string().min(1),
  EMBEDDING_DIM: z.coerce.number().int().positive().default(1024),
  SUPABASE_SECRET_KEY: z.string().min(1),
  ADMIN_EMAILS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  DEMO_USER_EMAIL: z.email().optional(),
  DEMO_USER_PASSWORD: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cached: ServerEnv | undefined;

// Валидация ленивая: сборка проходит без ключей, ошибка — при первом обращении
export function serverEnv(): ServerEnv {
  cached ??= ServerEnvSchema.parse(process.env);
  return cached;
}
