import 'server-only';

import type { ZodType } from 'zod';
import { toJSONSchema } from 'zod/v4/core';
import type { Tool, ToolUseBlock } from '@anthropic-ai/sdk/resources';
import { complete } from './complete';
import type { CallOptions } from './complete';
import { StructuredOutputError } from './errors';

export async function structured<T>(opts: CallOptions, schema: ZodType<T>): Promise<T> {
  const toolName = 'structured_output';
  // toJSONSchema returns JSONSchema.JSONSchema, not Tool.InputSchema; shapes are compatible.
  const jsonSchema = toJSONSchema(schema) as Tool.InputSchema;

  const toolOpts: CallOptions = {
    ...opts,
    tools: [
      {
        name: toolName,
        description: 'Output the structured data exactly as specified.',
        input_schema: jsonSchema,
      },
    ],
    toolChoice: { type: 'tool', name: toolName },
  };

  const message = await complete(toolOpts);

  const toolBlock = message.content.find(
    (b): b is ToolUseBlock => b.type === 'tool_use' && b.name === toolName,
  );
  if (!toolBlock) {
    throw new StructuredOutputError('No tool_use block in response');
  }

  const result1 = schema.safeParse(toolBlock.input);
  if (result1.success) return result1.data;

  // One retry with the validation error sent back as a tool result
  const retryOpts: CallOptions = {
    ...toolOpts,
    messages: [
      ...opts.messages,
      { role: 'assistant', content: message.content },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result' as const,
            tool_use_id: toolBlock.id,
            content: `Validation failed: ${result1.error.message}. Fix the output and call the tool again.`,
          },
        ],
      },
    ],
  };

  const message2 = await complete(retryOpts);

  const toolBlock2 = message2.content.find(
    (b): b is ToolUseBlock => b.type === 'tool_use' && b.name === toolName,
  );
  if (!toolBlock2) {
    throw new StructuredOutputError('No tool_use block in retry response');
  }

  const result2 = schema.safeParse(toolBlock2.input);
  if (result2.success) return result2.data;

  throw new StructuredOutputError(
    'Structured output validation failed after retry',
    result2.error.message,
  );
}
