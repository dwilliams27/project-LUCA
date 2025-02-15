import { LLMService } from "@/main/LlmService";
import { IPC_CALLS, IpcLlmChatRequest } from "@/types";
import { ipcMain } from "electron";

export function defineIpcCalls(llmService: LLMService | null) {
  ipcMain.handle(IPC_CALLS.LLM_CHAT, async (_event, serializedChatRequest: string) => {
    if (!llmService) {
      throw new Error('LLM service not initialized');
    }

    const request: IpcLlmChatRequest = JSON.parse(serializedChatRequest);
    try {
      const response = await llmService.query(request.messages, request.tools);
      return { message: response };
    } catch (error) {
      console.error('Error in llm:chat handler:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CALLS.LLM_STATUS, (_event) => {
    return {
      initialized: !!llmService,
      hasApiKey: !!process.env.ANTHROPIC_API_KEY
    };
  });
}
