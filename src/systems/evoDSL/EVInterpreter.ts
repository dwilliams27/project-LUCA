/**
 * Assumptions:
 * - All GridCells resource maps have been pre-populated fully with all possible resources
 * - Really should enforce MAX_DEPTH BEFORE executing a process; otherwise stuff gonna get dropped
 */

import type { EVCondition, EVDirection, EVProcess, EVSpatialOperation, EVTransferOperation, EVTransformOperation, GridCell } from "@/systems/evoDSL/types";

export interface ExecutionContext {
  depth: number;
  maxDepth: number;
  seenPositions: Set<string>;
  executionChain: string[];
}

export class EVInterpreter {
  private readonly MAX_DEPTH = 15;

  private grid: GridCell[][];

  constructor(grid: GridCell[][]) {
    this.grid = grid;
  }

  executeStep() {
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[0].length; y++) {
        const cell = this.grid[x][y];
        for (const process of cell.processes) {
          this.executeProcess(process, cell);
        }
      }
    }
  }

  private executeProcess(process: EVProcess, cell: GridCell): boolean {
    const execContext = {
      depth: 0,
      maxDepth: this.MAX_DEPTH,
      seenPositions: new Set<string>(),
      executionChain: []
    };

    if (!this.meetsConditions(process.conditions, cell)) {
      return false;
    }

    for (const op of process.operations) {
      this.executeOperation(op, cell, execContext);
    }
    return true;
  }

  private executeOperation(operation: EVSpatialOperation, cell: GridCell, context: ExecutionContext) {
    context.executionChain.push(operation.type);
    if (context.depth > context.maxDepth) {
      console.warn('MAX DEPTH REACHED');
      return false;
    }

    switch (operation.type) {
      case 'transform':
        this.executeTransform(operation, cell);
        break;
      case 'transfer':
        this.executeTransfer(operation, cell);
        break;
      case 'sense':
        this.executeSense(operation, cell);
        break;
    }
  }

  private executeTransform(operation: EVTransformOperation, cell: GridCell) {
    const fromResource = cell.resources.get(operation.input.kind)!;
    const toResource = cell.resources.get(operation.output.kind)!;

    if (fromResource.quantity < operation.input.quantity) {
      return false;
    }

    // Clamp based on rate
    const clampedRate = Math.min(fromResource.quantity / operation.input.quantity, operation.rate);

    cell.resources.set(operation.input.kind, {
      ...fromResource,
      quantity: fromResource.quantity - (operation.input.quantity * clampedRate),
    });
    cell.resources.set(operation.output.kind, {
      ...toResource,
      quantity: toResource.quantity + (operation.output.quantity * operation.multiplier * clampedRate),
    });

    return true;
  }

  private executeTransfer(operation: EVTransferOperation, cell: GridCell) {
    const toCell = this.getRelativeGridCell(cell, operation.direction);
    if (!toCell) {
      return false;
    }
    
    const fromCellResource = cell.resources.get(operation.resource.kind)!;
    if (fromCellResource.quantity < operation.amount) {
      return false;
    }

    const toCellResource = toCell.resources.get(operation.resource.kind)!;
    cell.resources.set(operation.resource.kind, {
      ...fromCellResource,
      quantity: fromCellResource.quantity - operation.amount,
    });
    toCell.resources.set(operation.resource.kind, {
      ...toCellResource,
      quantity: toCellResource.quantity + operation.amount,
    });

    return true;
  }

  private meetsConditions(conditions: EVCondition[], cell: GridCell): boolean {
    for (const condition of conditions) {
      switch (condition.type) {
        case 'threshold': {
          if(!this.checkThreshold(condition, cell)) {
            return false;
          }
          break;
        }
        // TODO: Ratio
        // case 'ratio':
      }
    }
    return true;
  }

  private checkThreshold(condition: EVCondition, cell: GridCell): boolean {
    const resource = cell.resources.get(condition.check.resource.kind) || {
      kind: condition.check.resource.kind,
      quantity: 0,
    };
    switch (condition.check.operator) {
      case '>':
        return resource.quantity > condition.check.value;
      case '<':
        return resource.quantity < condition.check.value;
      case '=':
        return resource.quantity === condition.check.value;
    }
    return false;
  }

  private getRelativeGridCell(cell: GridCell, direction: EVDirection): GridCell | null {
    switch (direction) {
      case 'north': {
        if (cell.position.y > 0) {
          return this.grid[cell.position.x][cell.position.y - 1];
        }
        break;
      }
      case 'south': {
        if (this.grid[cell.position.x].length > cell.position.y + 1) {
          return this.grid[cell.position.x][cell.position.y + 1];
        }
        break;
      }
      case 'east': {
        if (this.grid.length > cell.position.x + 1) {
          return this.grid[cell.position.x + 1][cell.position.y];
        }
        break;
      }
      case 'west': {
        if (cell.position.x > 0) {
          return this.grid[cell.position.x - 1][cell.position.y];
        }
        break;
      }
    }
    return null;
  }
}
