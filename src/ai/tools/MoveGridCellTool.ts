import { Agent } from "@/services/AgentService";
import { Tool } from "@/services/ToolService";
import { GameState } from "@/store/gameStore";
import { Direction } from "@/types";
import { getRelativeGridCell } from "@/utils/grid";

export const MoveGridCellTool: Tool = {
  name: "MoveGridCell",
  description: "Move from one grid cell to an adjacent cell (non-immediate)",
  inputSchema: {
    type: "object",
    properties: {
      direction: {
        type: "string",
        enum: [`${Direction.NORTH}`, `${Direction.EAST}`, `${Direction.SOUTH}`, `${Direction.WEST}`],
        description: "The direction to move: north, east, south, west"
      }
    },
    required: ["direction"]
  },
  requiredContext: ["AGENT_OBJECT"],
  implementation: (params: { direction: Direction }, gameState: GameState, context: Record<string, any>) => {
    const agent = context["AGENT_OBJECT"] as unknown as Agent;
    const newCell = getRelativeGridCell(agent.currentCell, params.direction);
    if (agent.moving || !newCell) {
      return { status: 0, context: {} };
    }

    agent.moving = true;
    agent.destinationCell = newCell;
    agent.knownCells[newCell.y][newCell.x] = 1;

    return { status: 1, context: {} };
  }
}