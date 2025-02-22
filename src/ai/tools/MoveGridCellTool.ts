import { Agent } from "@/services/AgentService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { LucaTool } from "@/services/ToolService";
import { agentStore, dimensionStore } from "@/store/gameStore";
import { DeepPartial, Direction } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { getRelativeGridCell } from "@/utils/grid";
import { cloneWithMaxDepth } from "@/utils/helpers";
import { applyAgentUpdates } from "@/utils/state";

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
          enum: [`${Direction.NORTH}`, `${Direction.EAST}`, `${Direction.SOUTH}`, `${Direction.WEST}`],
          description: "The direction to move: north, east, south, west"
        }
      },
      required: ["direction"]
    },
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
      applyAgentUpdates({ [agentId]: agentUpdates } as Record<string, Partial<Agent>>, MOVE_GRID_CELL_TOOL);
      return { status: 0, context: {} };
    }

    const cellSize = dimensionStore.getState().cellSize;
    const adjustedCellSizeX = cellSize - agentRef.pixi.mainText.width;
    const adjustedCellSizeY = cellSize - agentRef.pixi.mainText.height;
    // TODO fix this type nonsense
    agentUpdates.physics!.moving = true;
    agentUpdates.physics!.destinationCell = newCell;
    agentUpdates.physics!.destinationPos = { x: cellSize * newCell.x + agentRef.pixi.mainText.width / 2 + Math.random() * adjustedCellSizeX, y: cellSize * newCell.y + agentRef.pixi.mainText.height / 2 + Math.random() * adjustedCellSizeY };
    agentUpdates.mental!.knownCells![newCell.y]![newCell.x] = 1;

    applyAgentUpdates({ [agentId]: agentUpdates } as Record<string, Partial<Agent>>, MOVE_GRID_CELL_TOOL);

    console.log('Move grid cell Tool complete', agentUpdates);

    return { status: 1, context: {} };
  }
}