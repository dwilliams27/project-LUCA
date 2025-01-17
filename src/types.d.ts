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

export enum ResourceType {
  ENERGY = 'ENERGY',         // Basic resource for all stages
  MINERALS = 'MINERALS',     // Used in chemical reactions
  NUTRIENTS = 'NUTRIENTS',   // More complex resources
  PROTEINS = 'PROTEINS',     // Building blocks
  SIGNALS = 'SIGNALS'        // For cell communication
}

export interface Resources {
  [ResourceType.ENERGY]: number;
  [ResourceType.MINERALS]: number;
  [ResourceType.NUTRIENTS]: number;
  [ResourceType.PROTEINS]: number;
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

export interface CardEffect {
  resourceChanges?: Partial<Resources>;
  drawCards?: number;
  gainEnergy?: number;
  evolveProgress?: number;
  movement?: {
    pattern: Position[];
    range: number;
  };
  damage?: {
    amount: number;
    pattern: Position[];
    range: number;
  };
  defense?: {
    amount: number;
    duration: number;
  };
  spawn?: {
    type: EntityType;
    count: number;
    pattern: Position[];
  };
  specialEffect?: string;
}

export interface CardData {
  id: string;
  name: string;
  type: CardType;
  cost: Partial<Resources>;
  effects: CardEffect[];
  minStage: EvolutionaryStage;
  targetType: 'SELF' | 'ENEMY' | 'POSITION' | 'ALL';
  range?: number;
  description: string;
  flavorText?: string;
  isEvolved?: boolean;
  evolutionOptions?: string[];
  aigeneratedContent?: {
    description?: string;
    flavorText?: string;
    evolutionContext?: string;
  };
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
