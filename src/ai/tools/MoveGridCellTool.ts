import { GameServiceLocator } from "@/services/ServiceLocator";
import { LucaTool } from "@/services/ToolService";
import { agentStore } from "@/store/gameStore";
import { Direction } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { getRelativeGridCell } from "@/utils/grid";
import { cloneDeep } from "lodash-es";

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
    const agent = cloneDeep(agentState.agentMap[agentId]);
    const newCell = getRelativeGridCell(agent.currentCell, params.direction);

    if (agent.moving || !newCell) {
      return { status: 0, context: {} };
    }

    agent.moving = true;
    agent.destinationCell = newCell;
    agent.knownCells[newCell.y][newCell.x] = 1;

    agentStore.setState({
      ...agentState,
      agentMap: {
        ...agentState.agentMap,
        [agentId]: agent
      }
    });

    return { status: 1, context: {} };
  }
}