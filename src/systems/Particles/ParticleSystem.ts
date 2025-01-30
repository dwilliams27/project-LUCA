import { Position, ResourceType } from "@/generated/process";
import { GameDimensions, ParticleState } from "@/store/gameStore";
import { PARTICLE_BASE_RADIUS } from "@/systems/Particles/ParticleRenderer";
import { Particle } from "@/types";
import { GRID_SIZE } from "@/utils/constants";
import { Application, Sprite, Texture } from "pixi.js";

interface CenterOfMass {
  position: Position;
  runningMass: number;
}

function pToKey(position: Position) {
  return `${position.x},${position.y}`;
}

export class ParticleSystem {
  textureMap: Map<ResourceType, Texture> = new Map();
  spriteMap: Map<string, Sprite> = new Map();
  centerOfMassMap: Map<string, Map<ResourceType, CenterOfMass>> = new Map();

  constructor() {
    for(let x = 0; x < GRID_SIZE; x++) {
      for(let y = 0; y < GRID_SIZE; y++) {
        const key = `${x},${y}`;
        this.centerOfMassMap.set(key, new Map());
        this.centerOfMassMap.get(key)!.set(ResourceType.ENERGY, { position: { x: 0, y: 0 }, runningMass: 1 });
        this.centerOfMassMap.get(key)!.set(ResourceType.MATTER, { position: { x: 0, y: 0 }, runningMass: 1 });
        this.centerOfMassMap.get(key)!.set(ResourceType.INFORMATION, { position: { x: 0, y: 0 }, runningMass: 1 });
      }
    }
  }

  updateTransitioningParticle(deltaTime: number, particle: Particle) {
    const dx = particle.targetX - particle.x;
    const dy = particle.targetY - particle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 1) {
      particle.transitioning = false;
      particle.sourceCell = particle.targetCell;
      particle.targetCell = undefined;
    } else {
      const speed = 0.1;
      particle.x += (dx / dist) * speed * deltaTime;
      particle.y += (dy / dist) * speed * deltaTime;
    }
  }

  updateCenterOfMassMap(particles: Record<string, Particle>) {
    Object.keys(particles).forEach((key) => {
      if (!particles[key].sourceCell) return;
      const particle = particles[key];
      const curCell = this.centerOfMassMap.get(pToKey(particles[key].sourceCell.position));
      const curCOM = curCell?.get(particle.resource.type);
      if (!curCell || !curCOM) return;
      curCell?.set(particle.resource.type, {
        position: {
          x: curCOM?.position.x + particle.x * particle.scale,
          y: curCOM?.position.y + particle.y * particle.scale,
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
    // Simple brownian motion
    particle.vx += (Math.random() - 0.5) * 0.3;
    particle.vy += (Math.random() - 0.5) * 0.3;
    
    // Damping
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    
    // Update position
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    
    // Bounce off cell walls
    if (!particle.sourceCell) {
      return;
    }
    const cellLeft = particle.sourceCell.position.x * cellSize;
    const cellRight = cellLeft + cellSize;
    const cellTop = particle.sourceCell.position.y * cellSize;
    const cellBottom = cellTop + cellSize;
    
    const particleSize = PARTICLE_BASE_RADIUS * particle.scale * 2;
    if (particle.x < cellLeft) {
      particle.x = cellLeft;
      particle.vx *= -1;
    } else if (particle.x > cellRight - particleSize) {
      particle.x = cellRight - particleSize;
      particle.vx *= -1;
    }
    
    if (particle.y < cellTop) {
      particle.y = cellTop;
      particle.vy *= -1;
    } else if (particle.y > cellBottom - particleSize) {
      particle.y = cellBottom - particleSize;
      particle.vy *= -1;
    }

    // Gravitate
    const com = this.centerOfMassMap.get(pToKey(particle.sourceCell.position))!.get(particle.resource.type)!;
    let gx = Math.random() * 0.02;
    if (com.position.x < particle.x) {
      gx *= -1;
    }
    let gy = Math.random() * 0.02;
    if (com.position.y < particle.y) {
      gy *= -1;
    }

    particle.vx += gy;
    particle.vy += gy;
  }

  tick(opts: {
    delta: number,
    application: Application,
    particles: ParticleState,
    dimensions: GameDimensions
  }) {
    this.updateCenterOfMassMap(opts.particles.byId);

    Object.keys(opts.particles.byId).forEach((key) => {
      const particle = opts.particles.byId[key];

      if (particle.transitioning) {
        this.updateTransitioningParticle(opts.delta, particle);
      } else {
        this.updateFloatingParticle(opts.delta, particle, opts.dimensions.cellSize);
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
        sprite.alpha = particle.resource.quality / 3;
        this.spriteMap.set(particle.id, sprite);
        opts.application.stage.addChild(sprite);
      }
      
      // Update sprite position
      sprite.x = particle.x;
      sprite.y = particle.y;
    });
  }
}
