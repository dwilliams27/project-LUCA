import { ResourceType, type Resource, type ResourceStack } from "@/services/types/inventory.service.types";
import type { Position } from "@/services/types/physics.service.types";
import { GRID_SIZE } from "@/utils/constants";

export function resourceToStr(resource: Resource | ResourceStack, includeZero = false): string | null {
  if (resource.quantity === 0 && !includeZero) {
    return null;
  }

  const rtype = resource.type === ResourceType.ENERGY
    ? 'E'
    : resource.type === ResourceType.MATTER
      ? 'M'
      : 'I';
  
  return `${rtype}(${resource.quality})x${resource.quantity}`;
}

export function cellToPossibleAdjacent(cellPosition: Position) {
  const up = cellPosition.y > 0 ? 'U' : null;
  const right = cellPosition.x + 1 < GRID_SIZE ? 'R' : null;
  const down = cellPosition.y + 1 < GRID_SIZE ? 'D' : null;
  const left = cellPosition.x > 0 ? 'L' : null;
  return [up, right, down, left].filter((dir) => !!dir).join(',');
}

export function resourceTypeToEmoji(resourceType: ResourceType) {
  switch (resourceType) {
    case ResourceType.ENERGY:
      return "⚡️";
    case ResourceType.MATTER:
      return "⚛️";
    case ResourceType.INFORMATION:
      return "🧬";
    default:
      return null;
  }
}

export function resourceAbrToType(resourceAbr: string): ResourceType | null {
  switch (resourceAbr) {
    case "E":
      return ResourceType.ENERGY;
    case "M":
      return ResourceType.MATTER;
    case "I":
      return ResourceType.INFORMATION;
    default:
      return null;
  }
}

export function posToStr(position: Position) {
  return `${position.x},${position.y}`;
}
export function strToPos(str: string) {
  return { x: str.substring(0, str.indexOf(',')), y: str.substring(str.indexOf(',')) };
}
