import { CellAgentPrompt } from "@/ai/prompts/CellAgentPrompt";
import { CellAgentSystemPrompt } from "@/ai/prompts/CellAgentSystemPrompt";
import { CollectResourceGoalPrompt } from "@/ai/prompts/CollectResourceGoalPrompt";
import { GrowthGoalPrompt } from "@/ai/prompts/GrowthGoalPrompt";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { LucaTool } from "@/services/ToolService";
import { GameState } from "@/store/gameStore";
import { cloneDeep } from "lodash-es";

export interface Prompt {
  name: string;
  text: string;
  contextAdapters: ContextAdapter[];
  tools: LucaTool[];
  version: string;
}

export interface ContextAdapter {
  name: string;
  templateString: string;
  requiredContext: string[];
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => string;
}

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
