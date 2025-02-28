import type { Tool } from "ai";

export const IPC_CALLS = {
  LLM_CHAT: "LLM_CHAT",
  LLM_STATUS: "LLM_STATUS",
  LLM_COST_METRICS: "LLM_COST_METRICS"
}

export const LLM_PROVIDERS = {
  ANTHROPIC: "ANTHROPIC",
  OPENAI: "OPENAI",
  GOOGLE: "GOOGLE"
} as const;
export type LLMProvider = typeof LLM_PROVIDERS[keyof typeof LLM_PROVIDERS];

export const AVAILABLE_MODELS = {
  [LLM_PROVIDERS.ANTHROPIC]: ["claude-3-7-sonnet-20250219"],
  [LLM_PROVIDERS.GOOGLE]: ["gemini-2.0-flash"],
  [LLM_PROVIDERS.OPENAI]: ["gpt-4o"]
};

export interface ModelConfig {
  modelName: string;
  provider: LLMProvider;
}

export interface IpcLlmChatRequest {
  modelConfig: ModelConfig;
  system: string;
  prompt: string;
  tools: Record<string, Tool>;
}
export type IpcLlmChatResponse = {
  text: string;
  modelConfig: ModelConfig;
  toolCalls: {
    toolName: string,
    args: Record<string, any>,
  }[];
};

export interface CostMetric {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  tokenCostProfile: TokenCostProfile
};

export interface TokenCostProfile {
  inputToken: number,
  outputToken: number
};

export interface CostMetricsResponse {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  providerMetrics: Record<string, CostMetric>;
}
