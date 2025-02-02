import { Direction, Position, Resource, ResourceQuality, ResourceStack, ResourceType } from "@/generated/process";
import { dimensionStore, gridStore } from "@/store/gameStore";
import { GameServiceLocator, LocatableGameService } from "@/systems/ServiceLocator";
import { Particle, VGridCell, VOperationTransfer, VOperationTransform } from "@/types";
import { GRID_SIZE, PARTICLE_BASE_RADIUS, PARTICLE_SPEED, PARTICLE_TRAVEL_SPEED } from "@/utils/constants";
import { genId, PARTICLE_ID, posToStr } from "@/utils/id";
import { Graphics, Sprite, Texture } from "pixi.js";

interface CenterOfMass {
  position: Position;
  runningMass: number;
}

export const ResourceTypeToColor = {
  [ResourceType.ENERGY]: 0x00FFFF,
  [ResourceType.MATTER]: 0xFFFF00,
  [ResourceType.INFORMATION]: 0xFF00FF,
}

export const PARTICLE_SYSTEM_SERVICE = 'PARTICLE_SYSTEM_SERVICE';

export class ParticleSystem extends LocatableGameService {
  static name = PARTICLE_SYSTEM_SERVICE;

  textureMap: Map<ResourceType, Texture> = new Map();
  spriteMap: Map<string, Sprite> = new Map();
  centerOfMassMap: Map<string, Map<ResourceType, CenterOfMass>> = new Map();

  byId: Record<string, Particle> = {};
  byType: Record<string, Particle[]> = {};
  byPosition: Record<string, Particle[]> = {};

  constructor(serviceLocator: GameServiceLocator) {
    super(PARTICLE_SYSTEM_SERVICE, serviceLocator);

    for(let x = 0; x < GRID_SIZE; x++) {
      for(let y = 0; y < GRID_SIZE; y++) {
        const key = `${x},${y}`;
        this.centerOfMassMap.set(key, new Map());
        this.centerOfMassMap.get(key)!.set(ResourceType.ENERGY, { position: { x: 0, y: 0 }, runningMass: 1 });
        this.centerOfMassMap.get(key)!.set(ResourceType.MATTER, { position: { x: 0, y: 0 }, runningMass: 1 });
        this.centerOfMassMap.get(key)!.set(ResourceType.INFORMATION, { position: { x: 0, y: 0 }, runningMass: 1 });
      }
    }

    this.textureMap.set(ResourceType.ENERGY, this.createTexture(ResourceTypeToColor[ResourceType.ENERGY]));
    this.textureMap.set(ResourceType.MATTER, this.createTexture(ResourceTypeToColor[ResourceType.MATTER]));
    this.textureMap.set(ResourceType.INFORMATION, this.createTexture(ResourceTypeToColor[ResourceType.INFORMATION]));

    this.populateParticlesFromGrid();
  }

  isInitialized(): boolean {
    return true;
  }

  createTexture(color: number) {
    const gfx = new Graphics();
    gfx.beginFill(color);
    gfx.drawCircle(0, 0, PARTICLE_BASE_RADIUS);
    gfx.endFill();
    return this.application.renderer.generateTexture(gfx);
  };

  populateParticlesFromGrid() {
    const cellSize = dimensionStore.getState().cellSize;
    gridStore.getState().cells.flat().forEach((gridCell) => {
      [ResourceType.ENERGY, ResourceType.MATTER, ResourceType.INFORMATION].forEach((rType) => {
        gridCell.resourceBuckets[rType].resources.forEach((resource) => {
          for(let i = 0; i < resource.quantity; i++) {
            const pId = genId(PARTICLE_ID);
            this.byId[pId] = {
              id: pId,
              resource: resource,
              position: {
                x: gridCell.position.x * cellSize + (Math.random() * cellSize),
                y: gridCell.position.y * cellSize + (Math.random() * cellSize),
              },
              targetX: 0,
              targetY: 0,
              vx: 0,
              vy: 0,
              scale: 1,
              transitioning: false,
              sourceCell: gridCell,
            };
          }
        });
      });
    });
  
    this.byType = {
      [ResourceType.ENERGY]: [],
      [ResourceType.INFORMATION]: [],
      [ResourceType.MATTER]: [],
    }

    gridStore.getState().cells.flat().forEach((cell) => {
      this.byPosition[posToStr(cell.position)] = [];
    });
    Object.keys(this.byId).forEach((key) => {
      this.byType[this.byId[key].resource.type].push(this.byId[key]);
      this.byPosition[posToStr(this.byId[key].sourceCell!.position)].push(this.byId[key]);
    });
  }

  refreshGridMap(particles: Particle[]) {
    for(let i = 0; i < particles.length; i++) {
      if (particles[i].sourceCell) {
        const sourceCellKey = posToStr(particles[i].sourceCell?.position!);
        const index = this.byPosition[sourceCellKey].findIndex((p) => p.id === particles[i].id);
        if (index !== -1) {
          this.byPosition[sourceCellKey].splice(index, 1);
        }
      }
      if (particles[i].targetCell) {
        const destCellKey = posToStr(particles[i].targetCell?.position!);
        this.byPosition[destCellKey].push(particles[i]);
      }
    }
  }

  updateTransitioningParticle(deltaTime: number, particle: Particle) {
    const dx = particle.targetX - particle.position.x;
    const dy = particle.targetY - particle.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) {
      particle.transitioning = false;
      // TODO: Make transfer instant? Need guarantees for PSE execution
      particle.sourceCell = particle.targetCell;
      this.refreshGridMap([particle]);
      particle.targetCell = undefined;
    } else {
      particle.position.x += (dx / dist) * PARTICLE_SPEED * PARTICLE_TRAVEL_SPEED * deltaTime;
      particle.position.y += (dy / dist) * PARTICLE_SPEED * PARTICLE_TRAVEL_SPEED * deltaTime;
    }
  }

  // TODO: Real inefficient
  updateCenterOfMassMap() {
    Object.keys(this.byId).forEach((key) => {
      if (!this.byId[key].sourceCell) return;
      const particle = this.byId[key];
      const curCell = this.centerOfMassMap.get(posToStr(this.byId[key].sourceCell.position));
      const curCOM = curCell?.get(particle.resource.type);
      if (!curCell || !curCOM) return;
      curCell?.set(particle.resource.type, {
        position: {
          x: curCOM?.position.x + particle.position.x * particle.scale,
          y: curCOM?.position.y + particle.position.y * particle.scale,
        },
        runningMass: curCOM.runningMass + particle.scale
      });
    });
    for (let cellKey of this.centerOfMassMap.keys()) {
      const cellMap = this.centerOfMassMap.get(cellKey)!;
      for (let recKey of cellMap.keys()) {
        const com = cellMap.get(recKey)!;
        cellMap.set(recKey, {
          position: {
            x: com.position.x / com.runningMass,
            y: com.position.y / com.runningMass,
          },
          runningMass: 1
        });
      }
    }
  }

  updateFloatingParticle(
    deltaTime: number,
    particle: Particle,
    cellSize: number
  ) {
    // Damping
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    
    // Update position
    particle.position.x += particle.vx * deltaTime;
    particle.position.y += particle.vy * deltaTime;
    
    // Bounce off cell walls
    if (!particle.sourceCell) {
      return;
    }
    const cellLeft = particle.sourceCell.position.x * cellSize;
    const cellRight = cellLeft + cellSize;
    const cellTop = particle.sourceCell.position.y * cellSize;
    const cellBottom = cellTop + cellSize;
    
    const particleSize = PARTICLE_BASE_RADIUS * particle.scale * 2;
    if (particle.position.x < cellLeft) {
      particle.position.x = cellLeft;
      particle.vx *= -1;
    } else if (particle.position.x > cellRight - particleSize) {
      particle.position.x = cellRight - particleSize;
      particle.vx *= -1;
    }
    
    if (particle.position.y < cellTop) {
      particle.position.y = cellTop;
      particle.vy *= -1;
    } else if (particle.position.y > cellBottom - particleSize) {
      particle.position.y = cellBottom - particleSize;
      particle.vy *= -1;
    }

    // Gravitate
    const com = this.centerOfMassMap.get(posToStr(particle.sourceCell.position))!.get(particle.resource.type)!;
    let gx = Math.random() * PARTICLE_SPEED;
    if (com.position.x < particle.position.x) {
      gx *= -1;
    }
    let gy = Math.random() * PARTICLE_SPEED;
    if (com.position.y < particle.position.y) {
      gy *= -1;
    }

    particle.vx += gy;
    particle.vy += gy;
  }

  transferParticles(
    transfer: VOperationTransfer,
    fromCell: VGridCell,
    toCell: VGridCell,
  ) {
    const transferedParticles: Particle[] = [];
    // TODO: Optimize
    for(let i = 0; i < transfer.resource.quantity; i++) {
      const particle = this.byPosition[posToStr(fromCell.position)].find(
        (particle) => (
          particle.resource.quality === transfer.resource.quality
          && particle.resource.type === transfer.resource.type
        )
      );
      if (!particle) {
        console.warn("Insufficient resources in source cell for transfer");
        return;
      }
      
      particle.transitioning = true;
      particle.sourceCell = fromCell;
      particle.targetCell = toCell;

      const cellSize = dimensionStore.getState().cellSize;
      particle.targetX = (transfer.direction === Direction.NORTH || transfer.direction === Direction.SOUTH)
        ? particle.position.x
        : cellSize * toCell.position.x + (Math.random() * cellSize * 0.7 + PARTICLE_BASE_RADIUS);
      particle.targetY = (transfer.direction === Direction.EAST || transfer.direction === Direction.WEST)
        ? particle.position.y
        : cellSize * toCell.position.y + (Math.random() * cellSize * 0.7 + PARTICLE_BASE_RADIUS);

      transferedParticles.push(particle);
    }
    this.refreshGridMap(transferedParticles);
  }

  transformParticles(
    gridCell: VGridCell,
    transform: VOperationTransform,
    clampedRate: number
  ) {
    const cellParticles = this.byPosition[posToStr(gridCell.position)];
    // TODO: Optimize
    for(let i = 0; i < transform.input.quantity * clampedRate; i++) {
      const particleIndex = cellParticles.findIndex(
        (particle) => (
          particle.resource.quality === transform.input.quality
          && particle.resource.type === transform.input.type
        )
      );
      if (!particleIndex) {
        console.warn("Insufficient resources in source cell for transform");
        break;
      }
      cellParticles.splice(particleIndex);
    }
    for (let i = 0; i < transform.output.quantity * clampedRate; i++) {
      const cellSize = dimensionStore.getState().cellSize;
      cellParticles.push({
        id: genId(PARTICLE_ID),
        resource: gridCell.resourceBuckets[transform.output.type].resources[transform.output.quality],
        position: {
          x: cellSize * gridCell.position.x + Math.random() * cellSize,
          y: cellSize * gridCell.position.y + Math.random() * cellSize
        },
        targetX: 0,
        targetY: 0,
        vx: 0,
        vy: 0,
        scale: 1,
        transitioning: false
      });
    }
  }

  tick(delta: number) {
    this.updateCenterOfMassMap();
    const cellSize = dimensionStore.getState().cellSize;

    Object.keys(this.byId).forEach((key) => {
      const particle = this.byId[key];

      // Simple brownian motion
      particle.vx += (Math.random() - 0.5) * PARTICLE_SPEED;
      particle.vy += (Math.random() - 0.5) * PARTICLE_SPEED;
      if (particle.transitioning) {
        this.updateTransitioningParticle(delta, particle);
      } else {
        this.updateFloatingParticle(delta, particle, cellSize);
      }
      
      // Get or create sprite for this particle
      let sprite = this.spriteMap.get(particle.id);
      
      if (!sprite) {
        if (!this.textureMap) {
          return;
        }
        sprite = new Sprite(this.textureMap.get(particle.resource.type));
        sprite.name = particle.id;
        sprite.scale = { x: particle.scale, y: particle.scale };
        sprite.alpha = (particle.resource.quality + 1) / 3;
        this.spriteMap.set(particle.id, sprite);
        this.application.stage.addChild(sprite);
      }
      
      // Update sprite position
      sprite.x = particle.position.x;
      sprite.y = particle.position.y;
    });
  }
}
