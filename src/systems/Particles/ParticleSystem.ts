import { ResourceType } from "@/generated/process";
import { ParticleState } from "@/store/gameStore";
import { PARTICLE_BASE_RADIUS } from "@/systems/Particles/ParticleRenderer";
import { Particle } from "@/types";
import { Application, Sprite, Texture } from "pixi.js";

export class ParticleSystem {
  textureMap: Map<ResourceType, Texture> = new Map();
  spriteMap: Map<string, Sprite> = new Map();

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

  updateFloatingParticle(deltaTime: number, particle: Particle, cellSize: number) {
    // Simple brownian motion
    particle.vx += (Math.random() - 0.5) * 0.1;
    particle.vy += (Math.random() - 0.5) * 0.1;
    
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
    if (particle.x < cellLeft + particleSize) {
      particle.x = cellLeft + particleSize;
      particle.vx *= -1;
    } else if (particle.x > cellRight - particleSize) {
      particle.x = cellRight - particleSize;
      particle.vx *= -1;
    }
    
    if (particle.y < cellTop + particleSize) {
      particle.y = cellTop + particleSize;
      particle.vy *= -1;
    } else if (particle.y > cellBottom - particleSize) {
      particle.y = cellBottom - particleSize;
      particle.vy *= -1;
    }
  }

  tick(opts: {
    delta: number,
    application: Application,
    particles: ParticleState,
    cellSize: number,
  }) {
    Object.keys(opts.particles.byId).forEach((key) => {
      const particle = opts.particles.byId[key];

      if (particle.transitioning) {
        this.updateTransitioningParticle(opts.delta, particle);
      } else {
        this.updateFloatingParticle(opts.delta, particle, opts.cellSize);
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
