import { useGameStore } from "@/store/gameStore";
import { ParticleRenderer } from "@/systems/Particles/ParticleRenderer";
import { Particle, VGridCell } from "@/types";

export class ParticleSystem {
  private particles: Map<string, Particle>;
  private renderer: ParticleRenderer;
  private gameStore: typeof useGameStore;

  constructor(renderer: ParticleRenderer, gameStore: typeof useGameStore) {
    this.particles = new Map();
    this.renderer = renderer;
    this.gameStore = gameStore;
  }

  update(deltaTime: number) {
    for (const particle of this.particles.values()) {
      if (particle.transitioning) {
        this.updateTransitioningParticle(particle, deltaTime);
      } else {
        this.updateFloatingParticle(particle, deltaTime);
      }
    }
    this.renderer.render(this.particles);
  }

  private updateFloatingParticle(particle: Particle, deltaTime: number) {
    // Add random movement within cell bounds
    const cellBounds = this.gameStore.getState().getCellBounds(particle.sourceCell!.position);
    
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
    if (particle.x < cellBounds.left || particle.x > cellBounds.right) {
      particle.vx *= -0.5;
      particle.x = Math.max(cellBounds.left, Math.min(cellBounds.right, particle.x));
    }
    if (particle.y < cellBounds.top || particle.y > cellBounds.bottom) {
      particle.vy *= -0.5;
      particle.y = Math.max(cellBounds.top, Math.min(cellBounds.bottom, particle.y));
    }
  }

  private updateTransitioningParticle(particle: Particle, deltaTime: number) {
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

  transferParticle(particleId: string, fromCell: VGridCell, toCell: VGridCell) {
    const particle = this.particles.get(particleId);
    if (!particle) return;
    
    particle.transitioning = true;
    particle.sourceCell = fromCell;
    particle.targetCell = toCell;
    
    // Calculate target position in new cell
    const targetBounds = this.gameStore.getState().getCellBounds(toCell.position);
    particle.targetX = targetBounds.left + Math.random() * this.gameStore.getState().dimensions.cellSize;
    particle.targetY = targetBounds.top + Math.random() * this.gameStore.getState().dimensions.cellSize;
  }
}
