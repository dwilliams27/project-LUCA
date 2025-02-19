import { Agent } from "@/services/AgentService";
import { agentStore } from "@/store/gameStore";

// Agents
export function applyAgentUpdates(updates: Record<string, Partial<Agent>>, logMessage = '') {
  const currentState = agentStore.getState();
  const updatedAgentMap = { ...currentState.agentMap };
  if (logMessage) console.warn(`-- STATE UPDATE -- (${logMessage})`);
  if (logMessage) console.log('Update payload', updates);

  Object.entries(updates).forEach(([agentId, update]) => {
    if (updatedAgentMap[agentId]) {
      if (logMessage) console.log('Pre update', updatedAgentMap[agentId]);
      Object.keys(update).forEach(key => {
        updatedAgentMap[agentId] = {
          ...updatedAgentMap[agentId],
          [key]: {
            ...updatedAgentMap[agentId][key],
            ...update[key],
          }
        };
      });
      if (logMessage) console.log('Post update', updatedAgentMap[agentId]);
    }
  });

  if (logMessage) console.warn('-------------------');
  agentStore.setState({
    agentMap: updatedAgentMap
  });
}
