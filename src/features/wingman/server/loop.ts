import 'server-only';

import type { Message, MessageParam, ToolResultBlockParam, ToolUseBlock } from '@/shared/ai';
import { complete } from '@/shared/ai';

import type { WingmanDraft, WingmanEvent } from '../model/schemas';
import { getWingmanSystem, getWingmanTools, WINGMAN_PROMPT_VERSION } from './prompts';

export type ToolDispatch = Record<string, (input: unknown) => Promise<unknown>>;

const MAX_STEPS = 8;
const TIMEOUT_MS = 60_000;

function toolUseBlocks(message: Message): ToolUseBlock[] {
  return message.content.filter((b): b is ToolUseBlock => b.type === 'tool_use');
}

function textContent(message: Message): string {
  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('\n')
    .trim();
}

async function dispatchTool(
  name: string,
  input: unknown,
  dispatch: ToolDispatch,
): Promise<{ content: string; isError: boolean }> {
  const handler = dispatch[name];
  if (!handler) {
    return { content: `Unknown tool: ${name}`, isError: true };
  }
  try {
    const result = await handler(input);
    return { content: JSON.stringify(result), isError: false };
  } catch (err) {
    return {
      content: err instanceof Error ? err.message : String(err),
      isError: true,
    };
  }
}

const TOOL_LABELS: Record<string, string> = {
  search_profiles: 'Searching for profiles…',
  get_profile: 'Looking up profile…',
  get_my_matches: 'Fetching your matches…',
  suggest_date_ideas: 'Coming up with date ideas…',
  draft_message: 'Drafting a message…',
};

// Extract drafts from tool results accumulated during the loop.
function extractDrafts(messages: MessageParam[]): WingmanDraft[] {
  const drafts: WingmanDraft[] = [];
  for (const msg of messages) {
    if (msg.role !== 'user' || !Array.isArray(msg.content)) continue;
    for (const block of msg.content) {
      if (
        typeof block === 'object' &&
        block !== null &&
        'type' in block &&
        (block as ToolResultBlockParam).type === 'tool_result'
      ) {
        const tr = block as ToolResultBlockParam;
        if (tr.is_error) continue;
        const rawContent = tr.content;
        const text =
          typeof rawContent === 'string'
            ? rawContent
            : Array.isArray(rawContent)
              ? rawContent
                  .filter(
                    (c) =>
                      typeof c === 'object' &&
                      c !== null &&
                      'type' in c &&
                      (c as { type: string }).type === 'text',
                  )
                  .map((c) => (c as { type: string; text: string }).text)
                  .join('')
              : '';
        try {
          const parsed: unknown = JSON.parse(text);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'targetId' in parsed &&
            'text' in parsed &&
            typeof (parsed as Record<string, unknown>).targetId === 'string' &&
            typeof (parsed as Record<string, unknown>).text === 'string'
          ) {
            drafts.push(parsed as WingmanDraft);
          }
        } catch {
          // not a draft result
        }
      }
    }
  }
  return drafts;
}

export async function wingmanLoop(
  viewerId: string,
  query: string,
  toolDispatch: ToolDispatch,
  sendEvent: (event: WingmanEvent) => void,
): Promise<void> {
  const deadline = Date.now() + TIMEOUT_MS;
  const messages: MessageParam[] = [{ role: 'user', content: query }];
  const tools = getWingmanTools();
  const system = getWingmanSystem();

  let steps = 0;

  while (steps < MAX_STEPS) {
    if (Date.now() > deadline) break;

    const message = await complete({
      tier: 'smart',
      feature: 'wingman',
      promptVer: WINGMAN_PROMPT_VERSION,
      system,
      messages,
      tools,
      toolChoice: steps < MAX_STEPS - 1 ? { type: 'auto' } : { type: 'any' },
      maxTokens: 1024,
      userId: viewerId,
      allowFallback: false,
    });

    messages.push({ role: 'assistant', content: message.content });

    const toolCalls = toolUseBlocks(message);

    if (toolCalls.length === 0 || message.stop_reason === 'end_turn') {
      // Model finished — send final event
      const finalText = textContent(message);
      const drafts = extractDrafts(messages);
      sendEvent({ type: 'final', text: finalText, profiles: [], drafts });
      return;
    }

    steps++;

    // Emit step events before dispatching
    for (const call of toolCalls) {
      sendEvent({
        type: 'step',
        tool: call.name,
        label: TOOL_LABELS[call.name] ?? `Running ${call.name}…`,
      });
    }

    // Dispatch all tool calls in parallel
    const results = await Promise.all(
      toolCalls.map((call) => dispatchTool(call.name, call.input, toolDispatch)),
    );

    const toolResults: ToolResultBlockParam[] = toolCalls.map((call, i) => ({
      type: 'tool_result' as const,
      tool_use_id: call.id,
      content: results[i]?.content ?? '',
      is_error: results[i]?.isError ?? false,
    }));

    messages.push({ role: 'user', content: toolResults });
  }

  // Step limit or timeout reached — ask model to summarise with what it has
  const finalMessage = await complete({
    tier: 'smart',
    feature: 'wingman',
    promptVer: WINGMAN_PROMPT_VERSION,
    system,
    messages: [
      ...messages,
      {
        role: 'user',
        content: 'Please give your best answer now based on the information gathered so far.',
      },
    ],
    maxTokens: 512,
    userId: viewerId,
    allowFallback: false,
  });

  const finalText = textContent(finalMessage);
  const drafts = extractDrafts(messages);
  sendEvent({ type: 'final', text: finalText, profiles: [], drafts });
}
