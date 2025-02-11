import { Goal } from "@/services/ai/GoalService";
import { PromptService } from "@/services/ai/PromptService";
import { Capability } from "@/services/capabilities/CapabilityService";
import { LocatableGameService } from "@/services/ServiceLocator";

export type AgentType = "Orchestrator";

export interface Agent {
  id: string;
  type: AgentType;
  goals: Goal[];
  capabilities: Capability[];
}

export class AgentService extends LocatableGameService {
  static name = "AGENT_SERVICE";

  makeDecision(agent: Agent) {
    const promptService = this.serviceLocator.getService(PromptService);
  }
}
