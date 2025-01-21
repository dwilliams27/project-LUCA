import { ComparisonOperator, Direction, GridCell, Operation, Operation_Sense, Operation_Transfer, Operation_Transform, Position, Process, ResourceQuality, ResourceType } from "@/generated/process";

export interface ExecutionContext {
  depth: number;
  maxDepth: number;
  seenPositions: Set<string>;
  executionChain: string[];
}

interface ProcessReference {
  process: Process;
  position: Position;
}

export class ProcessHandler {
  private grid: Required<GridCell>[][];
  private sortedCells: Required<GridCell>[];

  constructor(grid: Required<GridCell>[][]) {
    this.grid = grid;
    this.sortedCells = grid.flat();
    this.sortCells();
  }

  executeStep() {
    for (const cell of this.sortedCells) {
      this.runProcessesInCell(cell);
    }
    this.sortCells();
  }

  runProcessesInCell(cell: Required<GridCell>): void {
    for (const process of cell.processes) {
      this.runProcess(process, cell);
    }
  }

  runProcess(process: Process, gridCell: Required<GridCell>): void {
    for (const operation of process.operations) {
      if (!this.runOperation(operation, gridCell)) {
        break;
      }
    }
  }

  runOperation(operation: Operation, gridCell: Required<GridCell>): boolean {
    switch (operation.operationType.oneofKind) {
      // TODO fix types
      case 'transform': {
        return this.runTransform(
          operation.operationType.transform as unknown as Required<Operation_Transform>,
          gridCell
        );
      }
      case 'transfer': {
        return this.runTransfer(
          operation.operationType.transfer as unknown as Required<Operation_Transfer>,
          gridCell
        );
      }
      case 'sense': {
        return this.runSense(
          operation.operationType.sense as unknown as Required<Operation_Sense>,
          gridCell
        );
      }
    }
    return false;
  }

  runTransform(transform: Required<Operation_Transform>, gridCell: Required<GridCell>): boolean {
    console.log(`Running transform operation at ${gridCell.position.x}, ${gridCell.position.y}`);
    const fromResource = gridCell.resourceBuckets[transform.input.type][transform.input.quality];
    const toResource = gridCell.resourceBuckets[transform.output.type][transform.output.quality];

    if (fromResource.quantity < transform.input.quantity) {
      return false;
    }

    // Clamp based on rate
    const clampedRate = Math.min(fromResource.quantity / transform.input.quantity, transform.rate);

    gridCell.resourceBuckets[transform.input.type][transform.input.quality] = {
      ...fromResource,
      quantity: fromResource.quantity - (transform.input.quantity * clampedRate),
    };
    gridCell.resourceBuckets[transform.output.type][transform.output.quality] = {
      ...toResource,
      quantity: toResource.quantity + (transform.output.quantity * clampedRate),
    };
    return true;
  }

  runTransfer(transfer: Required<Operation_Transfer>, gridCell: Required<GridCell>): boolean {
    console.log(`Running transfer operation at ${gridCell.position.x}, ${gridCell.position.y}`);
    const toCell = this.getRelativeGridCell(gridCell, transfer.direction);
    if (!toCell) {
      return false;
    }
    
    const fromCellResource = gridCell.resourceBuckets[transfer.resource.type][transfer.resource.quality];
    if (fromCellResource.quantity < transfer.amount) {
      return false;
    }

    const toCellResource = toCell.resourceBuckets[transfer.resource.type][transfer.resource.quality];
    gridCell.resourceBuckets[transfer.resource.type][transfer.resource.quality] = {
      ...fromCellResource,
      quantity: fromCellResource.quantity - transfer.amount,
    };
    toCell.resourceBuckets[transfer.resource.type][transfer.resource.quality] ={
      ...toCellResource,
      quantity: toCellResource.quantity + transfer.amount,
    };

    return true;
  }

  runSense(sense: Required<Operation_Sense>, gridCell: Required<GridCell>): boolean {
    console.log(`Running sense operation at ${gridCell.position.x}, ${gridCell.position.y}`);
    const fromCell = this.getRelativeGridCell(gridCell, sense.direction);
    if (!fromCell) {
      return false;
    }
    const sensedResource = fromCell.resourceBuckets[sense.forType][sense.forQuality];
    switch (sense.condition.operator) {
      case ComparisonOperator.EQUAL:
        return sense.condition.value === sensedResource.quantity;
      case ComparisonOperator.GREATER_THAN:
        return sense.condition.value < sensedResource.quantity;
      case ComparisonOperator.LESS_THAN:
        return sense.condition.value < sensedResource.quantity;
    }
    return false;
  }

  getRelativeGridCell(cell: Required<GridCell>, direction: Direction): Required<GridCell> | null {
    switch (direction) {
      case Direction.NORTH: {
        if (cell.position.y > 0) {
          return this.grid[cell.position.x][cell.position.y - 1];
        }
        break;
      }
      case Direction.SOUTH: {
        if (this.grid[cell.position.x].length > cell.position.y + 1) {
          return this.grid[cell.position.x][cell.position.y + 1];
        }
        break;
      }
      case Direction.EAST: {
        if (this.grid.length > cell.position.x + 1) {
          return this.grid[cell.position.x + 1][cell.position.y];
        }
        break;
      }
      case Direction.WEST: {
        if (cell.position.x > 0) {
          return this.grid[cell.position.x - 1][cell.position.y];
        }
        break;
      }
      case Direction.UNSPECIFIED: {
        return cell;
      }
    }
    return null;
  }

  sortCells() {
    this.sortedCells.sort((a, b) => {
      const aInformation = a.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.LOW]
        + a.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.MEDIUM]
        + a.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.HIGH];
      const bInformation = b.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.LOW]
        + b.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.MEDIUM]
        + b.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.HIGH];
      if (aInformation > bInformation) {
        return -1;
      } else if (aInformation < bInformation) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
