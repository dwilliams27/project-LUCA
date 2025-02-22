import { Tool } from "ai";

export enum EvolutionaryStage {
  ABIOTIC = 'ABIOTIC',
  PROTOCELL = 'PROTOCELL',
  BASIC_CELL = 'BASIC_CELL',
  COMPLEX_CELL = 'COMPLEX_CELL',
  MULTICELLULAR = 'MULTICELLULAR'
}

export const EvolutionaryStageDescriptions = {
  [EvolutionaryStage.ABIOTIC]: 'The primordial soup of the ancient world, where life has yet to emerge.',
  [EvolutionaryStage.PROTOCELL]: 'The first self-replicating molecules, precursors to the first cells.',
  [EvolutionaryStage.BASIC_CELL]: 'Simple, single-celled organisms that have evolved to survive in harsh environments.',
  [EvolutionaryStage.COMPLEX_CELL]: 'Advanced cells with specialized organelles, capable of complex functions.',
  [EvolutionaryStage.MULTICELLULAR]: 'Cells that have evolved to work together, forming complex tissues and structures.'
}

export interface Particle {
  id: string;
  resource: Resource;
  position: Position;
  target: Position;
  vx: number;
  vy: number;
  scale: number;
  transitioning: boolean;
  sourceCell?: GridCell;
  targetCell?: GridCell;
  width: number;
  height: number;
};

export interface Position {
  x: number;
  y: number;
}

export interface Operation {
  type: string;
}

export interface TransferOperation extends Operation {
  type: "TRANSFER";
  resource: ResourceStack;
  direction: Direction;
  amount: number;
}

export interface TransformOperation extends Operation {
  type: "TRANSFORM";
  input: ResourceStack;
  output: ResourceStack;
  rate: number;
}

export interface GridCell {
  id: string;
  position: Position;
  resourceBuckets: {
    [key in ResourceType]: Resource[];
  };
  processes: BasicProcess[];
}

export enum ComparisonOperator {
  EQUAL = 1,
  GREATER_THAN = 2,
  LESS_THAN = 3
}

export interface Condition {
  operator: ComparisonOperator;
  value: number;
}

export interface BasicProcess {
  id: string;
  name: string;
  energyCost: number;
  conditions: Condition[];
  operations: Operation[];
}

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

export enum Direction {
  NONE = 0,
  NORTH = 1,
  EAST = 2,
  SOUTH = 3,
  WEST = 4
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

// IPC stuff
export const IPC_CALLS = {
  LLM_CHAT: "LLM_CHAT",
  LLM_STATUS: "LLM_STATUS"
}
export const LLM_PROVIDERS = {
  ANTHROPIC: "ANTHROPIC",
  OPENAI: "OPENAI",
  GOOGLE: "GOOGLE"
} as const;
export type LLMProvider = typeof LLM_PROVIDERS[keyof typeof LLM_PROVIDERS];
export interface IpcLlmChatRequest {
  system: string,
  prompt: string,
  tools: Record<string, Tool>,
  provider?: LLMProvider
}
export type IpcLlmChatResponse = {
  text: string;
  toolCalls: {
    toolName: string,
    args: Record<string, any>,
  }[];
};

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;