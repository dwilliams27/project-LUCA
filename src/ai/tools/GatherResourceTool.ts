import { GameServiceLocator } from "@/services/ServiceLocator";
import { LucaTool } from "@/services/ToolService";
import { agentStore, gridStore } from "@/store/gameStore";
import { ResourceQuality, ResourceStack } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { resourceAbrToType } from "@/utils/context";
import { cloneWithMaxDepth } from "@/utils/helpers";
import { applyAgentUpdates } from "@/utils/state";

export const GATHER_RESOURCE_TOOL = "GATHER_RESOURCE_TOOL";
export const GatherResourceTool: LucaTool = {
  name: GATHER_RESOURCE_TOOL,
  description: "Collect a stack of resources from the current cell",
  input_schema: {
    type: "object",
    properties: {
      resourceType: {
        type: "string",
        enum: [`E`, `M`, `I`],
        description: "The type of resource to gather"
      },
      resourceQuality: {
        type: "number",
        description: "The quality of resource to gather"
      },
      amount: {
        type: "number",
        description: "How much of the resource to gather"
      }
    },
    required: ["resource"]
  },
  requiredContext: [CONTEXT.AGENT_ID],
  implementation: (params: { resourceType: string, resourceQuality: number, amount: number }, serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentState = agentStore.getState();
    const gridState = gridStore.getState();
    const gridCellsUpdate = cloneWithMaxDepth(gridState.cells, 10);
    const agentRef = agentState.agentMap[agentId];

    const resourceType = resourceAbrToType(params.resourceType);
    if (!resourceType) {
      console.warn(`Cannot gather ${params.resourceType}; invalid resource type`);
      applyAgentUpdates({ [agentId]: { mental: { readyToThink: true } } } as any, true);
      return { status: 0, context: {} };
    }

    if (!(params.resourceQuality in ResourceQuality)) {
      console.warn(`Cannot gather ${params.resourceType}; invalid resource quality ${params.resourceQuality}`);
      applyAgentUpdates({ [agentId]: { mental: { readyToThink: true } } } as any, true);
      return { status: 0, context: {} };
    }

    const resourceStack: ResourceStack = {
      type: resourceType,
      quantity: params.amount,
      quality: params.resourceQuality
    };
    const quantityTaken = Math.min(gridCellsUpdate[agentRef.physics.currentCell.y][agentRef.physics.currentCell.x].resourceBuckets[resourceStack.type][resourceStack.quality].quantity, resourceStack.quantity);

    gridCellsUpdate[agentRef.physics.currentCell.y][agentRef.physics.currentCell.x].resourceBuckets[resourceStack.type][resourceStack.quality].quantity -= quantityTaken;

    gridStore.setState({
      ...gridState,
      cells: gridCellsUpdate
    });

    const agentUpdates = {
      inventory: cloneWithMaxDepth(agentRef.inventory, 5),
      mental: cloneWithMaxDepth(agentRef.mental, 3)
    };
    agentUpdates.inventory.resourceBuckets[resourceStack.type][resourceStack.quality].quantity += quantityTaken;
    agentUpdates.mental.readyToThink = true;

    applyAgentUpdates({ [agentId]: agentUpdates }, true);

    console.log('Gather resource Tool complete', agentUpdates);
    return { status: 1, context: {} };
  }
}
