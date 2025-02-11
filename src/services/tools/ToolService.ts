import { LocatableGameService } from "@/services/ServiceLocator";

export interface Tool {
  id: string;
  name: string;
  description: string;
  inputSchema: Object;
  implementation: Function;
}

export class ToolService extends LocatableGameService {
  static name = "TOOL_SERVICE";
  private toolMap: Record<string, Tool> = {};

  registerTool(tool: Tool) {
    if (this.toolMap[tool.id]) {
      console.warn(`Failed to register ${tool.name}; duplicate tool with id ${tool.id} already exists`);
      return;
    }
    this.toolMap[tool.id] = tool;
  }

  getTool(id: string) {
    return this.toolMap[id];
  }
}
