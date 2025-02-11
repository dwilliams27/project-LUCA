import { LocatableGameService } from "@/services/ServiceLocator";
import { Tool } from "@/services/tools/ToolService";
import { GameState } from "@/store/gameStore";

export interface Capability {
  id: string;
  tool: Tool;
}

export class CapabilityService extends LocatableGameService {
  static name = "CAPABILITY_SERVICE";
  private capabilityMap: Record<string, Capability> = {};

  registerCapability(capability: Capability) {
    if (this.capabilityMap[capability.id]) {
      console.warn(`Failed to register capability; duplicate capability with id ${capability.id} already exists`);
      return;
    }
    this.capabilityMap[capability.id] = capability;
  }

  getCapability(id: string) {
    return this.capabilityMap[id];
  }
}
