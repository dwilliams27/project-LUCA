import { GameServiceLocator } from "@/services/ServiceLocator";
import { LucaTool } from "@/services/ToolService";
import { agentStore } from "@/store/gameStore";
import { Direction } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { getRelativeGridCell } from "@/utils/grid";
import { cloneWithMaxDepth } from "@/utils/helpers";
import { applyAgentUpdates } from "@/utils/state";

export const MOVE_GRID_CELL_TOOL = "MOVE_GRID_CELL_TOOL";
export const MoveGridCellTool: LucaTool = {
  name: MOVE_GRID_CELL_TOOL,
  description: "Move from one grid cell to an adjacent cell (non-immediate)",
  input_schema: {
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
  requiredContext: [CONTEXT.AGENT_ID],
  implementation: (params: { direction: Direction }, serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentState = agentStore.getState();
    const agentRef = agentState.agentMap[agentId];
    const agentUpdates = {
      mental: cloneWithMaxDepth(agentRef.mental, 3),
      physics: cloneWithMaxDepth(agentRef.physics, 3),
    };
    const newCell = getRelativeGridCell(agentRef.physics.currentCell, params.direction);

    if (agentUpdates.physics.moving || !newCell) {
      return { status: 0, context: {} };
    }

    agentUpdates.physics.moving = true;
    agentUpdates.physics.destinationCell = newCell;
    agentUpdates.mental.knownCells[newCell.y][newCell.x] = 1;
    agentUpdates.mental.readyToThink = true;

    applyAgentUpdates({ [agentId]: agentUpdates });

    console.log('Move grid cell Tool complete', agentUpdates);

    return { status: 1, context: {} };
  }
}