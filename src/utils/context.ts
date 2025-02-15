import { Position, Resource, ResourceStack, ResourceType } from "@/types";

export function resourceToStr(resource: Resource | ResourceStack, includeZero = false): string | null {
  if (resource.quantity === 0 && !includeZero) {
    return null;
  }

  const rtype = resource.type === ResourceType.ENERGY
    ? 'E'
    : resource.type === ResourceType.MATTER
      ? 'M'
      : 'I';
  
  return `${rtype},${resource.quality},${resource.quantity}`;
}

export function resourceAbrToType(resourceAbr: string): ResourceType | null {
  if (resourceAbr === "E") {
    return ResourceType.ENERGY;
  } else if (resourceAbr === "M") {
    return ResourceType.MATTER;
  } else if (resourceAbr === "I") {
    return ResourceType.INFORMATION;
  }
  return null;
}

export function posToStr(position: Position) {
  return `${position.x},${position.y}`;
}
export function strToPos(str: string) {
  return { x: str.substring(0, str.indexOf(',')), y: str.substring(str.indexOf(',')) };
}
