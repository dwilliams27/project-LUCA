import { LocatableGameService } from "@/services/service-locator";
import { SubscriptionService } from "@/services/subscription.service";
import type { LucaItem } from "@/services/types/item.service.types";

export class ItemService extends LocatableGameService {
  static name = "ITEM_SERVICE";

  bindItem(agentId: string, item: LucaItem) {
    item.boundAgentId = agentId;
    const subscriptionService = this.serviceLocator.getService(SubscriptionService);
    subscriptionService.subscribe(agentId, item.inputStatPaths, item.calculateModifiers);
  }
}
