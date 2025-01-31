import { GridCell, Operation_Sense, Operation_Transfer, Operation_Transform, Position, Resource } from "@/generated/process";

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

export interface Particle {
  id: string;
  resource: VResource;
  // Physical properties
  position: Position;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  scale: number;
  // For smooth transitions between cells
  transitioning: boolean;
  sourceCell?: VGridCell;
  targetCell?: VGridCell;
};


// Validated generated types
export type VGridCell = Required<GridCell>;
export type VResource = Required<Resource>;
export type VOperationTransform = Required<Operation_Transform>;
export type VOperationTransfer = Required<Operation_Transfer>;
export type VOperationSense = Required<Operation_Sense>;
