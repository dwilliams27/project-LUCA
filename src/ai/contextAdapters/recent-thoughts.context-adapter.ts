import { GameServiceLocator } from "@/services/service-locator";
import { agentStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";

import type { ContextAdapter } from "@/services/types/prompt.service.types";

export const RecentThoughtsContextAdapter: ContextAdapter = {
  name: "RECENT_THOUGHTS_CONTEXT_ADAPTER",
  templateString: "RECENT_THOUGHTS",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentRef = agentStore.getState().agentMap[agentId];
    // return `<thought>${agentRef.mental.recentThoughts.map((thought) => thought.text).join("</thought><thought>")}</thought>`;
    // They getting confused :(
    return 'None';
  }
}
