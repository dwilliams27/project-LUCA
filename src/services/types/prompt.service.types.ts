import type { GameServiceLocator } from "@/services/service-locator";

import type { LucaTool } from "@/services/types/tool.service.types";

export interface Prompt {
  name: string;
  text: string;
  contextAdapters: ContextAdapter[];
  tools: LucaTool[];
  version: string;
}

export interface ContextAdapter {
  name: string;
  templateString: string;
  requiredContext: string[];
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => string;
}
