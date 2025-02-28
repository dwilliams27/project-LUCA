import { GameServiceLocator } from "@/services/service-locator";

import type { Tool } from "ai";

export interface ToolCallResult {
  status: number;
  context: Record<string, any>;
}

export interface LucaTool {
  name: string;
  tool: Tool;
  requiredContext: string[];
  implementation: (params: any, serviceLocator: GameServiceLocator, context: Record<string, any>) => ToolCallResult;
}
