import { PromptService } from "@/services/prompt.service";
import { GameServiceLocator } from "@/services/service-locator";
import { agentStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";

import type { ContextAdapter } from "@/services/types/prompt.service.types";

export const GoalsContextAdapter: ContextAdapter = {
  name: "GOALS_CONTEXT_ADAPTER",
  templateString: "GOALS",
  requiredContext: [
    CONTEXT.AGENT_ID
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentRef = agentStore.getState().agentMap[agentId];
    const promptService = serviceLocator.getService(PromptService);
    return `<goal>${agentRef.goals.filter((goal) => goal.basePrompt).map((goal) => promptService.constructPromptText(goal.basePrompt!, context)).join("</goal><goal>")}</goal>`;
  }
}
