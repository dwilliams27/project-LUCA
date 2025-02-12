import type { Prompt } from "@/services/PromptService";

export const COLLECT_RESOURCE_GOAL_PROMPT = "COLLECT_RESOURCE_GOAL_PROMPT";
export const CollectResourcePrompt: Prompt = {
  name: COLLECT_RESOURCE_GOAL_PROMPT,
  text: `
    Collect {{RESOURCE}}
  `,
  templateStrings: {
    RESOURCE: []
  },
  tools: [],
  version: "1.0.0"
}
