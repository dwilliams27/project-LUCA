import { Sprite, Text as PixiText } from "pixi.js";

import { type Resource, ResourceType } from "@/services/types/item.service.types";
import type { GameState } from "@/store/game-store";
import type { Position } from "@/services/types/physics.service.types";
import type { DeepPartial } from "@/types/utils";
import type { Prompt } from "@/services/types/prompt.service.types";
import type { LucaTool } from "@/services/types/tool.service.types";
import type { ModelConfig } from "@/types";

export type AgentType = "Orchestrator";
export type AgentPhysicsUpdate = DeepPartial<Agent["physics"]> & { position: Position };

export interface AgentStats {
  health: number;
  speed: number;
};

export const ItemType = {
  
} as const;
export interface Item {
  id: string;
  requiredContext: string[];
  getStatChanges: (agent: Agent, context: Record<string, any>) => AgentStats;
}

export interface Goal {
  basePrompt: Prompt | null;
  basePriority: number;
  requiredContext: string[];
  getFocusRank: (gameState: GameState, context: Record<string, any>) => number;
};

export interface Capability {
  id: string;
  description: string;
  tools: LucaTool[];
};

export interface Thought {
  text: string;
  modelConfig: ModelConfig;
}

export const AGENT_MODEL = {
  MAIN_THOUGHT: "MAIN_THOUGHT"
} as const;
export type AgentModel = typeof AGENT_MODEL[keyof typeof AGENT_MODEL];

export interface Agent {
  id: string;
  type: AgentType;
  goals: Goal[];
  capabilities: Capability[];
  // Dont clone and update these, let PIXI handle
  pixi: {
    sprite: Sprite | null;
    mainText: PixiText;
    thoughtBubble: PixiText;
    thoughtEmoji: PixiText;
  },
  physics: {
    position: Position;
    vx: number;
    vy: number;
    moving: boolean;
    currentCell: Position;
    destinationCell: Position | null;
    destinationPos: Position | null;
  },
  mental: {
    activeModelConfigs: Record<AgentModel, ModelConfig>;
    thinking: boolean;
    readyToThink: boolean;
    recentThoughts: Thought[];
    knownCells: number[][];
  },
  inventory: {
    resourceBuckets: {
      [key in ResourceType]: Resource[];
    },
  },
  stats: {
    baseStats: AgentStats;
  }
};
