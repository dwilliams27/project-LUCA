import { CellAgentPrompt } from "@/ai/prompts/CellAgentPrompt";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { Tool } from "@/services/tools/ToolService";
import { GameState } from "@/store/gameStore";
import { cloneDeep } from "lodash-es";

export interface Prompt {
  name: string;
  text: string;
  templateStrings: Record<string, ContextAdapter[]>;
  tools: Tool[];
  version: string;
}

export interface ContextAdapter {
  name: string;
  requiredContext: string[];
  getText: (gameState: GameState, context: Record<string, any>) => string;
}

export class PromptService extends LocatableGameService {
  static name = "PROMPT_SERVICE";
  private promptCatalog: Record<string, Prompt>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    this.promptCatalog = {
      CELL_AGENT_PROMPT: CellAgentPrompt
    };
  }

  populate(prompt: Prompt, gameState: GameState, context: Record<string, string>): string {
    let populatedText = prompt.text;
    Object.keys(prompt.templateStrings).forEach(key => {
      for(let i = 0; i < prompt.templateStrings[key].length; i++) {
        populatedText = populatedText.replace(`/\{\{(${key})\}\}/g`, prompt.templateStrings[key][i].getText(gameState, context));
      }
    });
    return populatedText;
  }

  getBasePrompt(name: string): Prompt {
    return cloneDeep(this.promptCatalog[name]);
  }
}
