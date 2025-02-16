import { GameServiceLocator } from "@/services/ServiceLocator";
import { LucaTool } from "@/services/ToolService";
import { agentStore, gridStore } from "@/store/gameStore";
import { ResourceQuality, ResourceStack } from "@/types";
import { CONTEXT } from "@/utils/constants";
import { resourceAbrToType } from "@/utils/context";
import { cloneDeep } from "lodash-es";

export const GATHER_RESOURCE_TOOL = "GATHER_RESOURCE_TOOL";
export const GatherResourceTool: LucaTool = {
  name: GATHER_RESOURCE_TOOL,
  description: "Collect a stack of resources from the current cell (immediate)",
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
    console.log('Gather params:', params);
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentState = agentStore.getState();
    const gridState = gridStore.getState();
    const gridCells = cloneDeep(gridState.cells);
    const agent = cloneDeep(agentState.agentMap[agentId]);

    const resourceType = resourceAbrToType(params.resourceType);
    if (!resourceType) {
      console.warn(`Cannot gather ${params.resourceType}; invalid resource type`);
      return { status: 0, context: {} };
    }

    if (!(params.resourceQuality in ResourceQuality)) {
      console.warn(`Cannot gather ${params.resourceType}; invalid resource quality ${params.resourceQuality}`);
      return { status: 0, context: {} };
    }

    const resourceStack: ResourceStack = {
      type: resourceType,
      quantity: params.amount,
      quality: params.resourceQuality
    };
    const quantityTaken = Math.max(gridCells[agent.currentCell.y][agent.currentCell.x].resourceBuckets[resourceStack.type][resourceStack.quality].quantity - resourceStack.quantity, 0);

    gridCells[agent.currentCell.y][agent.currentCell.x].resourceBuckets[resourceStack.type][resourceStack.quality].quantity -= quantityTaken;
    console.log("agetn rec buckets", agent.resourceBuckets);
    agent.resourceBuckets[resourceStack.type][resourceStack.quality].quantity += quantityTaken;

    gridStore.setState({
      ...gridState,
      cells: gridCells
    });
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
