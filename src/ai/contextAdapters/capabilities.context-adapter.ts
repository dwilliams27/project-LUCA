import { GameServiceLocator } from "@/services/service-locator";
import { agentStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";

import type { ContextAdapter } from "@/services/types/prompt.service.types";

export const CapabilitiesContextAdapter: ContextAdapter = {
  name: "CAPABILITIES_CONTEXT_ADAPTER",
  templateString: "CAPABILITIES",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentRef = agentStore.getState().agentMap[agentId];
    return `<capability>${agentRef.capabilities.map((capability) => capability.description).join("</capability><capability>")}</capability>`;
  }
}
