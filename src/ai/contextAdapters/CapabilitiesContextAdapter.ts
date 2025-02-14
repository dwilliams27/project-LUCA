import { Agent } from "@/services/AgentService";
import type { ContextAdapter } from "@/services/PromptService";
import { GameState } from "@/store/gameStore";
import { CONTEXT } from "@/utils/constants";

export const CapabilitiesContextAdapter: ContextAdapter = {
  name: "CAPABILITIES_CONTEXT_ADAPTER",
  templateString: "CAPABILITIES",
  requiredContext: [
    CONTEXT.AGENT_OBJECT,
  ],
  getText: (gameState: GameState, context: Record<string, any>) => {
    const agent = context[CONTEXT.AGENT_OBJECT] as unknown as Agent;
    return `<capability>${agent.capabilities.map((capability) => capability.description).join("</capability><capability>")}</capability>`;
  }
}
