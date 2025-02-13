import { LocatableGameService } from "@/services/ServiceLocator";
import { GameState } from "@/store/gameStore";

export interface ToolCallResult {
  status: number;
  context: Record<string, any>;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      required?: boolean;
      [key: string]: any;
    }>;
    required?: string[];
  };
  requiredContext: string[];
  implementation: (params: any, gameState: GameState, context: Record<string, any>) => ToolCallResult;
}

export class ToolService extends LocatableGameService {
  static name = "TOOL_SERVICE";
  private toolMap: Record<string, Tool> = {};

  registerTool(tool: Tool) {
    if (this.toolMap[tool.name]) {
      console.warn(`Failed to register ${tool.name}; duplicate tool already exists`);
      return;
    }
    this.toolMap[tool.name] = tool;
  }

  getTool(name: string) {
    return this.toolMap[name];
  }
}
