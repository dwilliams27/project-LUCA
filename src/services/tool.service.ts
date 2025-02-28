import { CONVERT_MATTER_TO_SIZE_TOOL, ConvertMatterToSizeTool } from "@/ai/tools/convert-matter-to-size.tool";
import { GATHER_RESOURCE_TOOL, GatherResourceTool } from "@/ai/tools/gather-resource.tool";
import { MOVE_GRID_CELL_TOOL, MoveGridCellTool } from "@/ai/tools/move-grid-cell.tool";
import { SENSE_ADJACENT_CELL_TOOL, SenseAdjacentCellTool } from "@/ai/tools/sense-adjacent-cell.tool";
import { GameServiceLocator, LocatableGameService } from "@/services/service-locator";

import type { LucaTool } from "@/services/types/tool.service.types";

export class ToolService extends LocatableGameService {
  static name = "TOOL_SERVICE";
  private toolMap: Record<string, LucaTool>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);

    this.toolMap = {
      [GATHER_RESOURCE_TOOL]: GatherResourceTool,
      [MOVE_GRID_CELL_TOOL]: MoveGridCellTool,
      [SENSE_ADJACENT_CELL_TOOL]: SenseAdjacentCellTool,
      [CONVERT_MATTER_TO_SIZE_TOOL]: ConvertMatterToSizeTool,
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
