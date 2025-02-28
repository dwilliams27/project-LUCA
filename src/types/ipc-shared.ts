import type { Tool } from "ai";

export const IPC_CALLS = {
  LLM_CHAT: "LLM_CHAT",
  LLM_STATUS: "LLM_STATUS"
}
export const LLM_PROVIDERS = {
  ANTHROPIC: "ANTHROPIC",
  OPENAI: "OPENAI",
  GOOGLE: "GOOGLE"
} as const;
export type LLMProvider = typeof LLM_PROVIDERS[keyof typeof LLM_PROVIDERS];
export interface IpcLlmChatRequest {
  system: string,
  prompt: string,
  tools: Record<string, Tool>,
  provider?: LLMProvider
}
export type IpcLlmChatResponse = {
  text: string;
  toolCalls: {
    toolName: string,
    args: Record<string, any>,
  }[];
};
