import { LocatableGameService } from "@/services/service-locator";
import { AgentStatNames } from "@/services/types/agent.service.types";
import type { Agent, AgentStats } from "@/services/types/agent.service.types";
import type { LucaItem } from "@/services/types/inventory.service.types";

export class InventoryService extends LocatableGameService {
  static name = "INVENTORY_SERVICE";

  refreshAgentFromItems(agent: Agent) {
    let statDelta: Partial<AgentStats> = {};
    agent.inventory.items.flat().sort((a, b) => {
      return b.priorityCategory - a.priorityCategory;
    }).forEach((item: LucaItem) => {
      statDelta = this.mergeStatMods(statDelta, item.calculateModifiers());
    });

    agent.stats.baseStats = this.mergeStatMods(agent.stats.baseStats, statDelta) as AgentStats;
  }

  mergeStatMods(a: Partial<AgentStats>, b: Partial<AgentStats>) {
    const statKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const statMods: Partial<AgentStats> = {};
    statKeys.forEach((stat) => {
      switch (stat) {
        case (AgentStatNames.MAX_HEALTH):
        case (AgentStatNames.CUR_HEALTH):
        case (AgentStatNames.SPEED): {
          statMods[stat] = (a[stat] || 0) + (b[stat] || 0);
          break;
        }
      }
    });

    return statMods;
  }

  // bindItem(agentId: string, item: LucaItem) {
  //   item.boundAgentId = agentId;
  //   const subscriptionService = this.serviceLocator.getService(SubscriptionService);
  //   subscriptionService.subscribe(agentId, item.inputStatPaths, item.calculateModifiers);
  // }
}
