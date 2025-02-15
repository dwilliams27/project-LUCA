import { GameServiceLocator } from "@/services/ServiceLocator";
import { LucaTool } from "@/services/ToolService";
import { agentStore } from "@/store/gameStore";
import { Direction } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { getRelativeGridCell } from "@/utils/grid";
import { cloneDeep } from "lodash-es";

export const SENSE_ADJACENT_CELL_TOOL = "SENSE_ADJACENT_CELL_TOOL";
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
  requiredContext: [CONTEXT.AGENT_ID],
  implementation: (params: { direction: Direction }, serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentState = agentStore.getState();
    const agent = cloneDeep(agentState.agentMap[agentId]);
    const newCell = getRelativeGridCell(agent.position, params.direction);
    if (!newCell) {
      return { status: 0, context: {} };
    }

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
