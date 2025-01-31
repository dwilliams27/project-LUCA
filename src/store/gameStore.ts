import { Position, ResourceType } from '@/generated/process';
import { ParticleSystem } from '@/systems/Particles/ParticleSystem';
import { Particle, VGridCell } from '@/types';
import { GRID_SIZE, INIT_CANVAS_HEIGHT, INIT_CANVAS_WIDTH, MAX_RESOURCES } from '@/utils/constants';
import { genId, PARTICLE_ID, posToStr } from '@/utils/id';
import { create } from 'zustand';

export interface GameDimensions {
  width: number;
  height: number;
  gridLength: number;
  cellSize: number;
}

export interface CellBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface ParticleState {
  byId: Record<string, Particle>;
  byType: Record<string, Particle[]>;
  byPosition: Record<string, Particle[]>;
  system: ParticleSystem | null;
  setup: boolean;
}

interface GameState {
  dimensions: GameDimensions;
  grid: {
    cells: VGridCell[][];
    selected: VGridCell | null;
  };
  particles: ParticleState;

  registerParticleSystem: (particleSystem: ParticleSystem) => void;

  resizeGame: (width: number, height: number) => void;

  initGrid: (gridCells: VGridCell[][]) => void;
  populateParticlesFromGrid: () => void;
  setParticlesById: (byId: Record<string, Particle>) => void;
  refreshGridMap: (particle: Particle) => void;
  getCellBounds: (pos: Position) => CellBounds;
  worldToGrid: (x: number, y: number) => Position;
  gridToWorld: (pos: Position) => { x: number; y: number };
}

export const useGameStore = create<GameState>((set, get) => ({
  dimensions: {
    width: INIT_CANVAS_WIDTH,
    height: INIT_CANVAS_HEIGHT,
    gridLength: Math.min(INIT_CANVAS_WIDTH, INIT_CANVAS_HEIGHT),
    cellSize: Math.min(INIT_CANVAS_WIDTH, INIT_CANVAS_HEIGHT) / GRID_SIZE
  },
  grid: {
    cells: [],
    selected: null,
  },
  particles: {
    byId: {},
    byType: {},
    byPosition: {},
    system: null,
    setup: false,
  },

  registerParticleSystem: (particleSystem: ParticleSystem) => set({ particles: { ...get().particles, system: particleSystem } }),
  refreshGridMap: (particle: Particle) => {
    const byPosition = get().particles.byPosition;
    const sourceCellKey = posToStr(particle.sourceCell?.position!);
    const destCellKey = posToStr(particle.targetCell?.position!);
    byPosition[sourceCellKey] = byPosition[sourceCellKey].filter((p) => p.id === particle.id);
    byPosition[destCellKey].push(particle);
    set(() => ({
      particles: {
        ...get().particles,
        byPosition
      }
    }));
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

  initGrid: (gridCells: VGridCell[][]) => {
    set(() => ({ grid: { cells: gridCells, selected: null } }));
    get().populateParticlesFromGrid();
  },

  populateParticlesFromGrid: () => {
    if (get().particles.setup) {
      return;
    }
    const particleIdMap = get().particles.byId;
    const cellSize = get().dimensions.cellSize;
    get().grid.cells.flat().forEach((gridCell) => {
      [ResourceType.ENERGY, ResourceType.MATTER, ResourceType.INFORMATION].forEach((rType) => {
        gridCell.resourceBuckets[rType].resources.forEach((resource) => {
          for(let i = 0; i < resource.quantity; i++) {
            const pId = genId(PARTICLE_ID);
            particleIdMap[pId] = {
              id: pId,
              resource: resource,
              position: {
                x: gridCell.position.x * cellSize + (Math.random() * cellSize),
                y: gridCell.position.y * cellSize + (Math.random() * cellSize),
              },
              targetX: 0,
              targetY: 0,
              vx: 0,
              vy: 0,
              scale: 1,
              transitioning: false,
              sourceCell: gridCell,
            };
          }
        });
      });
    });
  
    get().setParticlesById(particleIdMap);
  },

  getCellBounds: (pos: Position): CellBounds => {
    const cellSize = get().dimensions.cellSize;
    return {
      left: pos.x * cellSize,
      right: (pos.x + 1) * cellSize,
      top: pos.y * cellSize,
      bottom: (pos.y + 1) * cellSize,
    };
  },

  setParticlesById(byId: Record<string, Particle>) {
    const byType = {
      [ResourceType.ENERGY]: [],
      [ResourceType.INFORMATION]: [],
      [ResourceType.MATTER]: [],
    }
    const byPosition = {};
    get().grid.cells.flat().forEach((cell) => {
      byPosition[posToStr(cell.position)] = [];
    });
    Object.keys(byId).forEach((key) => {
      byType[byId[key].resource.type].push(byId[key]);
    });
    Object.keys(byId).forEach((key) => {
      byPosition[posToStr(byId[key].sourceCell!.position)].push(byId[key]);
    });
    set(() => ({
      particles: {
        system: get().particles.system,
        byId,
        byType,
        byPosition,
        setup: true
      }
    }))
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
}));

export const useGridStore = () => useGameStore(state => state.grid);
export const useParticleStore = () => useGameStore(state => state.particles);
