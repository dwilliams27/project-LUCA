import { LocatableGameService } from "@/services/service-locator";

import { 
  IPC_CALLS, 
  type CostMetricsResponse, 
  type IpcLlmChatRequest, 
  type IpcLlmChatResponse,
  type ImageGenerationRequest,
  type ImageGenerationResponse
} from "@/types/ipc-shared";

export class IpcService extends LocatableGameService {
  static name = "IPC_SERVICE";

  llmChat(request: IpcLlmChatRequest): Promise<IpcLlmChatResponse> {
    return window.electron.ipcRenderer.invoke(IPC_CALLS.LLM_CHAT, JSON.stringify(request));
  };
  
  getLlmCostMetrics(): Promise<CostMetricsResponse> {
    return window.electron.ipcRenderer.invoke(IPC_CALLS.LLM_COST_METRICS);
  }

  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return window.electron.ipcRenderer.invoke(IPC_CALLS.GENERATE_IMAGE, JSON.stringify(request));
  }
}
