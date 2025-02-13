import type { ContextAdapter } from "@/services/PromptService";
import { GameState } from "@/store/gameStore";
import { ResourceStack } from "@/types";
import { resourceToStr } from "@/utils/context";

export const ResourceStackContextAdapter: ContextAdapter = {
  name: "RESOURCE_STACK_CONTEXT_ADAPTER",
  requiredContext: [
    "RESOURCE_STACK",
  ],
  getText: (gameState: GameState, context: Record<string, any>) => {
    const resourceStack = context["RESOURCE_STACK"] as unknown as ResourceStack;
    return resourceToStr(resourceStack, true)!;
  }
}
