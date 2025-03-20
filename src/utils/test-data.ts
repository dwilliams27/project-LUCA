import { GRID_SIZE } from "@/utils/constants";
import { genId, GRID_CELL_ID, ITEM_ID, PROCESS_ID, RESOURCE_ID } from "@/utils/id";

import { Direction, type BasicProcess, type GridCell } from "@/services/types/physics.service.types";
import { ItemPriorityCategories, ResourceQuality, ResourceType, type LucaItem } from "@/services/types/inventory.service.types";
import { AgentStatNames } from "@/services/types/agent.service.types";
import { GLOBAL_IMAGES } from "@/services/image.service";

function generateProcesses(x: number, y: number): BasicProcess[] {
  return y === 0 ? [
    {
      id: genId(PROCESS_ID),
      name: "Testing",
      energyCost: 0,
      conditions: [],
      operations: [
        {
          type: "TRANSFER",
          // @ts-ignore
          direction: Direction.RIGHT,
          amount: 1,
          resource: {
            type: ResourceType.MATTER,
            quantity: 1,
            quality: ResourceQuality.LOW,
          }
        },
      ]
    }
  ] : [];
}

export function genGridCells(): GridCell[][] {
  return Array(GRID_SIZE).fill(null).map((_, y) => 
    Array(GRID_SIZE).fill(null).map((_, x) => ({
      id: genId(GRID_CELL_ID),
      position: { x, y },
      resourceBuckets: {
        [ResourceType.ENERGY]: [
          {
            id: genId(RESOURCE_ID),
            type: ResourceType.ENERGY,
            quantity: Math.round(Math.random() * 10),
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
        ],
        [ResourceType.MATTER]: [
          {
            id: genId(RESOURCE_ID),
            type: ResourceType.MATTER,
            quantity: 0,
            quality: ResourceQuality.LOW
          },
          {
            id: genId(RESOURCE_ID),
            type: ResourceType.MATTER,
            quantity: Math.round(Math.random() * 10),
            quality: ResourceQuality.MEDIUM
          },
          {
            id: genId(RESOURCE_ID),
            type: ResourceType.MATTER,
            quantity: 0,
            quality: ResourceQuality.HIGH
          }
        ],
        [ResourceType.INFORMATION]: [
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
            quantity: 1,
            quality: ResourceQuality.HIGH
          }
        ]
      },
      processes: generateProcesses(x, y),
    }))
  );
}

export function generateTestingInventory(): LucaItem[] {
  const BasicWeapon: LucaItem = {
    id: genId(ITEM_ID),
    name: 'Basic Weapon',
    description: 'Does a bit of damage',
    capabilities: [],
    calculateModifiers: () => ({
      [AgentStatNames.DAMAGE]: 5,
      [AgentStatNames.DAMAGE_CHARGE_TICK]: 0.01,
      [AgentStatNames.DAMAGE_CHARGE_MAX]: 1
    }),
    priorityCategory: ItemPriorityCategories.NONE,
    ui: {
      displayText: "BasicWeapon",
      displayImageName: GLOBAL_IMAGES.BASIC_WEAPON
    }
  };
  
  const BasicArmor: LucaItem = {
    id: genId(ITEM_ID),
    name: 'Basic Armor',
    description: 'Defends a bit',
    capabilities: [],
    calculateModifiers: () => ({
      [AgentStatNames.DEFENSE]: 2.5
    }),
    priorityCategory: ItemPriorityCategories.NONE,
    ui: {
      displayText: "BasicArmor",
      displayImageName: GLOBAL_IMAGES.BASIC_ARMOR
    }
  };

  return [
    BasicWeapon,
    BasicArmor
  ];
}
