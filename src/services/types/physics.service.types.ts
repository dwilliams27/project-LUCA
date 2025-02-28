import type { Resource, ResourceStack, ResourceType } from "@/services/types/item.service.types";

export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  NONE = "NONE",
  UP = "UP", 
  RIGHT = "RIGHT",
  DOWN = "DOWN",
  LEFT = "LEFT"
}

export interface Operation {
  type: string;
}

export interface TransferOperation extends Operation {
  type: "TRANSFER";
  resource: ResourceStack;
  direction: Direction;
  amount: number;
}

export interface TransformOperation extends Operation {
  type: "TRANSFORM";
  input: ResourceStack;
  output: ResourceStack;
  rate: number;
}

export interface GridCell {
  id: string;
  position: Position;
  resourceBuckets: {
    [key in ResourceType]: Resource[];
  };
  processes: BasicProcess[];
}

export enum ComparisonOperator {
  EQUAL = 1,
  GREATER_THAN = 2,
  LESS_THAN = 3
}

export interface Condition {
  operator: ComparisonOperator;
  value: number;
}

export interface BasicProcess {
  id: string;
  name: string;
  energyCost: number;
  conditions: Condition[];
  operations: Operation[];
}
