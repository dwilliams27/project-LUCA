import { CellAgentPrompt } from "@/ai/prompts/CellAgentPrompt";
import { COLLECT_RESOURCE_GOAL_PROMPT, CollectResourceGoalPrompt } from "@/ai/prompts/CollectResourceGoalPrompt";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { Tool } from "@/services/ToolService";
import { GameState } from "@/store/gameStore";
import { cloneDeep } from "lodash-es";

export interface Prompt {
  name: string;
  text: string;
  contextAdapters: ContextAdapter[];
  tools: Tool[];
  version: string;
}

export interface ContextAdapter {
  name: string;
  templateString: string;
  requiredContext: string[];
  getText: (gameState: GameState, context: Record<string, any>) => string;
}

export class PromptService extends LocatableGameService {
  static name = "PROMPT_SERVICE";
  private promptCatalog: Record<string, Prompt>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    this.promptCatalog = {
      CELL_AGENT_PROMPT: CellAgentPrompt,
      COLLECT_RESOURCE_GOAL_PROMPT: CollectResourceGoalPrompt
    };
  }

  populate(prompt: Prompt, gameState: GameState, context: Record<string, any>): string {
    let populatedText = prompt.text;
    prompt.contextAdapters.forEach((contextAdapter) => {
      populatedText = populatedText.replace(new RegExp(`\\{\\{${contextAdapter.templateString}\\}\\}`, 'g'), contextAdapter.getText(gameState, context));
    });
    return populatedText;
  }

  getBasePrompt(name: string): Prompt {
    return cloneDeep(this.promptCatalog[name]);
  }
}
