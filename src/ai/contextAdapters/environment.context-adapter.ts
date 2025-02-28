import { GridContextAdapter } from "@/ai/contextAdapters/grid.context-adapter";
import { GameServiceLocator } from "@/services/service-locator";
import { CONTEXT } from "@/utils/constants";

import type { ContextAdapter } from "@/services/types/prompt.service.types";

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
