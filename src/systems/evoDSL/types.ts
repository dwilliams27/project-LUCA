export type EVResourceKind = 'energy' | 'matter' | 'signal';
export type EVDirection = 'north' | 'south' | 'east' | 'west';

export interface EVResource {
  kind: EVResourceKind;
  quantity: number;
  properties?: Record<string, number>;
}

export type EVTransformOperation = { 
  type: 'transform';
  input: EVResource;
  output: EVResource;
  multiplier: number;
  rate: number;
}
export type EVTransferOperation = {
  type: 'transfer';
  resource: EVResource;
  direction: EVDirection;
  amount: number;
}
export type EVSenseOperation = {
  type: 'sense';
  direction: EVDirection;
  threshold: number;
  effect: EVSpatialOperation;
}

export type EVSpatialOperation = EVTransformOperation | EVTransferOperation | EVSenseOperation;

export interface EVProcess {
  name: string;
  conditions: EVCondition[];
  operations: EVSpatialOperation[];
  energyCost: number;
}

export interface EVCondition {
  type: 'threshold';
  check: {
    resource: EVResource;
    operator: '>' | '<' | '=';
    value: number;
  };
}

export interface EVPosition {
  x: number;
  y: number;
}

export interface GridCell {
  resources: Map<EVResourceKind, EVResource>;
  processes: EVProcess[];
  position: EVPosition;
}
