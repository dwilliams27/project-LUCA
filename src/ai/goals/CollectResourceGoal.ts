import { COLLECT_RESOURCE_GOAL_PROMPT } from "@/ai/prompts/CollectResourceGoalPrompt";
import { Goal } from "@/services/GoalService";
import { GameState } from "@/store/gameStore";

export const COLLECT_RESOURCE_GOAL = "COLLECT_RESOURCE_GOAL";
export const CollectResourceGoal: Goal = {
  name: COLLECT_RESOURCE_GOAL,
  basePromptName: COLLECT_RESOURCE_GOAL_PROMPT,
  basePrompt: null,
  basePriority: 0,
  requiredContext: [],
  getFocusRank: function (gameState: GameState, context: Record<string, string>): number {
    return 1;
  }
}
