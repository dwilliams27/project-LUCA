import { LocatableGameService } from "@/services/ServiceLocator";
import { IPC_CALLS, IpcLlmChatRequest, IpcLlmChatResponse } from "@/types";

export class IpcService extends LocatableGameService {
  static name = "IPC_SERVICE";

  llmChat(request: IpcLlmChatRequest): Promise<IpcLlmChatResponse> {
    return window.electron.ipcRenderer.invoke(IPC_CALLS.LLM_CHAT, JSON.stringify(request));
  };
}
