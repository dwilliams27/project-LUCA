import type { ContextAdapter } from "@/services/PromptService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { agentStore } from "@/store/gameStore";
import { CONTEXT } from "@/utils/constants";

export const CapabilitiesContextAdapter: ContextAdapter = {
  name: "CAPABILITIES_CONTEXT_ADAPTER",
  templateString: "CAPABILITIES",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agent = agentStore.getState().agentMap[agentId];
    return `<capability>${agent.capabilities.map((capability) => capability.description).join("</capability><capability>")}</capability>`;
  }
}
