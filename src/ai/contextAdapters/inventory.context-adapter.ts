import { GameServiceLocator } from "@/services/service-locator";
import { agentStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";
import { resourceToStr } from "@/utils/context";

import type { ContextAdapter } from "@/services/types/prompt.service.types";

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

    const items = agentRef.inventory.items.flat(2).filter((item) => !!item).map((item) => {
      // TODO
    });

    return `<resources>${resources}</resources><items>${items}</items>`;
  }
}
