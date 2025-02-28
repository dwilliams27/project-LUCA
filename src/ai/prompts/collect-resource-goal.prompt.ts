import { ResourceStackContextAdapter } from "@/ai/contextAdapters/resource-stack.context-adapter";

import type { Prompt } from "@/services/types/prompt.service.types";

export const COLLECT_RESOURCE_GOAL_PROMPT = "COLLECT_RESOURCE_GOAL_PROMPT";
export const CollectResourceGoalPrompt: Prompt = {
  name: COLLECT_RESOURCE_GOAL_PROMPT,
  text: `
Collect {{RESOURCE_STACK}}
  `,
  contextAdapters: [ResourceStackContextAdapter],
  tools: [],
  version: "1.0.0"
}
