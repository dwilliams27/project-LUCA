import { GATHER_RESOURCE_TOOL, GatherResourceTool } from "@/ai/tools/GatherResourceTool";
import { MOVE_GRID_CELL_TOOL, MoveGridCellTool } from "@/ai/tools/MoveGridCellTool";
import { SENSE_ADJACENT_CELL_TOOL, SenseAdjacentCellTool } from "@/ai/tools/SenseAdjacentCellTool";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { Tool } from "ai";

export interface ToolCallResult {
  status: number;
  context: Record<string, any>;
}

export interface LucaTool {
  name: string;
  tool: Tool;
  requiredContext: string[];
  implementation: (params: any, serviceLocator: GameServiceLocator, context: Record<string, any>) => ToolCallResult;
}

export class ToolService extends LocatableGameService {
  static name = "TOOL_SERVICE";
  private toolMap: Record<string, LucaTool>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);

    this.toolMap = {
      [GATHER_RESOURCE_TOOL]: GatherResourceTool,
      [MOVE_GRID_CELL_TOOL]: MoveGridCellTool,
      [SENSE_ADJACENT_CELL_TOOL]: SenseAdjacentCellTool,
    }
  }

  registerTool(ltool: LucaTool) {
    if (this.toolMap[ltool.name]) {
      console.warn(`Failed to register ${ltool.name}; duplicate tool already exists`);
      return;
    }
    this.toolMap[ltool.name] = ltool;
  }

  getTool(name: string) {
    return this.toolMap[name];
  }

  lucaToolsToAiTools(tools: LucaTool[]) {
    return tools.reduce((acc, ltool) => {
      acc[ltool.name] = ltool.tool;
      return acc;
    }, {});
  }
}
