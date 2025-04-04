import { ParticleService } from "@/services/particle.service";
import { GameServiceLocator } from "@/services/service-locator";
import { agentStore, gridStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";
import { resourceAbrToType } from "@/utils/context";
import { cloneWithMaxDepth } from "@/utils/helpers";
import { applyAgentUpdates } from "@/utils/state";

import type { LucaTool } from "@/services/types/tool.service.types";
import { ResourceQuality, type ResourceStack } from "@/services/types/inventory.service.types";

export const GATHER_RESOURCE_TOOL = "GATHER_RESOURCE_TOOL";
export const GatherResourceTool: LucaTool = {
  name: GATHER_RESOURCE_TOOL,
  tool: {
    description: "Collect a stack of resources from the current cell",
    parameters: {
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
      required: ["resourceType", "resourceQuality", "amount"]
    },
  },
  requiredContext: [CONTEXT.AGENT_ID],
  implementation: (params: { resourceType: string, resourceQuality: number, amount: number }, serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentState = agentStore.getState();
    const gridState = gridStore.getState();
    const gridCellsUpdate = cloneWithMaxDepth(gridState.cells, 10);
    const agentRef = agentState.agentMap[agentId];
    const particleService = serviceLocator.getService(ParticleService);

    const resourceType = resourceAbrToType(params.resourceType);
    if (!resourceType) {
      console.warn(`Cannot gather ${params.resourceType}; invalid resource type`);
      applyAgentUpdates({ [agentId]: { mental: { acting: false } } } as any, GATHER_RESOURCE_TOOL);
      return { status: 0, context: {} };
    }

    if (!(params.resourceQuality in ResourceQuality)) {
      console.warn(`Cannot gather ${params.resourceType}; invalid resource quality ${params.resourceQuality}`);
      applyAgentUpdates({ [agentId]: { mental: { acting: false } } } as any, GATHER_RESOURCE_TOOL);
      return { status: 0, context: {} };
    }

    const resourceStack: ResourceStack = {
      type: resourceType,
      quantity: params.amount,
      quality: params.resourceQuality
    };
    const currentAgentCell = gridCellsUpdate[agentRef.physics.currentCell.y][agentRef.physics.currentCell.x];
    const quantityTaken = Math.min(currentAgentCell.resourceBuckets[resourceStack.type][resourceStack.quality].quantity, resourceStack.quantity);

    particleService.getParticlesByIds(particleService.getParticleIdListForResource(currentAgentCell.id, { ...resourceStack, quantity: quantityTaken })).forEach((particle) => {
      particle.directedMovement = {
        dynamicTarget: () => {
          return agentStore.getState().agentMap[agentId].physics.position;
        },
        destroyOnFinish: true
      }
    });

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
    agentUpdates.mental.acting = false;

    applyAgentUpdates({ [agentId]: agentUpdates }, GATHER_RESOURCE_TOOL);

    console.log('Gather resource Tool complete', agentUpdates);
    return { status: 1, context: {} };
  }
}
