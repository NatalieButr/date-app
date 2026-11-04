import 'server-only';

import { getAnthropic } from './client';
import { modelFor } from './models';
import { logAiCall } from './log';
import { calculateCost } from './pricing';
import type { CallOptions } from './complete';

const TIMEOUT_MS = 30_000;

export function stream(opts: CallOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const model = modelFor(opts.tier);
      const client = getAnthropic();
      const start = Date.now();
      let inputTokens = 0;
      let outputTokens = 0;
      let cacheReadTokens = 0;
      let cacheWriteTokens = 0;
      let status = 'ok';
      let error: string | undefined;

      try {
        const apiStream = client.messages.stream(
          {
            model,
            max_tokens: opts.maxTokens,
            system: opts.system,
            messages: opts.messages,
            ...(opts.tools ? { tools: opts.tools } : {}),
            ...(opts.toolChoice ? { tool_choice: opts.toolChoice } : {}),
          },
          { timeout: TIMEOUT_MS },
        );

        for await (const event of apiStream) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }

        const finalMessage = await apiStream.finalMessage();
        const usage = finalMessage.usage as typeof finalMessage.usage & {
          cache_read_input_tokens?: number;
          cache_creation_input_tokens?: number;
        };
        inputTokens = usage.input_tokens;
        outputTokens = usage.output_tokens;
        cacheReadTokens = usage.cache_read_input_tokens ?? 0;
        cacheWriteTokens = usage.cache_creation_input_tokens ?? 0;

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        status = 'error';
        error = err instanceof Error ? err.message : String(err);
        controller.error(err);
      } finally {
        logAiCall({
          userId: opts.userId,
          feature: opts.feature,
          model,
          promptVer: opts.promptVer,
          inputTokens,
          outputTokens,
          cacheReadTokens,
          cacheWriteTokens,
          costUsd: calculateCost(opts.tier, {
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cache_read_input_tokens: cacheReadTokens,
            cache_creation_input_tokens: cacheWriteTokens,
          }),
          latencyMs: Date.now() - start,
          status,
          error,
        });
      }
    },
  });
}
