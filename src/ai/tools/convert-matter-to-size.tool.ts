import { GameServiceLocator } from "@/services/service-locator";
import { agentStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";
import { cloneWithMaxDepth } from "@/utils/helpers";
import { applyAgentUpdates } from "@/utils/state";

import type { LucaTool } from "@/services/types/tool.service.types";
import { ResourceQuality, ResourceType } from "@/services/types/inventory.service.types";

export const CONVERT_MATTER_TO_SIZE_TOOL = "CONVERT_MATTER_TO_SIZE_TOOL";
export const ConvertMatterToSizeTool: LucaTool = {
  name: CONVERT_MATTER_TO_SIZE_TOOL,
  tool: {
    description: `Convert matter from your "<inventory><resources>...</resources></inventory>" into increasing your size`,
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "How much matter to convert (larger amounts result in greater size increase)"
        },
        quality: {
          type: "number",
          description: "The quality of matter to use (0=LOW, 1=MEDIUM, 2=HIGH)"
        }
      },
      required: ["amount", "quality"]
    },
  },
  requiredContext: [CONTEXT.AGENT_ID],
  implementation: (params: { amount: number, quality: number }, serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentState = agentStore.getState();
    const agentRef = agentState.agentMap[agentId];
    
    if (![ResourceQuality.LOW, ResourceQuality.MEDIUM, ResourceQuality.HIGH].includes(params.quality)) {
      console.warn(`Invalid resource quality: ${params.quality}`);
      applyAgentUpdates({ [agentId]: { mental: { acting: false } } } as any, CONVERT_MATTER_TO_SIZE_TOOL);
      return { status: 0, context: {} };
    }

    if (params.amount <= 0) {
      console.warn(`Cannot convert negative or zero amount of matter: ${params.amount}`);
      applyAgentUpdates({ [agentId]: { mental: { acting: false } } } as any, CONVERT_MATTER_TO_SIZE_TOOL);
      return { status: 0, context: {} };
    }

    const availableMatter = agentRef.inventory.resourceBuckets[ResourceType.MATTER][params.quality].quantity;
    if (availableMatter < params.amount) {
      console.warn(`Not enough matter of quality ${params.quality}. Available: ${availableMatter}, Requested: ${params.amount}`);
      applyAgentUpdates({ [agentId]: { mental: { acting: false } } } as any, CONVERT_MATTER_TO_SIZE_TOOL);
      return { status: 0, context: {} };
    }

    const qualityMultiplier = params.quality === ResourceQuality.HIGH ? 1.5 : 
                             params.quality === ResourceQuality.MEDIUM ? 1.0 : 0.5;
    const sizeIncrease = Math.min(0.25, (params.amount * qualityMultiplier) / 100);

    const currentScale = agentRef.pixi.mainText.scale.x;
    const newScale = currentScale + sizeIncrease;

    const agentUpdates = {
      inventory: cloneWithMaxDepth(agentRef.inventory, 5),
      mental: cloneWithMaxDepth(agentRef.mental, 3)
    };
    
    agentUpdates.inventory.resourceBuckets[ResourceType.MATTER][params.quality].quantity -= params.amount;
    agentUpdates.mental.acting = false;

    applyAgentUpdates({ [agentId]: agentUpdates } as any, CONVERT_MATTER_TO_SIZE_TOOL);

    agentRef.pixi.mainText.scale.set(newScale);
    
    console.log(`Convert matter to size complete. Used ${params.amount} matter, new scale: ${newScale}`);
    return { status: 1, context: {} };
  }
}