import { Position, ResourceQuality, ResourceType } from "@/generated/process";

export interface Particle {
  id: string;
  resourceType: ResourceType;
  resourceQuality: ResourceQuality;
  // Physical properties
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  // For smooth transitions between cells
  transitioning: boolean;
  sourceCell?: Position;
  targetCell?: Position;
};

export class ParticleSystem {

};
