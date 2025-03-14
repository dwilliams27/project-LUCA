import { GameServiceLocator, LocatableGameService } from "@/services/service-locator";
import { ResourceQuality, ResourceType } from "@/services/types/inventory.service.types";

import { Direction, type BasicProcess, type GridCell, type Operation, type TransferOperation, type TransformOperation } from "@/services/types/physics.service.types";

export interface ExecutionContext {
  depth: number;
  maxDepth: number;
  seenPositions: Set<string>;
  executionChain: string[];
}

export class ProcessSynthesisEngine extends LocatableGameService {
  static name = "PROCESS_HANDLER_SERVICE";

  private grid: GridCell[][];
  private sortedCells: GridCell[];

  constructor(gameServiceLocator: GameServiceLocator, grid: GridCell[][]) {
    super(gameServiceLocator);
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

  runProcessesInCell(cell: GridCell): void {
    for (const process of cell.processes) {
      this.runProcess(process, cell);
    }
  }

  runProcess(process: BasicProcess, gridCell: GridCell): void {
    for (const operation of process.operations) {
      if (!this.runOperation(operation, gridCell)) {
        break;
      }
    }
  }

  runOperation(operation: Operation, gridCell: GridCell): boolean {
    switch (operation.type) {
      // TODO fix types
      case 'TRANSFORM': {
        return this.runTransform(
          operation as TransformOperation,
          gridCell
        );
      }
      case 'TRANSFER': {
        return this.runTransfer(
          operation as TransferOperation,
          gridCell
        );
      }
      // case 'sense': {
      //   return this.runSense(
      //     operation.operationType.sense as unknown as VOperationSense,
      //     gridCell
      //   );
      // }
    }
    return false;
  }

  runTransform(transform: TransformOperation, gridCell: GridCell): boolean {
    // console.log(`Running transform operation at ${gridCell.position.x}, ${gridCell.position.y}`);
    const fromResource = gridCell.resourceBuckets[transform.input.type][transform.input.quality];
    const toResource = gridCell.resourceBuckets[transform.output.type][transform.output.quality];

    if (fromResource.quantity < transform.input.quantity) {
      console.warn(`Unable to run transform, insufficient ${transform.input.quality} ${transform.input.type}`);
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

  runTransfer(transfer: TransferOperation, gridCell: GridCell): boolean {
    console.log(`Running transfer operation at ${gridCell.position.x}, ${gridCell.position.y}`);
    const toCell = this.getRelativeGridCell(gridCell, transfer.direction);
    if (!toCell) {
      console.warn(`Unable to run transfer, no destination found`);
      return false;
    }

    const fromCellResource = gridCell.resourceBuckets[transfer.resource.type][transfer.resource.quality];
    if (fromCellResource.quantity < transfer.amount) {
      console.warn(`Unable to run transfer, insufficient ${transfer.resource.quality} ${transfer.resource.type}`);
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

  // runSense(sense: VOperationSense, gridCell: GridCell): boolean {
  //   // console.log(`Running sense operation at ${gridCell.position.x}, ${gridCell.position.y}`);
  //   const fromCell = this.getRelativeGridCell(gridCell, sense.direction);
  //   if (!fromCell) {
  //     return false;
  //   }
  //   const sensedResource = fromCell.resourceBuckets[sense.forType].resources[sense.forQuality];
  //   switch (sense.condition.operator) {
  //     case ComparisonOperator.EQUAL:
  //       return sense.condition.value === sensedResource.quantity;
  //     case ComparisonOperator.GREATER_THAN:
  //       return sense.condition.value < sensedResource.quantity;
  //     case ComparisonOperator.LESS_THAN:
  //       return sense.condition.value < sensedResource.quantity;
  //   }
  //   return false;
  // }

  getRelativeGridCell(cell: GridCell, direction: Direction): GridCell | null {
    switch (direction) {
      case Direction.UP: {
        if (cell.position.y > 0) {
          return this.grid[cell.position.y - 1][cell.position.x];
        }
        break;
      }
      case Direction.DOWN: {
        if (cell.position.y + 1 < this.grid.length) { // Fixed condition
          return this.grid[cell.position.y + 1][cell.position.x];
        }
        break;
      }
      case Direction.LEFT: {
        if (this.grid[cell.position.y].length > cell.position.x + 1) {
          return this.grid[cell.position.y][cell.position.x + 1];
        }
        break;
      }
      case Direction.RIGHT: {
        if (cell.position.x > 0) {
          return this.grid[cell.position.y][cell.position.x - 1];
        }
        break;
      }
      case Direction.NONE: {
        return cell;
      }
    }
    return null;
  }

  sortCells() {
    this.sortedCells.sort((a, b) => {
      const aInformation = a.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.LOW]?.quantity
        + a.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.MEDIUM]?.quantity
        + a.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.HIGH]?.quantity;
      const bInformation = b.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.LOW]?.quantity
        + b.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.MEDIUM]?.quantity
        + b.resourceBuckets[ResourceType.INFORMATION][ResourceQuality.HIGH]?.quantity;
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
