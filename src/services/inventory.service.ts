import { LocatableGameService } from "@/services/service-locator";
import { AgentStatNames } from "@/services/types/agent.service.types";
import type { Agent, AgentStats } from "@/services/types/agent.service.types";
import type { LucaItem } from "@/services/types/inventory.service.types";
import { applyAgentUpdates } from "@/utils/state";

export class InventoryService extends LocatableGameService {
  static name = "INVENTORY_SERVICE";

  refreshAgentFromItems(agent: Agent, inventory?: Agent["inventory"]) {
    let statDelta: Partial<AgentStats> = {};
    const newInventory = inventory || agent.inventory;
    newInventory.items.flat(2).filter((item) => !!item).sort((a, b) => {
      return b.priorityCategory - a.priorityCategory;
    }).forEach((item: LucaItem) => {
      statDelta = this.mergeStatMods(statDelta, item.calculateModifiers());
    });

    const currentStats = this.mergeStatMods(agent.stats.currentStats, statDelta, true) as AgentStats;

    const update = {
      [agent.id]: {
        inventory: newInventory,
        stats: {
          inventoryDerivedStats: statDelta,
          currentStats,
        }
      }
    };
    applyAgentUpdates(update, "InventoryService");
  }

  mergeStatMods(a: Partial<AgentStats>, b: Partial<AgentStats>, overwrite = false) {
    const statKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const statMods: Partial<AgentStats> = {};
    statKeys.forEach((stat) => {
      switch (stat) {
        case (AgentStatNames.MAX_HEALTH):
        case (AgentStatNames.CUR_HEALTH):
        case (AgentStatNames.DAMAGE):
        case (AgentStatNames.DAMAGE_CHARGE_CURRENT):
        case (AgentStatNames.DAMAGE_CHARGE_MAX):
        case (AgentStatNames.DAMAGE_CHARGE_TICK):
        case (AgentStatNames.DEFENCE):
        case (AgentStatNames.SPEED): {
          if (overwrite) {
            statMods[stat] = (b[stat] ?? a[stat]);
          } else {
            statMods[stat] = (a[stat] ?? 0) + (b[stat] ?? 0);
          }
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
