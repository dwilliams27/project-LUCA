import { Prompt } from "@/services/ai/PromptService";
import { LocatableGameService } from "@/services/ServiceLocator";
import { GameState } from "@/store/gameStore";

export interface Goal {
  basePrompt: Prompt;
  basePriority: number;
  getFocusRank: (gameState: GameState) => number;
}

export class GoalService extends LocatableGameService {
  static name = "GOAL_SERVICE";


}
