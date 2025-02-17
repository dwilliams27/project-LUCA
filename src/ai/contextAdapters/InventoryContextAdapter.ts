import type { ContextAdapter } from "@/services/PromptService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { agentStore } from "@/store/gameStore";
import { CONTEXT } from "@/utils/constants";
import { resourceToStr } from "@/utils/context";

export const InventoryContextAdapter: ContextAdapter = {
  name: "INVENTORY_CONTEXT_ADAPTER",
  templateString: "INVENTORY",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentRef = agentStore.getState().agentMap[agentId];
    const resources = Object.values(agentRef.inventory.resourceBuckets).map((bucket) => {
      return bucket.map((resource) => resourceToStr(resource))
    }).flat().filter((item) => item).join(',');
    return `${resources}`;
  }
}
