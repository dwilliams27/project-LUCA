import type { ContextAdapter } from "@/services/PromptService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { agentStore } from "@/store/gameStore";
import { CONTEXT } from "@/utils/constants";

export const RecentThoughtsContextAdapter: ContextAdapter = {
  name: "RECENT_THOUGHTS_CONTEXT_ADAPTER",
  templateString: "RECENT_THOUGHTS",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agent = agentStore.getState().agentMap[agentId];
    return `<thought>${agent.recentThoughts.join("</thought><thought>")}</thought>`;
  }
}
