import { Agent } from "@/services/AgentService";
import type { ContextAdapter, PromptService } from "@/services/PromptService";
import { GameState } from "@/store/gameStore";
import { CONTEXT } from "@/utils/constants";

export const GoalsContextAdapter: ContextAdapter = {
  name: "GOALS_CONTEXT_ADAPTER",
  templateString: "GOALS",
  requiredContext: [
    CONTEXT.AGENT_OBJECT,
    CONTEXT.PROMPT_SERVICE
  ],
  getText: (gameState: GameState, context: Record<string, any>) => {
    const agent = context[CONTEXT.AGENT_OBJECT] as unknown as Agent;
    const promptService = context[CONTEXT.PROMPT_SERVICE] as unknown as PromptService;
    return `<goal>${agent.goals.filter((goal) => goal.basePrompt).map((goal) => promptService.constructPromptText(goal.basePrompt!, gameState, context)).join("</goal><goal>")}</goal>`;
  }
}
