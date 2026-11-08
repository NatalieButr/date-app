import 'server-only';

import { complete } from '@/shared/ai';

import { SuggestDateIdeasInputSchema } from '../../model/schemas';

export interface DateIdea {
  title: string;
  description: string;
}

const PROMPT_VERSION = '1.0.0';

export async function suggestDateIdeasTool(
  viewerId: string,
  rawInput: unknown,
): Promise<DateIdea[]> {
  const { city, interests } = SuggestDateIdeasInputSchema.parse(rawInput);

  const message = await complete({
    tier: 'fast',
    feature: 'wingman',
    promptVer: PROMPT_VERSION,
    system:
      'You are a creative date planner. Suggest 3–5 specific, fun date ideas for a given city and shared interests. Return ONLY a JSON array of objects with "title" (string) and "description" (1–2 sentences) fields. No other text.',
    messages: [
      {
        role: 'user',
        content: `<city>${city}</city>\n<interests>${interests.join(', ')}</interests>\n\nSuggest 3–5 date ideas.`,
      },
    ],
    maxTokens: 400,
    userId: viewerId,
    allowFallback: true,
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return [];

  try {
    const raw: unknown = JSON.parse(textBlock.text);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (item): item is DateIdea =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).title === 'string' &&
          typeof (item as Record<string, unknown>).description === 'string',
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}
