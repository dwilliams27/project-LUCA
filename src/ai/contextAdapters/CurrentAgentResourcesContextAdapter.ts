import type { ContextAdapter } from "@/services/PromptService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { agentStore } from "@/store/gameStore";
import { CONTEXT } from "@/utils/constants";
import { resourceToStr } from "@/utils/context";

export const CurrentCellAgentResourcesContextAdapter: ContextAdapter = {
  name: "CURRENT_CELL_AGENT_RESOURCES_CONTEXT_ADAPTER",
  templateString: "CELL_AGENT_RESOURCES",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agent = agentStore.getState().agentMap[agentId];
    const resources = Object.keys(agent.resourceBuckets).map((key) => {
      return agent.resourceBuckets[key].map((resource) => resourceToStr(resource))
    }).flat();
    return `${resources}`;
  }
}
