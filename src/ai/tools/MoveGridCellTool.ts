import { Agent } from "@/services/AgentService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { LucaTool } from "@/services/ToolService";
import { agentStore } from "@/store/gameStore";
import { DeepPartial, Direction } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { getRelativeGridCell } from "@/utils/grid";
import { cloneWithMaxDepth } from "@/utils/helpers";
import { applyAgentUpdates } from "@/utils/state";

export const MOVE_GRID_CELL_TOOL = "MOVE_GRID_CELL_TOOL";
export const MoveGridCellTool: LucaTool = {
  name: MOVE_GRID_CELL_TOOL,
  description: "Move to an adjacent grid cell",
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
  implementation: (params: { direction: string }, serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentState = agentStore.getState();
    const agentRef = agentState.agentMap[agentId];
    const agentUpdates: DeepPartial<Agent> = {
      mental: { readyToThink: true, knownCells: cloneWithMaxDepth(agentRef.mental.knownCells, 2) },
      physics: {},
    };
    const newCell = getRelativeGridCell(agentRef.physics.currentCell, parseInt(params.direction));

    if (!newCell) {
      console.warn('No destination cell, exiting MoveGridCell tool early');
      applyAgentUpdates({ [agentId]: agentUpdates } as Record<string, Partial<Agent>>, true);
      return { status: 0, context: {} };
    }

    agentUpdates.physics!.moving = true;
    agentUpdates.physics!.destinationCell = newCell;
    agentUpdates.mental!.knownCells![newCell.y]![newCell.x] = 1;

    applyAgentUpdates({ [agentId]: agentUpdates } as Record<string, Partial<Agent>>, true);

    console.log('Move grid cell Tool complete', agentUpdates);

    return { status: 1, context: {} };
  }
}