interface IpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>;
}

interface ElectronAPI {
  ipcRenderer: IpcRenderer;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
