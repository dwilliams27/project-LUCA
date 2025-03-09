import type { AgentStats, Capability } from "@/services/types/agent.service.types";

export enum ResourceType {
  ENERGY = 1,
  MATTER = 2,
  INFORMATION = 3
}

export enum ResourceQuality {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

export interface Resource {
  id: string;
  type: ResourceType;
  quantity: number;
  quality: ResourceQuality;
}

export interface ResourceStack {
  type: ResourceType;
  quantity: number;
  quality: ResourceQuality;
}

export interface Inventory {
  id: string;
  boundAgentId: string;
  items: LucaItem[][];
}

export enum ItemPriorityCategories {
  NONE = 0
}
export interface LucaItem {
  id: string;
  name: string;
  description: string;
  priorityCategory: number;
  capabilities: Capability[];
  // TODO: Item state subscriptions
  // inputStatPaths: string[];
  statModifiers: Partial<AgentStats>;
  calculateModifiers: () => Partial<AgentStats>;
}
