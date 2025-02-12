import { CollectResourceGoal } from "@/ai/goals/CollectResourceGoal";
import { Prompt, PromptService } from "@/services/PromptService";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { GameState } from "@/store/gameStore";
import { cloneDeep } from "lodash-es";

export interface Goal {
  name: string;
  basePromptName: string;
  basePrompt: Prompt | null;
  basePriority: number;
  requiredContext: string[];
  getFocusRank: (gameState: GameState, context: Record<string, string>) => number;
}

export class GoalService extends LocatableGameService {
  static name = "GOAL_SERVICE";
  private goalCatalog: Record<string, Goal>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    const promptService = serviceLocator.getService(PromptService);
    this.goalCatalog = {
      COLLECT_RESOURCE_GOAL: {
        ...CollectResourceGoal,
        basePrompt: promptService.getBasePrompt(CollectResourceGoal.basePromptName)
      }
    }
  }

  getBaseGoal(name: string) {
    return cloneDeep(this.goalCatalog[name]);
  }
}
