import { agentStore } from "@/store/game-store";

import type { Agent } from "@/services/types/agent.service.types";
import _ from "lodash";

// Agents
export function applyAgentUpdates(updates: Record<string, Partial<Agent>>, logMessage = '') {
  const currentState = agentStore.getState();
  const updatedAgentMap = { ...currentState.agentMap };
  if (logMessage) console.warn(`-- STATE UPDATE -- (${logMessage})`);
  if (logMessage) console.log('Update payload', updates);

  Object.entries(updates).forEach(([agentId, update]) => {
    if (updatedAgentMap[agentId]) {
      if (logMessage) console.log('Pre update', updatedAgentMap[agentId]);
      _.merge(updatedAgentMap[agentId], update);
      if (logMessage) console.log('Post update', updatedAgentMap[agentId]);
    }
  });

  if (logMessage) console.warn('-------------------');
  agentStore.setState({
    agentMap: updatedAgentMap
  });
}
