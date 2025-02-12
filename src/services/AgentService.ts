import { Goal, GoalService } from "@/services/GoalService";
import { PromptService } from "@/services/PromptService";
import { Capability } from "@/services/capabilities/CapabilityService";
import { LocatableGameService } from "@/services/ServiceLocator";
import { Position } from "@/types";
import { AGENT_ID, genId } from "@/utils/id";
import { dimensionStore } from "@/store/gameStore";

export type AgentType = "Orchestrator";

export interface Agent {
  id: string;
  type: AgentType;
  goals: Goal[];
  capabilities: Capability[];
  knownCells: number[][];
}

export class AgentService extends LocatableGameService {
  static name = "AGENT_SERVICE";
  private agents: Record<string, Agent> = {};

  private createKnownCellsGrid(position: Position, size: number): number[][] {
    const grid = Array(size).fill(0).map(() => Array(size).fill(0));
    grid[position.y][position.x] = 1;
    return grid;
  }

  createAgent(position: Position, goals: string[]) {
    const goalService = this.serviceLocator.getService(GoalService);
    const agent: Agent = {
      id: genId(AGENT_ID),
      type: "Orchestrator",
      goals: goals.map((goal) => goalService.getBaseGoal(goal)),
      capabilities: [], //TODO
      knownCells: this.createKnownCellsGrid(position, dimensionStore.getState().gridLength)
    }
    this.agents[agent.id] = agent;
    return agent;
  }

  makeDecision(agent: Agent) {
    const promptService = this.serviceLocator.getService(PromptService);
  }
}
