import { Direction, type Position } from "@/services/types/physics.service.types";
import { GRID_SIZE } from "@/utils/constants";

export function getRelativeGridCell(position: Position, direction: Direction): Position | null {
  switch (direction) {
    case Direction.UP: {
      if (position.y > 0) {
        return { x: position.x, y: position.y - 1 };
      }
      break;
    }
    case Direction.DOWN: {
      if (position.y + 1 < GRID_SIZE) {
        return { x: position.x, y: position.y + 1 };
      }
      break;
    }
    case Direction.RIGHT: {
      if (position.x + 1 < GRID_SIZE) {
        return { x: position.x + 1, y: position.y };
      }
      break;
    }
    case Direction.LEFT: {
      if (position.x > 0) {
        return { x: position.x - 1, y: position.y };
      }
      break;
    }
    case Direction.NONE: {
      return position;
    }
  }
  return null;
}
