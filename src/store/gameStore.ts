import { Position, ResourceQuality, ResourceType } from '@/generated/process';
import { INIT_CANVAS_HEIGHT, INIT_CANVAS_WIDTH, INIT_CELL_SIZE, Particle, VGridCell } from '@/types';
import { create } from 'zustand';

export interface GameDimensions {
  width: number;
  height: number;
  cellSize: number;
  gridColumns: number;
  gridRows: number;
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
    byId: Map<string, Particle>;
    byCellId: Map<string, Set<string>>;
  };
  
  resizeGame: (width: number, height: number) => void;
  setCellSize: (size: number) => void;
  
  getCellBounds: (pos: Position) => CellBounds;
  worldToGrid: (x: number, y: number) => Position;
  gridToWorld: (pos: Position) => { x: number; y: number };
}

export const useGameStore = create<GameState>((set, get) => ({
  dimensions: {
    width: INIT_CANVAS_WIDTH,
    height: INIT_CANVAS_HEIGHT,
    cellSize: INIT_CELL_SIZE,
    gridColumns: Math.floor(INIT_CANVAS_WIDTH / INIT_CELL_SIZE),
    gridRows: Math.floor(INIT_CANVAS_HEIGHT / INIT_CELL_SIZE),
  },
  grid: {
    cells: Array(Math.floor(INIT_CANVAS_WIDTH / INIT_CELL_SIZE)).fill(null).map((_, y) => 
      Array(Math.floor(INIT_CANVAS_HEIGHT / INIT_CELL_SIZE)).fill(null).map((_, x) => ({
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
    byId: new Map(),
    byCellId: new Map(),
  },

  resizeGame: (width: number, height: number) => 
    set((state) => {
      const cellSize = state.dimensions.cellSize;
      return {
        dimensions: {
          width,
          height,
          cellSize,
          gridColumns: Math.floor(width / cellSize),
          gridRows: Math.floor(height / cellSize),
        }
      };
    }
  ),

  setCellSize: (cellSize: number) =>
    set((state) => ({
      dimensions: {
        ...state.dimensions,
        cellSize,
        gridColumns: Math.floor(state.dimensions.width / cellSize),
        gridRows: Math.floor(state.dimensions.height / cellSize),
      }
    })
  ),

  getCellBounds: (pos: Position): CellBounds => {
    const { cellSize } = get().dimensions;
    return {
      left: pos.x * cellSize,
      right: (pos.x + 1) * cellSize,
      top: pos.y * cellSize,
      bottom: (pos.y + 1) * cellSize,
    };
  },

  worldToGrid: (x: number, y: number): Position => {
    const { cellSize } = get().dimensions;
    return {
      x: Math.floor(x / cellSize),
      y: Math.floor(y / cellSize),
    };
  },

  gridToWorld: (pos: Position) => {
    const { cellSize } = get().dimensions;
    return {
      x: pos.x * cellSize,
      y: pos.y * cellSize,
    };
  },
}));

export const useGrid = () => useGameStore(state => state.grid);
export const useGameParticles = () => useGameStore(state => state.particles);
