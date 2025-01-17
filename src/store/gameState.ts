import { CardType, EntityType, EvolutionaryStage, ResourceType, type GameState } from '@/types';
import { create } from 'zustand';

interface GameStore {
  gameState: GameState;
  updateGameState: (newState: Partial<GameState>) => void;
}

const initialGameState: GameState = {
  // Grid state
  grid: {
    width: 8,
    height: 6,
    entities: [
      // Starting organism
      {
        id: 'player-1',
        type: EntityType.PLAYER_ORGANISM,
        position: { x: 3, y: 5 },
        health: 100,
        maxHealth: 100,
        stage: EvolutionaryStage.ABIOTIC,
        effects: []
      },
      // Initial resource node
      {
        id: 'resource-1',
        type: EntityType.RESOURCE_NODE,
        position: { x: 4, y: 3 },
        health: 1,
        maxHealth: 1,
        stage: EvolutionaryStage.ABIOTIC,
        effects: [],
        resources: {
          [ResourceType.ENERGY]: 5,
          [ResourceType.MINERALS]: 3
        }
      }
    ],
    ascensionLevel: 0,
    nextRow: [], // Will be populated when game starts
    turnOrder: ['player-1'] // Player goes first
  },

  // Run state
  currentStage: EvolutionaryStage.ABIOTIC,
  turnNumber: 1,
  resources: {
    [ResourceType.ENERGY]: 10,
    [ResourceType.MINERALS]: 5,
    [ResourceType.NUTRIENTS]: 0,
    [ResourceType.PROTEINS]: 0,
    [ResourceType.SIGNALS]: 0
  },
  evolutionPoints: 0,

  // Card states - starting with basic chemical reaction cards
  deck: [
    {
      id: 'card-1',
      name: 'Basic Reaction',
      type: CardType.REACTION,
      cost: { [ResourceType.ENERGY]: 1 },
      effects: [{
        resourceChanges: { [ResourceType.MINERALS]: 2 }
      }],
      minStage: EvolutionaryStage.ABIOTIC,
      targetType: 'SELF',
      description: 'Convert energy into minerals.'
    },
    {
      id: 'card-2',
      name: 'Move',
      type: CardType.MOVEMENT,
      cost: { [ResourceType.ENERGY]: 1 },
      effects: [{
        movement: {
          pattern: [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }],
          range: 1
        }
      }],
      minStage: EvolutionaryStage.ABIOTIC,
      targetType: 'POSITION',
      description: 'Move to an adjacent cell.'
    },
    // Add more starter cards as needed
  ],
  hand: [], // Will be populated with initial draw
  discard: [],
  played: [],

  // Progression tracking
  stageProgress: {
    [EvolutionaryStage.ABIOTIC]: 0,
    [EvolutionaryStage.PROTOCELL]: 0,
    [EvolutionaryStage.BASIC_CELL]: 0,
    [EvolutionaryStage.COMPLEX_CELL]: 0,
    [EvolutionaryStage.MULTICELLULAR]: 0
  },
  unlockedMechanics: new Set(['movement', 'basic_reactions']),

  // Current turn state
  actionsRemaining: 3,
  movesRemaining: 1,
  resourcesGainedThisTurn: {
    [ResourceType.ENERGY]: 0,
    [ResourceType.MINERALS]: 0,
    [ResourceType.NUTRIENTS]: 0,
    [ResourceType.PROTEINS]: 0,
    [ResourceType.SIGNALS]: 0
  },
  cardsPlayedThisTurn: 0,

  // Run statistics
  stats: {
    totalCardsPlayed: 0,
    resourcesGenerated: {
      [ResourceType.ENERGY]: 0,
      [ResourceType.MINERALS]: 0,
      [ResourceType.NUTRIENTS]: 0,
      [ResourceType.PROTEINS]: 0,
      [ResourceType.SIGNALS]: 0
    },
    evolutionsTriggered: 0,
    heightClimbed: 0,
    enemiesDefeated: 0,
    specialMilestonesAchieved: []
  },

  // AI integration state
  aiEnabled: false,
  lastAiInteraction: undefined
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: initialGameState,
  cards: [],
  updateGameState: (newState) => 
    set((state) => ({ gameState: { ...state.gameState, ...newState } })),
}));
