import { GameServiceLocator } from "@/services/service-locator";
import { agentStore } from "@/store/game-store";
import { CONTEXT } from "@/utils/constants";

import type { ContextAdapter } from "@/services/types/prompt.service.types";
import { AgentStatNames, type Agent } from "@/services/types/agent.service.types";

const reportedStats = {
  [AgentStatNames.CUR_HEALTH]: (agentRef: Agent) => {
    const curHealth = agentRef.stats.currentStats[AgentStatNames.CUR_HEALTH];
    const maxHealth = agentRef.stats.currentStats[AgentStatNames.MAX_HEALTH];
    return `<health>Your health is at ${curHealth/maxHealth}% (${curHealth}/${maxHealth})</health>`;
  },
  [AgentStatNames.DAMAGE]: (agentRef: Agent) => {
    const damage = agentRef.stats.currentStats[AgentStatNames.DAMAGE];
    return `<attack>Your deal ${damage} damage</attack>`;
  },
  [AgentStatNames.DEFENSE]: (agentRef: Agent) => {
    const defense = agentRef.stats.currentStats[AgentStatNames.DEFENSE];
    return `<defense>Your have ${defense} armor</defense>`;
  },
}

export const AgentStatsContextAdapter: ContextAdapter = {
  name: "AGENT_STATS_CONTEXT_ADAPTER",
  templateString: "AGENT_STATS",
  requiredContext: [
    CONTEXT.AGENT_ID,
  ],
  getText: (serviceLocator: GameServiceLocator, context: Record<string, any>) => {
    const agentId = context[CONTEXT.AGENT_ID] as unknown as string;
    const agentRef = agentStore.getState().agentMap[agentId];

    const result = Object.keys(agentRef.stats.currentStats).map((statName) => {
      if (statName in reportedStats) {
        return `<stat>${reportedStats[statName](agentRef)}</stat>`;
      }
      return null;
    }).filter((info) => !!info).join('\n');

    return result;
  }
}
