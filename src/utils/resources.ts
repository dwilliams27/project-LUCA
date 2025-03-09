import { genId, RESOURCE_ID } from "@/utils/id";

import { ResourceQuality, type ResourceType } from "@/services/types/inventory.service.types";

export function generateEmptyResourceBucket(resourceType: ResourceType) {
  return [{
      id: genId(RESOURCE_ID),
      type: resourceType,
      quantity: 0,
      quality: ResourceQuality.LOW
    },
    {
      id: genId(RESOURCE_ID),
      type: resourceType,
      quantity: 0,
      quality: ResourceQuality.MEDIUM
    },
    {
      id: genId(RESOURCE_ID),
      type: resourceType,
      quantity: 0,
      quality: ResourceQuality.HIGH
    }
  ];
}
