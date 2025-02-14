import { MOVE_GRID_CELL_TOOL, MoveGridCellTool } from "@/ai/tools/MoveGridCellTool";
import { SENSE_ADJACENT_CELL_TOOL, SenseAdjacentCellTool } from "@/ai/tools/SenseAdjacentCellTool";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
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
  private toolMap: Record<string, Tool>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);

    this.toolMap = {
      [MOVE_GRID_CELL_TOOL]: MoveGridCellTool,
      [SENSE_ADJACENT_CELL_TOOL]: SenseAdjacentCellTool,
    }
  }

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
