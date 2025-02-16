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
