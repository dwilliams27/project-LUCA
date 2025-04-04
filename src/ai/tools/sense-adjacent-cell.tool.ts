import { GameServiceLocator } from "@/services/service-locator";
import { agentStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";
import { getRelativeGridCell } from "@/utils/grid";
import { cloneWithMaxDepth } from "@/utils/helpers";
import { applyAgentUpdates } from "@/utils/state";

import type { LucaTool } from "@/services/types/tool.service.types";
import { Direction } from "@/services/types/physics.service.types";

export const SENSE_ADJACENT_CELL_TOOL = "SENSE_ADJACENT_CELL_TOOL";
export const SenseAdjacentCellTool: LucaTool = {
  name: SENSE_ADJACENT_CELL_TOOL,
  tool: {
    description: "Get data about the contents of an adjacent cell. Has no effect if you already know the contents of the cell.",
    parameters: {
      type: "object",
      properties: {
        direction: {
          type: "string",
          enum: [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT],
          description: "The direction to sense"
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
    const newCell = getRelativeGridCell(agentRef.physics.currentCell, params.direction);
    if (!newCell) {
      console.warn('No new cell found, exiting early for sense');
      applyAgentUpdates({ [agentId]: { mental: { acting: false } } } as any, SENSE_ADJACENT_CELL_TOOL);
      return { status: 0, context: {} };
    }

    const agentUpdates = {
      mental: cloneWithMaxDepth(agentRef.mental, 3)
    };
    agentUpdates.mental.knownCells[newCell.y][newCell.x] = 1;
    agentUpdates.mental.acting = false;

    applyAgentUpdates({ [agentId]: agentUpdates }, SENSE_ADJACENT_CELL_TOOL);

    console.log('Sense resource Tool complete', agentUpdates);

    return { status: 1, context: {} };
  }
}
