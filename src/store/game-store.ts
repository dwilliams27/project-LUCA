import { GameServiceLocator } from '@/services/service-locator';
import { GRID_SIZE, INIT_CANVAS_HEIGHT, INIT_CANVAS_WIDTH } from '@/utils/constants';
import { genGridCells } from '@/utils/test-data';
import { create } from 'zustand';

import type { GridCell, Position } from '@/services/types/physics.service.types';
import type { Agent } from '@/services/types/agent.service.types';
import { AVAILABLE_MODELS, LLM_PROVIDERS, type LLMProvider } from '@/types/ipc-shared';

export interface DimensionState {
  width: number;
  height: number;
  gridLength: number;
  cellSize: number;
}

// TODO: Cleanup, move methods to a service
export interface GridState {
  cells: GridCell[][];

  getCellBounds: (pos: Position) => CellBounds;
  worldToGrid: (x: number, y: number) => Position;
  gridToWorld: (pos: Position) => { x: number; y: number };
}

export interface ServiceState {
  gameServiceLocator: GameServiceLocator;
}

export interface AgentState {
  agentMap: Record<string, Agent>;
}

export interface CostMetricsState {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  lastUpdated: number;
}

export interface ParticleState {}

export interface CellBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface GameState {
  agents: AgentState;
  dimensions: DimensionState;
  grid: GridState;
  particles: ParticleState;
  services: ServiceState;
  costMetrics: CostMetricsState;

  resizeGame: (width: number, height: number) => void;
  updateCostMetrics: (metrics: Omit<CostMetricsState, 'lastUpdated'>) => void;
}

export const gameStore = create<GameState>((set, get) => ({
  agents: {
    agentMap: {},
  },
  dimensions: {
    width: INIT_CANVAS_WIDTH,
    height: INIT_CANVAS_HEIGHT,
    gridLength: Math.min(INIT_CANVAS_WIDTH, INIT_CANVAS_HEIGHT),
    cellSize: Math.min(INIT_CANVAS_WIDTH, INIT_CANVAS_HEIGHT) / GRID_SIZE
  },
  grid: {
    cells: genGridCells(),

    getCellBounds: (pos: Position): CellBounds => {
      const cellSize = get().dimensions.cellSize;
      return {
        left: pos.x * cellSize,
        right: (pos.x + 1) * cellSize,
        top: pos.y * cellSize,
        bottom: (pos.y + 1) * cellSize,
      };
    },
  
    worldToGrid: (x: number, y: number): Position => {
      const cellSize = get().dimensions.cellSize;
      return {
        x: Math.floor(x / cellSize),
        y: Math.floor(y / cellSize),
      };
    },
  
    gridToWorld: (pos: Position) => {
      const cellSize = get().dimensions.cellSize;
      return {
        x: pos.x * cellSize,
        y: pos.y * cellSize,
      };
    },
  },
  particles: {},
  services: {
    gameServiceLocator: new GameServiceLocator()
  },
  costMetrics: {
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    lastUpdated: Date.now()
  },

  resizeGame: (width: number, height: number) => {
    set(() => ({
      dimensions: {
        width,
        height,
        gridLength: Math.min(width, height),
        cellSize: Math.min(width, height) / GRID_SIZE
      }
    }));
  },
  
  updateCostMetrics: (metrics) => {
    set(() => ({
      costMetrics: {
        ...metrics,
        lastUpdated: Date.now()
      }
    }));
  },
}));

export const agentStore = {
  getState: () => gameStore.getState().agents,
  setState: (agentState: Partial<AgentState>) => 
    gameStore.setState(state => ({ 
      agents: { ...state.agents, ...agentState } 
    })),
};

export const dimensionStore = {
  getState: () => gameStore.getState().dimensions,
  setState: (dims: Partial<DimensionState>) => 
    gameStore.setState(state => ({ 
      dimensions: { ...state.dimensions, ...dims } 
    })),
};

export const gridStore = {
  getState: () => gameStore.getState().grid,
  setState: (gridState: Partial<GridState>) => 
    gameStore.setState(state => ({ 
      grid: { ...state.grid, ...gridState } 
    })),
};

export const particleStore = {
  getState: () => gameStore.getState().particles,
  setState: (particles: Partial<ParticleState>) => 
    gameStore.setState(state => ({ 
      particles: { ...state.particles, ...particles } 
    })),
};

export const costMetricsStore = {
  getState: () => gameStore.getState().costMetrics,
  setState: (metricsState: Partial<CostMetricsState>) => 
    gameStore.setState(state => ({ 
      costMetrics: { ...state.costMetrics, ...metricsState } 
    })),
};

export const useResizeGame = () => gameStore(state => state.resizeGame);

export const useGridStore = () => gameStore(state => state.grid);
export const useParticleStore = () => gameStore(state => state.particles);
export const useDimensionStore = () => gameStore(state => state.dimensions);
export const useServiceStore = () => gameStore(state => state.services);
export const useCostMetricsStore = () => gameStore(state => state.costMetrics);
export const useUpdateCostMetrics = () => gameStore(state => state.updateCostMetrics);

export const useGameStore = () => gameStore(state => state);