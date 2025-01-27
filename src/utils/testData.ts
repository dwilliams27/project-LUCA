import { ResourceQuality, ResourceType } from "@/generated/process";
import { VGridCell } from "@/types";
import { GRID_SIZE } from "@/utils/constants";
import { genId, GRID_CELL_ID, RESOURCE_ID } from "@/utils/id";

export function genGridCells(): VGridCell[][] {
  return Array(GRID_SIZE).fill(null).map((_, y) => 
    Array(GRID_SIZE).fill(null).map((_, x) => ({
      id: genId(GRID_CELL_ID),
      position: { x, y },
      resourceBuckets: {
        [ResourceType.ENERGY]: {
          resources: [
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.ENERGY,
              quantity: 50,
              quality: ResourceQuality.LOW
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.ENERGY,
              quantity: 10,
              quality: ResourceQuality.MEDIUM
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.ENERGY,
              quantity: 40,
              quality: ResourceQuality.HIGH
            }
          ]
        },
        [ResourceType.MATTER]: {
          resources: [
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.MATTER,
              quantity: 40,
              quality: ResourceQuality.LOW
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.MATTER,
              quantity: 10,
              quality: ResourceQuality.MEDIUM
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.MATTER,
              quantity: 70,
              quality: ResourceQuality.HIGH
            }
          ]
        },
        [ResourceType.INFORMATION]: {
          resources: [
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.INFORMATION,
              quantity: 10,
              quality: ResourceQuality.LOW
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.INFORMATION,
              quantity: 30,
              quality: ResourceQuality.MEDIUM
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.INFORMATION,
              quantity: 80,
              quality: ResourceQuality.HIGH
            }
          ]
        },
      },
      processes: [],
    }))
  );
}