import { GATHER_RESOURCE_TOOL, GatherResourceTool } from "@/ai/tools/GatherResourceTool";
import { MOVE_GRID_CELL_TOOL, MoveGridCellTool } from "@/ai/tools/MoveGridCellTool";
import { SENSE_ADJACENT_CELL_TOOL, SenseAdjacentCellTool } from "@/ai/tools/SenseAdjacentCellTool";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { Tool } from "@anthropic-ai/sdk/resources";

export interface ToolCallResult {
  status: number;
  context: Record<string, any>;
}

export interface LucaTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
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

  registerTool(tool: LucaTool) {
    if (this.toolMap[tool.name]) {
      console.warn(`Failed to register ${tool.name}; duplicate tool already exists`);
      return;
    }
    this.toolMap[tool.name] = tool;
  }

  getTool(name: string) {
    return this.toolMap[name];
  }

  getAnthropicRepresentation(tools: LucaTool[]): Tool[] {
    return tools.map((tool) => ({
      name: tool.name,
      input_schema: tool.input_schema
    }));
  }
}
