import { LocatableGameService } from "@/services/service-locator";
import type { Agent } from "@/services/types/agent.service.types";
import { applyAgentUpdates } from "@/utils/state";

export class RoundService extends LocatableGameService {
  static name = "ROUND_SERVICE";
  private roundActive = false;
  private curRound = 0;

  isRoundActive() {
    return this.roundActive;
  }

  getCurrentRound() {
    return this.curRound;
  }

  advanceRound() {
    this.curRound += 1;
    this.roundActive = true;
  }

  finishRound() {
    this.roundActive = false;
  }

  allAgentsReadyForNextAction(agents: Agent[]) {
    return agents.every((agent) => !agent.mental.canAct && !agent.mental.acting);
  }

  advanceAgentsToNextAction(agentIds: string[]) {
    const updates: Record<string, Partial<Agent>> = agentIds.reduce((acc, id) => {
      acc[id] = {
        mental: {
          canAct: true
        }
      };
      return acc;
    }, {});
    applyAgentUpdates(updates);
  }
}
