import { ContextAdapter, PromptService } from "@/services/PromptService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { agentStore } from "@/store/gameStore";
import { CONTEXT } from "@/utils/constants";

export const GoalsContextAdapter: ContextAdapter = {
  name: "GOALS_CONTEXT_ADAPTER",
  templateString: "GOALS",
  requiredContext: [
    CONTEXT.AGENT_ID
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agent = agentStore.getState().agentMap[agentId];
    const promptService = serviceLocator.getService(PromptService);
    return `<goal>${agent.goals.filter((goal) => goal.basePrompt).map((goal) => promptService.constructPromptText(goal.basePrompt!, context)).join("</goal><goal>")}</goal>`;
  }
}
