import { Agent } from "@/services/AgentService";
import { LucaTool } from "@/services/ToolService";
import { GameState } from "@/store/gameStore";
import { Direction } from "@/types";
import { getRelativeGridCell } from "@/utils/grid";

export const SENSE_ADJACENT_CELL_TOOL = "SENSE_ADJACENT_CELL_TOOl";
export const SenseAdjacentCellTool: LucaTool = {
  name: SENSE_ADJACENT_CELL_TOOL,
  description: "Get information about the contents of an adjacent cell (immediate)",
  input_schema: {
    type: "object",
    properties: {
      direction: {
        type: "string",
        enum: [`${Direction.NORTH}`, `${Direction.EAST}`, `${Direction.SOUTH}`, `${Direction.WEST}`],
        description: "The direction to sense: north, east, south, west"
      }
    },
    required: ["direction"]
  },
  requiredContext: ["AGENT_OBJECT"],
  implementation: (params: { direction: Direction }, gameState: GameState, context: Record<string, any>) => {
    const agent = context["AGENT_OBJECT"] as unknown as Agent;
    const newCell = getRelativeGridCell(agent.position, params.direction);
    if (!newCell) {
      return { status: 0, context: {} };
    }

    agent.knownCells[newCell.y][newCell.x] = 1;

    return { status: 1, context: {} };
  }
}
