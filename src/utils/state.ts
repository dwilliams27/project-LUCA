import type { Agent } from "@/services/AgentService";
import { agentStore } from "@/store/gameStore";

// Agents
export function applyAgentUpdates(updates: Record<string, Partial<Agent>>) {
  const currentState = agentStore.getState();
  const updatedAgentMap = { ...currentState.agentMap };

  Object.entries(updates).forEach(([agentId, update]) => {
    if (updatedAgentMap[agentId]) {
      updatedAgentMap[agentId] = {
        ...updatedAgentMap[agentId],
        ...update
      };
    }
  });

  agentStore.setState({
    agentMap: updatedAgentMap
  });
}
