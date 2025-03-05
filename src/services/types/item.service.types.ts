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

export interface LucaItem {
  id: string;
  name: string;
  description: string;
  boundAgentId: string;
  capabilities: Capability[];
  inputStatPaths: string[];
  statModifiers: Partial<AgentStats>;
  calculateModifiers: Function;
  dirty: boolean;
}
