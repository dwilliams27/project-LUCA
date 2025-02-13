import { dimensionStore } from "@/store/gameStore";
import { Direction, Position } from "@/types";

export function getRelativeGridCell(position: Position, direction: Direction): Position | null {
  const gridSize = dimensionStore.getState().gridLength;

  switch (direction) {
    case Direction.NORTH: {
      if (position.y > 0) {
        return { x: position.x, y: position.y - 1 };
      }
      break;
    }
    case Direction.SOUTH: {
      if (position.y + 1 < gridSize) {
        return { x: position.x, y: position.y + 1 };
      }
      break;
    }
    case Direction.EAST: {
      if (position.x + 1 < gridSize) {
        return { x: position.x + 1, y: position.y };
      }
      break;
    }
    case Direction.WEST: {
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
