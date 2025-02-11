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
  getContext: (gameState: GameState, miscContext: Record<string, any>) => string;
}

export class PromptService extends LocatableGameService {
  static name = "PROMPT_SERVICE";
  private promptCatalog: Record<string, Prompt>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    this.promptCatalog = {
      
    };
  }

  populate(prompt: Prompt, values: Record<string, string>): string {
    let populatedText = prompt.text;
    prompt.templateStrings.forEach(key => {
      populatedText = populatedText.replace(`/\{\{(${key})\}\}/g`, values[key]);
    });
    return populatedText;
  }

  getBasePrompt(name: string): Prompt {
    return cloneDeep(this.promptCatalog[name]);
  }
}
