import { AiService } from "@/main/AiService";
import { IPC_CALLS, IpcLlmChatRequest } from "@/types";
import { ipcMain } from "electron";

export function defineIpcCalls(aiService: AiService | null) {
  ipcMain.handle(IPC_CALLS.LLM_CHAT, async (_event, serializedChatRequest: string) => {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }

    const request: IpcLlmChatRequest = JSON.parse(serializedChatRequest);
    try {
      const response = await aiService.generateText(request);
      return response;
    } catch (error) {
      console.error('Error in llm:chat handler:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CALLS.LLM_STATUS, (_event) => {
    return {
      initialized: !!aiService,
    };
  });
}
