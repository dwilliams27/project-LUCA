import { GridContextAdapter } from "@/ai/contextAdapters/GridContextAdapter";
import type { ContextAdapter } from "@/services/PromptService";
import { GameServiceLocator } from "@/services/ServiceLocator";
import { CONTEXT } from "@/utils/constants";

export const EnvironmentContextAdapter: ContextAdapter = {
  name: "ENVIRONMENT_CONTEXT_ADAPTER",
  templateString: "ENVIRONMENT",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    // TODO: Validate grabbing context? Check requiredContext against what I got
    // Basically dependency tree
    const gridContext = GridContextAdapter.getText(serviceLocator, context);
    return `${gridContext}`;
  }
}
