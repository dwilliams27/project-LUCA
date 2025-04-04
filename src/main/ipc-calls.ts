import { AiService } from "@/main/ai.service";
import { ipcMain } from "electron";

import { IPC_CALLS, IpcLlmChatRequest, ImageGenerationRequest } from "@/types";

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
  
  ipcMain.handle(IPC_CALLS.LLM_COST_METRICS, (_event) => {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }
    
    return aiService.getCostMetrics();
  });

  ipcMain.handle(IPC_CALLS.GENERATE_IMAGE, async (_event, serializedImageRequest: string) => {
    if (!aiService) {
      throw new Error('AI service not initialized');
    }

    const request: ImageGenerationRequest = JSON.parse(serializedImageRequest);
    try {
      const response = await aiService.generateImage(request);
      return response;
    } catch (error) {
      console.error('Error in generate-image handler:', error);
      throw error;
    }
  });
}
