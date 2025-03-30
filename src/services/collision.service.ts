import { LocatableGameService } from "@/services/service-locator";
import { dimensionStore } from "@/store/game-store";

import type { Position } from "@/services/types/physics.service.types";

export class CollisionService extends LocatableGameService {
  static name = "COLLISION_SERVICE";

  enforceGridCellBoundaries(entityPosition: Position, entityDimensions: Position, cell: Position): { p: Position, v: Position } {
    const cellSize = dimensionStore.getState().cellSize;
    const cellLeft = cell.x * cellSize;
    const cellRight = cellLeft + cellSize;
    const cellTop = cell.y * cellSize;
    const cellBottom = cellTop + cellSize;
    
    const p = { ...entityPosition };
    const v = { x: 1, y: 1 };
    if (entityPosition.x - entityDimensions.x / 2 < cellLeft) {
      p.x = cellLeft + entityDimensions.x / 2;
      v.x *= -1;
    } else if (entityPosition.x + entityDimensions.x / 2 > cellRight) {
      p.x = cellRight - entityDimensions.x / 2;
      v.x *= -1;
    }
    
    if (entityPosition.y - entityDimensions.y / 2 < cellTop) {
      p.y = cellTop + entityDimensions.y / 2;
      v.y *= -1;
    } else if (entityPosition.y + entityDimensions.y / 2 > cellBottom) {
      p.y = cellBottom - entityDimensions.y / 2;
      v.y *= -1;
    }

    return { p, v };
  };
}
