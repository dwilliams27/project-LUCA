import type { EVProcess } from "@/systems/evoDSL/types";

export enum EntityType {
  PLAYER_ORGANISM = 'PLAYER_ORGANISM',
  ENEMY = 'ENEMY',
  RESOURCE_NODE = 'RESOURCE_NODE',
  OBSTACLE = 'OBSTACLE',
  EMPTY = 'EMPTY'
}

export interface Position {
  x: number;
  y: number;
}

export interface GridEntity {
  id: string;
  type: EntityType;
  position: Position;
  health: number;
  maxHealth: number;
  stage: EvolutionaryStage;
  effects: string[];
  resources?: Partial<Resources>;
  inventory?: CardData[];
}

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

export enum ResourceType {
  ENERGY = 'ENERGY',         // Basic resource for all stages
  MATTER = 'MATTER',         // Used for building structures
  SIGNALS = 'SIGNALS'        // For cell communication
}

export interface Resources {
  [ResourceType.ENERGY]: number;
  [ResourceType.MATTER]: number;
  [ResourceType.SIGNALS]: number;
}

export enum CardType {
  REACTION = 'REACTION',     // Chemical transformations
  MEMBRANE = 'MEMBRANE',     // Cell boundary modifications
  ORGANELLE = 'ORGANELLE',  // Cellular components
  PROTEIN = 'PROTEIN',      // Functional molecules
  TISSUE = 'TISSUE',        // Multicellular structures
  MOVEMENT = 'MOVEMENT',    // Spatial movement cards
  ATTACK = 'ATTACK',        // Combat cards
  DEFENSE = 'DEFENSE'       // Protection cards
}


export interface CardData {
  id: string;
  name: string;
  type: CardType;
  process: EVProcess[];
}

export interface GridState {
  width: number;
  height: number;
  entities: GridEntity[];
  ascensionLevel: number;
  nextRow: GridEntity[];
  turnOrder: string[];
}

export interface GameState {
  // Grid state
  grid: GridState;
  
  // Run state
  currentStage: EvolutionaryStage;
  turnNumber: number;
  resources: Resources;
  evolutionPoints: number;
  
  // Card states
  deck: CardData[];
  hand: CardData[];
  discard: CardData[];
  played: CardData[];
  
  // Progression tracking
  stageProgress: {
    [key in EvolutionaryStage]: number;
  };
  unlockedMechanics: Set<string>;
  
  // Current turn state
  actionsRemaining: number;
  movesRemaining: number;
  resourcesGainedThisTurn: Resources;
  cardsPlayedThisTurn: number;
  
  // Run statistics
  stats: {
    totalCardsPlayed: number;
    resourcesGenerated: Resources;
    evolutionsTriggered: number;
    heightClimbed: number;
    enemiesDefeated: number;
    specialMilestonesAchieved: string[];
  };
  
  // AI integration state
  aiEnabled: boolean;
  lastAiInteraction?: {
    type: string;
    timestamp: number;
    context: string;
  };
}

// Movement and action types
export type MovementAction = {
  entityId: string;
  from: Position;
  to: Position;
  type: 'MOVE' | 'PUSH' | 'PULL' | 'SWAP';
}

export type CombatAction = {
  sourceId: string;
  targetIds: string[];
  damage: number;
  effects?: string[];
}

export type GameAction = {
  type: 'MOVE' | 'ATTACK' | 'PLAY_CARD' | 'EVOLVE' | 'END_TURN';
  payload: MovementAction | CombatAction | CardData | any;
  metadata?: {
    timestamp: number;
    sourceCard?: string;
    targetCard?: string;
    resourcesInvolved?: Partial<Resources>;
    position?: Position;
  };
}
