import { Position } from '@/generated/process';
import { GameServiceLocator } from '@/systems/ServiceLocator';
import { VGridCell } from '@/types';
import { GRID_SIZE, INIT_CANVAS_HEIGHT, INIT_CANVAS_WIDTH } from '@/utils/constants';
import { genGridCells } from '@/utils/testData';
import { create } from 'zustand';

export interface DimensionState {
  width: number;
  height: number;
  gridLength: number;
  cellSize: number;
}

export interface GridState {
  cells: VGridCell[][];

  getCellBounds: (pos: Position) => CellBounds;
  worldToGrid: (x: number, y: number) => Position;
  gridToWorld: (pos: Position) => { x: number; y: number };
}

export interface ServiceState {
  gameServiceLocator: GameServiceLocator;
}

export interface ParticleState {}

export interface CellBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface GameState {
  dimensions: DimensionState;
  grid: GridState;
  particles: ParticleState;
  services: ServiceState;

  resizeGame: (width: number, height: number) => void;
}

const gameStore = create<GameState>((set, get) => ({
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
}));

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

export const useResizeGame = () => gameStore(state => state.resizeGame);

export const useGridStore = () => gameStore(state => state.grid);
export const useParticleStore = () => gameStore(state => state.particles);
export const useDimensionStore = () => gameStore(state => state.dimensions);
export const useServiceStore = () => gameStore(state => state.services);
