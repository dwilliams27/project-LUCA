import { Direction, Process, ResourceQuality, ResourceType } from "@/generated/process";
import { VGridCell } from "@/types";
import { GRID_SIZE } from "@/utils/constants";
import { genId, GRID_CELL_ID, PROCESS_ID, RESOURCE_ID } from "@/utils/id";

function generateProcesses(x: number, y: number): Process[] {
  return y === 0 ? [
    {
      id: genId(PROCESS_ID),
      name: "Testing",
      energyCost: 0,
      conditions: [],
      operations: [
        {
          operationType: {
            oneofKind: "transfer",
            transfer: {
              direction: Direction.WEST,
              amount: 1,
              resource: {
                type: ResourceType.MATTER,
                quantity: 1,
                quality: ResourceQuality.LOW,
              }
            }
          },
          input: 0,
          energyCost: 0
        },
        {
          operationType: {
            oneofKind: "transfer",
            transfer: {
              direction: Direction.EAST,
              amount: 1,
              resource: {
                type: ResourceType.ENERGY,
                quantity: 1,
                quality: ResourceQuality.LOW,
              }
            }
          },
          input: 0,
          energyCost: 0
        },
      ]
    }
  ] : [];
}

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
              quantity: 1,
              quality: ResourceQuality.LOW
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.ENERGY,
              quantity: 0,
              quality: ResourceQuality.MEDIUM
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.ENERGY,
              quantity: 0,
              quality: ResourceQuality.HIGH
            }
          ]
        },
        [ResourceType.MATTER]: {
          resources: [
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.MATTER,
              quantity: 1,
              quality: ResourceQuality.LOW
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.MATTER,
              quantity: 0,
              quality: ResourceQuality.MEDIUM
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.MATTER,
              quantity: 0,
              quality: ResourceQuality.HIGH
            }
          ]
        },
        [ResourceType.INFORMATION]: {
          resources: [
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.INFORMATION,
              quantity: 0,
              quality: ResourceQuality.LOW
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.INFORMATION,
              quantity: 0,
              quality: ResourceQuality.MEDIUM
            },
            {
              id: genId(RESOURCE_ID),
              type: ResourceType.INFORMATION,
              quantity: 0,
              quality: ResourceQuality.HIGH
            }
          ]
        },
      },
      processes: generateProcesses(x, y),
    }))
  );
}