import 'server-only';

import type { Tool } from '@/shared/ai';

export const WINGMAN_PROMPT_VERSION = '1.0.0';

export function getWingmanSystem(): string {
  return `You are Wingman, an AI dating assistant inside the Spark app. You help users find compatible matches and craft thoughtful first messages.

Your personality: warm, perceptive, and direct. You give concrete suggestions, not vague advice.

Your capabilities:
- Search for profiles that match a description or vibe
- Look up a specific profile by ID
- Check the user's existing matches and their last message
- Suggest date ideas for a city and shared interests
- Draft a personalized opening message to a match

How to approach a request:
1. If the user wants to find someone new — search profiles, then optionally draft a message to the best match.
2. If the user wants help with an existing match — get their matches, then suggest a reply or date idea.
3. If the user asks for a date idea — gather city/interests first (from profile data if needed), then suggest ideas.
4. Combine tools when it saves a step: e.g. search + draft in one pass.

Rules:
- Call at most 8 tools total. Stop and give your best answer with what you have if you approach the limit.
- Prefer quality over quantity: 1–3 great suggestions beats 10 mediocre ones.
- Never invent profile data. Only use what tools return.
- If a tool returns an error, skip it gracefully and continue with what you have.
- After gathering information, always end with a final answer summarising what you found and any drafts.

The final answer must be in the same language the user wrote in.`;
}

export function getWingmanTools(): Tool[] {
  return [
    {
      name: 'search_profiles',
      description:
        'Search for Spark profiles that match a natural-language description (e.g. "someone who loves hiking and lives in Warsaw"). Returns up to 10 profiles with name, age, city, and bio. Use this when the user wants to find a new person.',
      input_schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Natural-language description of the person to find.',
          },
          city: {
            type: 'string',
            description: 'Filter results to profiles in this city (optional).',
          },
          limit: {
            type: 'number',
            description: 'Number of results to return (1–10, default 5).',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_profile',
      description:
        'Fetch full details of a single profile by its UUID. Use this when you already have a profile ID and need more information before drafting a message.',
      input_schema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'UUID of the profile to retrieve.',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'get_my_matches',
      description:
        "Get the user's current mutual matches, each with the other person's profile and the last message in that conversation (if any). Use this when the user wants help with someone they've already matched with.",
      input_schema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'suggest_date_ideas',
      description:
        'Generate 3–5 specific, fun date ideas for a given city and list of shared interests. Use this when the user wants ideas for where to meet someone.',
      input_schema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City where the date would take place.',
          },
          interests: {
            type: 'array',
            items: { type: 'string' },
            description:
              "List of shared interests to base ideas on (e.g. ['hiking', 'photography']).",
          },
        },
        required: ['city', 'interests'],
      },
    },
    {
      name: 'draft_message',
      description:
        'Write a personalised opening message from the user to a specific match. The message references details from both profiles to feel genuine, not generic. Use this after you know who the user wants to contact and roughly what they want to say.',
      input_schema: {
        type: 'object',
        properties: {
          target_id: {
            type: 'string',
            description: 'UUID of the profile the user wants to message.',
          },
          intent: {
            type: 'string',
            description:
              "What the user wants to convey or ask about (e.g. 'ask about their hike last weekend', 'suggest getting coffee'). Keep this concise.",
          },
        },
        required: ['target_id', 'intent'],
      },
    },
  ];
}
