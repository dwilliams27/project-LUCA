import { Position, ResourceQuality, ResourceType } from '@/generated/process';
import { Particle, VGridCell } from '@/types';
import { GRID_PADDING, INIT_CANVAS_HEIGHT, INIT_CANVAS_WIDTH, GRID_SIZE } from '@/utils/constants';
import { create } from 'zustand';

export interface GameDimensions {
  width: number;
  height: number;
  gridLength: number;
}

export interface CellBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface GameState {
  dimensions: GameDimensions;
  grid: {
    cells: VGridCell[][];
    selected: VGridCell | null;
  };
  particles: {
    byId: Record<string, Particle>;
    byCellId: Record<string, Set<string>>;
  };
  
  resizeGame: (width: number, height: number) => void;
  
  getCellBounds: (pos: Position) => CellBounds;
  worldToGrid: (x: number, y: number) => Position;
  gridToWorld: (pos: Position) => { x: number; y: number };
}

export const useGameStore = create<GameState>((set, get) => ({
  dimensions: {
    width: INIT_CANVAS_WIDTH,
    height: INIT_CANVAS_HEIGHT,
    gridLength: Math.min(INIT_CANVAS_WIDTH, INIT_CANVAS_HEIGHT),
  },

  grid: {
    cells: Array(GRID_SIZE).fill(null).map((_, y) => 
      Array(GRID_SIZE).fill(null).map((_, x) => ({
        position: { x, y },
        resourceBuckets: {
          [ResourceType.ENERGY]: {
            resources: [
              {
                type: ResourceType.ENERGY,
                quantity: 10,
                quality: ResourceQuality.LOW
              },
              {
                type: ResourceType.ENERGY,
                quantity: 10,
                quality: ResourceQuality.MEDIUM
              },
              {
                type: ResourceType.ENERGY,
                quantity: 10,
                quality: ResourceQuality.HIGH
              }
            ]
          },
          [ResourceType.MATTER]: {
            resources: [
              {
                type: ResourceType.MATTER,
                quantity: 10,
                quality: ResourceQuality.LOW
              },
              {
                type: ResourceType.MATTER,
                quantity: 10,
                quality: ResourceQuality.MEDIUM
              },
              {
                type: ResourceType.MATTER,
                quantity: 80,
                quality: ResourceQuality.HIGH
              }
            ]
          },
          [ResourceType.INFORMATION]: {
            resources: [
              {
                type: ResourceType.INFORMATION,
                quantity: 10,
                quality: ResourceQuality.LOW
              },
              {
                type: ResourceType.INFORMATION,
                quantity: 10,
                quality: ResourceQuality.MEDIUM
              },
              {
                type: ResourceType.INFORMATION,
                quantity: 10,
                quality: ResourceQuality.HIGH
              }
            ]
          },
        },
        processes: [],
      }))
    ),
    selected: null,
  },

  particles: {
    byId: {},
    byCellId: {},
  },

  resizeGame: (width: number, height: number) => {
    set((state) => ({
      dimensions: {
        width,
        height,
        gridLength: Math.min(width, height),
      }
    }))
  },

  getCellBounds: (pos: Position): CellBounds => {
    const cellSize = get().dimensions.gridLength / get().grid.cells.length;
    return {
      left: pos.x * cellSize + GRID_PADDING / 2,
      right: (pos.x + 1) * cellSize - GRID_PADDING / 2,
      top: pos.y * cellSize + GRID_PADDING / 2,
      bottom: (pos.y + 1) * cellSize - GRID_PADDING / 2,
    };
  },

  worldToGrid: (x: number, y: number): Position => {
    const cellSize = get().dimensions.gridLength / get().grid.cells.length;
    return {
      x: Math.floor(x / cellSize),
      y: Math.floor(y / cellSize),
    };
  },

  gridToWorld: (pos: Position) => {
    const cellSize = get().dimensions.gridLength / get().grid.cells.length;
    return {
      x: pos.x * cellSize,
      y: pos.y * cellSize,
    };
  },
}));

export const useGrid = () => useGameStore(state => state.grid);
export const useGameParticles = () => useGameStore(state => state.particles);
