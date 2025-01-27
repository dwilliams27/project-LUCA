import { Position, ResourceQuality, ResourceType } from '@/generated/process';
import { Particle, VGridCell } from '@/types';
import { GRID_PADDING, INIT_CANVAS_HEIGHT, INIT_CANVAS_WIDTH, GRID_SIZE } from '@/utils/constants';
import { genId, GRID_CELL_ID, RESOURCE_ID } from '@/utils/id';
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
    setup: boolean;
  };
  
  resizeGame: (width: number, height: number) => void;

  initGrid: (gridCells: VGridCell[][]) => void;
  populateParticlesFromGrid: () => void;
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
    cells: [],
    selected: null,
  },
  particles: {
    byId: {},
    setup: false,
  },

  resizeGame: (width: number, height: number) => {
    set(() => ({
      dimensions: {
        width,
        height,
        gridLength: Math.min(width, height),
      }
    }));
  },

  initGrid: (gridCells: VGridCell[][]) => {
    set(() => ({ grid: { cells: gridCells, selected: null } }));
    get().populateParticlesFromGrid();
  },

  populateParticlesFromGrid: () => {
    if (get().particles.setup) {
      return;
    }
    const particleMap = get().particles.byId;
    const cellBounds = get().getCellBounds(get().grid.cells[0][0].position);
    const cellWidth = cellBounds.right - cellBounds.left;
    const cellHeight = cellBounds.bottom - cellBounds.top;
    get().grid.cells.flat().forEach((gridCell) => {
      [ResourceType.ENERGY, ResourceType.MATTER, ResourceType.INFORMATION].forEach((rType) => {
        gridCell.resourceBuckets[rType].resources.forEach((resource) => {
          particleMap[resource.id] = {
            id: resource.id,
            resource: resource,
            x: gridCell.position.x + (Math.random() * cellWidth),
            y: gridCell.position.y + (Math.random() * cellHeight),
            targetX: 0,
            targetY: 0,
            vx: 0,
            vy: 0,
            transitioning: false,
            sourceCell: gridCell
          };
        });
      });
    });
  
    set(() => ({
      particles: {
        byId: particleMap,
        setup: true,
      }
    }));
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

export const useGridStore = () => useGameStore(state => state.grid);
export const useParticleStore = () => useGameStore(state => state.particles);
