import { Sprite, Text as PixiText, Container, Graphics } from "pixi.js";

import { type LucaItem, type Resource, ResourceType } from "@/services/types/inventory.service.types";
import type { GameState } from "@/store/game-store";
import type { Position } from "@/services/types/physics.service.types";
import type { DeepPartial } from "@/types/utils";
import type { Prompt } from "@/services/types/prompt.service.types";
import type { LucaTool } from "@/services/types/tool.service.types";
import type { ModelConfig } from "@/types";

export type AgentType = "Orchestrator";
export type AgentPhysicsUpdate = DeepPartial<Agent["physics"]> & { position: Position };

export enum AgentStatNames {
  MAX_HEALTH = "MAX_HEALTH",
  CUR_HEALTH = "CUR_HEALTH",
  DAMAGE = "DAMAGE",
  DAMAGE_CHARGE_MAX = "DAMAGE_CHARGE_MAX",
  DAMAGE_CHARGE_CURRENT = "DAMAGE_CHARGE_CURRENT",
  DAMAGE_CHARGE_TICK = "DAMAGE_CHARGE_TICK",
  DEFENSE = "DEFENSE",
  SPEED = "SPEED"
}
export const StatToDisplayNameMap = {
  [AgentStatNames.MAX_HEALTH]: "Max Health",
  [AgentStatNames.CUR_HEALTH]: "Current Health",
  [AgentStatNames.DAMAGE]: "Damage",
  [AgentStatNames.DAMAGE_CHARGE_MAX]: "Attack Speed Max",
  [AgentStatNames.DAMAGE_CHARGE_CURRENT]: "Current Attack Charge",
  [AgentStatNames.DAMAGE_CHARGE_TICK]: "Attack Speed",
  [AgentStatNames.DEFENSE]: "Defense",
  [AgentStatNames.SPEED]: "Speed",
}
export interface AgentStats {
  [AgentStatNames.MAX_HEALTH]: number;
  [AgentStatNames.CUR_HEALTH]: number;
  [AgentStatNames.DAMAGE]: number;
  [AgentStatNames.DAMAGE_CHARGE_MAX]: number;
  [AgentStatNames.DAMAGE_CHARGE_CURRENT]: number;
  [AgentStatNames.DAMAGE_CHARGE_TICK]: number;
  [AgentStatNames.DEFENSE]: number;
  [AgentStatNames.SPEED]: number;
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

export interface DisplayBar {
  container: Container;
  background: Graphics;
  bar: Graphics;
  baseWidth: number;
  baseHeight: number;
  offset: Position;
}

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
    healthBar: DisplayBar;
    attackBar: DisplayBar;
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
    items: (LucaItem | null)[][];
  },
  stats: {
    inventoryDerivedStats: Partial<AgentStats>;
    baseStats: Partial<AgentStats>;
    currentStats: AgentStats;
  }
};
