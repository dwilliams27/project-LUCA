import { Agent } from "@/services/AgentService";
import { agentStore } from "@/store/gameStore";

// Agents
export function applyAgentUpdates(updates: Record<string, Partial<Agent>>, log = false) {
  const currentState = agentStore.getState();
  const updatedAgentMap = { ...currentState.agentMap };
  if (log) console.warn('-- STATE UPDATE --');
  if (log) console.log('Update payload', updates);

  Object.entries(updates).forEach(([agentId, update]) => {
    if (updatedAgentMap[agentId]) {
      if (log) console.log('Pre update', updatedAgentMap[agentId]);
      Object.keys(update).forEach(key => {
        updatedAgentMap[agentId] = {
          ...updatedAgentMap[agentId],
          [key]: {
            ...updatedAgentMap[agentId][key],
            ...update[key],
          }
        };
      });
      if (log) console.log('Post update', updatedAgentMap[agentId]);
    }
  });

  if (log) console.warn('-------------------');
  agentStore.setState({
    agentMap: updatedAgentMap
  });
}
