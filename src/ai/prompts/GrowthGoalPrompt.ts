import type { Prompt } from "@/services/PromptService";

export const GROWTH_GOAL_PROMPT = "GROWTH_GOAL_PROMPT";
export const GrowthGoalPrompt: Prompt = {
  name: GROWTH_GOAL_PROMPT,
  text: `
Grow as large as you can.
  `,
  contextAdapters: [],
  tools: [],
  version: "1.0.0"
}
