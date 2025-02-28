import { CellAgentPrompt } from "@/ai/prompts/cell-agent.prompt";
import { CellAgentSystemPrompt } from "@/ai/prompts/cell-agent.system-prompt";
import { CollectResourceGoalPrompt } from "@/ai/prompts/collect-resource-goal.prompt";
import { GrowthGoalPrompt } from "@/ai/prompts/growth-goal.prompt";
import { GameServiceLocator, LocatableGameService } from "@/services/service-locator";
import { cloneDeep } from "lodash-es";

import type { Prompt } from "@/services/types/prompt.service.types";

export class PromptService extends LocatableGameService {
  static name = "PROMPT_SERVICE";
  private promptCatalog: Record<string, Prompt>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    this.promptCatalog = {
      CELL_AGENT_PROMPT: CellAgentPrompt,
      CELL_AGENT_SYSTEM_PROMPT: CellAgentSystemPrompt,
      COLLECT_RESOURCE_GOAL_PROMPT: CollectResourceGoalPrompt,
      GROWTH_GOAL_PROMPT: GrowthGoalPrompt
    };
  }

  constructPromptText(prompt: Prompt, context: Record<string, any>): string {
    let populatedText = prompt.text;
    prompt.contextAdapters.forEach((contextAdapter) => {
      populatedText = populatedText.replace(new RegExp(`\\{\\{${contextAdapter.templateString}\\}\\}`, 'g'), contextAdapter.getText(this.serviceLocator, context));
    });
    return populatedText;
  }

  getBasePrompt(name: string): Prompt {
    return cloneDeep(this.promptCatalog[name]);
  }
}
