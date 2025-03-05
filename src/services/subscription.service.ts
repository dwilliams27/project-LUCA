import { LocatableGameService } from "@/services/service-locator";
import { useGameStore } from "@/store/game-store";
import { get } from "lodash-es";

export class SubscriptionService extends LocatableGameService {
  static name = "SUBSCRIPTION_SERVICE";

  // <agentId, <path, callback[]>>
  private subscriptions: Record<string, Record<string, Set<Function>>> = {};
  // <agentId, <path, unsub[]>>
  private zustandSubscriptions: Record<string, Record<string, Function>> = {};
  
  subscribe(agentId, paths, callback) {
    // Create a unique key for this combination of paths
    const pathKey = paths.sort().join('|');
    
    if (!this.subscriptions[agentId]) {
      this.subscriptions[agentId] = {};
      this.zustandSubscriptions[agentId] = {};
    }
    
    const entitySubs = this.subscriptions[agentId];
    if (!entitySubs[pathKey]) {
      entitySubs[pathKey] = new Set();
      // Create the zustand subscription for this combination
      this.setupZustandSubscription(agentId, paths, pathKey);
    }
    
    // Add this callback to the subscribers
    entitySubs[pathKey].add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = entitySubs[pathKey];
      callbacks.delete(callback);
      
      // If no more callbacks for this path combination, clean up
      if (callbacks.size === 0) {
        // Remove the zustand subscription
        const unsub = this.zustandSubscriptions[agentId][pathKey];
        if (unsub) unsub();
        
        delete entitySubs[pathKey];
        delete this.zustandSubscriptions[agentId][pathKey];
      }
    }
  }
  
  private setupZustandSubscription(agentId, paths, pathKey) {
    const unsub = useGameStore.subscribe(
      state => {
        const agent = state.agents[agentId];
        if (!agent) return Array(paths.length).fill(undefined);
        return paths.map(path => get(agent, path));
      },
      
      // When values change, notify all callbacks for this combination
      (newValues, prevValues) => {
        const callbacks = this.subscriptions[agentId][pathKey];
        if (callbacks) {
          callbacks.forEach(callback => {
            callback(newValues, prevValues, agentId);
          });
        }
      }
    );
    
    this.zustandSubscriptions[agentId][pathKey] = unsub;
  }
}
