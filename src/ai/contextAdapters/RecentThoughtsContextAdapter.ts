import { Agent } from "@/services/AgentService";
import type { ContextAdapter } from "@/services/PromptService";
import { GameState } from "@/store/gameStore";
import { CONTEXT } from "@/utils/constants";

export const RecentThoughtsContextAdapter: ContextAdapter = {
  name: "RECENT_THOUGHTS_CONTEXT_ADAPTER",
  templateString: "RECENT_THOUGHTS",
  requiredContext: [
    CONTEXT.AGENT_OBJECT,
  ],
  getText: (gameState: GameState, context: Record<string, any>) => {
    const agent = context[CONTEXT.AGENT_OBJECT] as unknown as Agent;
    return `<thought>${agent.recentThoughts.join("</thought><thought>")}</thought>`;
  }
}
