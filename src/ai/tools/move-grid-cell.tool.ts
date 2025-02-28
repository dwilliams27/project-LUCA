import { GameServiceLocator } from "@/services/service-locator";
import { agentStore, dimensionStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";
import { getRelativeGridCell } from "@/utils/grid";
import { cloneWithMaxDepth } from "@/utils/helpers";
import { applyAgentUpdates } from "@/utils/state";

import type { LucaTool } from "@/services/types/tool.service.types";
import { Direction } from "@/services/types/physics.service.types";
import type { DeepPartial } from "@/types/utils";
import type { Agent } from "@/services/types/agent.service.types";

export const MOVE_GRID_CELL_TOOL = "MOVE_GRID_CELL_TOOL";
export const MoveGridCellTool: LucaTool = {
  name: MOVE_GRID_CELL_TOOL,
  tool: {
    description: "Move to an adjacent grid cell and get data about its contents",
    parameters: {
      type: "object",
      properties: {
        direction: {
          type: "string",
          enum: [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT],
          description: "The direction to move in"
        }
      },
      required: ["direction"]
    },
  },
  requiredContext: [CONTEXT.AGENT_ID],
  implementation: (params: { direction: Direction }, serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentState = agentStore.getState();
    const agentRef = agentState.agentMap[agentId];
    const agentUpdates: DeepPartial<Agent> = {
      mental: { readyToThink: true, knownCells: cloneWithMaxDepth(agentRef.mental.knownCells, 2) },
      physics: {},
    };
    const newCell = getRelativeGridCell(agentRef.physics.currentCell, params.direction);

    if (!newCell) {
      console.warn('No destination cell, exiting MoveGridCell tool early');
      applyAgentUpdates({ [agentId]: agentUpdates } as Record<string, Partial<Agent>>, MOVE_GRID_CELL_TOOL);
      return { status: 0, context: {} };
    }

    const cellSize = dimensionStore.getState().cellSize;
    // TODO fix this type nonsense
    agentUpdates.physics!.moving = true;
    agentUpdates.physics!.destinationCell = newCell;
    agentUpdates.physics!.destinationPos = { x: cellSize * newCell.x + 0.5 * cellSize, y: cellSize * newCell.y + 0.5 * cellSize };
    agentUpdates.mental!.knownCells![newCell.y]![newCell.x] = 1;

    applyAgentUpdates({ [agentId]: agentUpdates } as Record<string, Partial<Agent>>, MOVE_GRID_CELL_TOOL);

    console.log('Move grid cell Tool complete', agentUpdates);

    return { status: 1, context: {} };
  }
}