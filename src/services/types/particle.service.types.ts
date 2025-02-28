import type { Resource } from "@/services/types/item.service.types";
import type { GridCell, Position } from "@/services/types/physics.service.types";
import { Text as PixiText } from "pixi.js";

export interface Particle {
  id: string;
  tags: string[];
  display: PixiText;
  resource: Resource;
  position: Position;
  currentCell: GridCell;
  directedMovement?: DirectedMovement;
  targetCell?: GridCell;
  vx: number;
  vy: number;
  scale: number;
  width: number;
  height: number;
};
export interface DirectedMovement {
  staticTarget?: Position;
  dynamicTarget?: () => Position;
  destroyOnFinish: boolean;
}
