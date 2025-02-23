import { CollisionService } from "@/services/CollisionService";
import { GameServiceLocator, LocatableGameService } from "@/services/ServiceLocator";
import { dimensionStore, gridStore } from "@/store/gameStore";
import { Particle, ResourceStack, ResourceType } from "@/types";
import { PARTICLE_DAMP, PARTICLE_SPEED, PARTICLE_TRAVEL_SPEED, SNAP_DISTANCE } from "@/utils/constants";
import { resourceTypeToEmoji } from "@/utils/context";
import { genId, PARTICLE_ID } from "@/utils/id";
import { Text } from "pixi.js";

// Thx claude
class ParticleSystem {
  particles: Map<string, Particle> = new Map();
  tagIndex: Map<string, Set<string>> = new Map();

  /**
   * Adds a particle to the system
   * Time complexity: O(n) where n is the number of tags
   */
  addParticle(particle: Particle): void {
    // Store the particle
    this.particles.set(particle.id, particle);

    // Update the tag index
    for (const tag of particle.tags) {
      if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(particle.id);
    }
  }

  /**
   * Removes a particle from the system
   * Time complexity: O(n) where n is the number of tags
   */
  removeParticle(particleId: string): void {
    const particle = this.particles.get(particleId);
    if (!particle) return;

    // Remove from tag index
    for (const tag of particle.tags) {
      const tagSet = this.tagIndex.get(tag);
      if (tagSet) {
        tagSet.delete(particleId);
        if (tagSet.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }

    // Remove the particle
    this.particles.get(particleId)?.display.removeFromParent();
    this.particles.delete(particleId);
  }

  /**
   * Updates a particle's tags
   * Time complexity: O(m + n) where m is the number of old tags and n is the number of new tags
   */
  updateParticleTags(particleId: string, newTags: string[]): void {
    const particle = this.particles.get(particleId);
    if (!particle) return;

    // Remove old tags
    for (const tag of particle.tags) {
      const tagSet = this.tagIndex.get(tag);
      if (tagSet) {
        tagSet.delete(particleId);
        if (tagSet.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }

    // Add new tags
    particle.tags = newTags;
    for (const tag of newTags) {
      if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(particleId);
    }
  }

  /**
   * Gets all particles that have all the specified tags
   * Time complexity: O(m * min(n1, n2, ..., nk)) where m is the number of tags
   * and ni is the number of particles with tag i
   */
  getParticlesByTags(tags: string[]): Particle[] {
    if (tags.length === 0) return Array.from(this.particles.values());
    if (!tags.every(tag => this.tagIndex.has(tag))) return [];

    // Find the smallest tag set to minimize iterations
    const smallestTagSet = tags
      .map(tag => this.tagIndex.get(tag)!)
      .reduce((smallest, current) => 
        current.size < smallest.size ? current : smallest
      );

    // Check each particle in the smallest set against other tags
    const result: Particle[] = [];
    for (const particleId of smallestTagSet) {
      const particle = this.particles.get(particleId)!;
      if (tags.every(tag => particle.tags.includes(tag))) {
        result.push(particle);
      }
    }

    return result;
  }

  /**
   * Gets all particles that have any of the specified tags
   * Time complexity: O(sum(n1, n2, ..., nk)) where ni is the number of particles with tag i
   */
  getParticlesByAnyTag(tags: string[]): Particle[] {
    if (tags.length === 0) return Array.from(this.particles.values());

    const particleIds = new Set<string>();
    for (const tag of tags) {
      const tagSet = this.tagIndex.get(tag);
      if (tagSet) {
        for (const particleId of tagSet) {
          particleIds.add(particleId);
        }
      }
    }

    return Array.from(particleIds).map(id => this.particles.get(id)!);
  }
}

export class ParticleService extends LocatableGameService {
  static name = "PARTICLE_SERVICE";
  private system = new ParticleSystem();

  constructor(serivceLocator: GameServiceLocator) {
    super(serivceLocator);
    this.populateParticlesFromGrid();
  }

  populateParticlesFromGrid() {
    const cellSize = dimensionStore.getState().cellSize;
    gridStore.getState().cells.flat().forEach((gridCell) => {
      [ResourceType.ENERGY, ResourceType.MATTER, ResourceType.INFORMATION].forEach((rType) => {
        gridCell.resourceBuckets[rType].forEach((resource) => {
          for(let i = 0; i < resource.quantity; i++) {
            const particlePosition = {
              x: gridCell.position.x * cellSize + (Math.random() * cellSize),
              y: gridCell.position.y * cellSize + (Math.random() * cellSize),
            };
            const particleDisplay = new Text(resourceTypeToEmoji(resource.type) || "?", {
              fontFamily: 'Arial',
              fontSize: 12,
              fill: 0x000000
            });
            particleDisplay.anchor.set(0.5);
            particleDisplay.x = particlePosition.x;
            particleDisplay.y = particlePosition.y;
            this.application.stage.addChild(particleDisplay);

            const pId = genId(PARTICLE_ID);
            this.system.addParticle({
              id: pId,
              tags: [gridCell.id],
              display: particleDisplay,
              resource: resource,
              position: particlePosition,
              currentCell: gridCell,
              vx: 0,
              vy: 0,
              scale: 1,
              width: particleDisplay.width,
              height: particleDisplay.height,
            });
          }
        });
      });
    });
  }

  addParticle(particle: Particle) {
    this.system.addParticle(particle);
  }

  removeParticle(id: string) {
    this.system.removeParticle(id);
  }

  getParticlesByAnyTag(tags: string[]) {
    return this.system.getParticlesByAnyTag(tags);
  }

  tick(deltaTime: number) {
    const collisionService = this.serviceLocator.getService(CollisionService);
    this.system.particles.values().forEach((particle: Particle) => {
      if (particle.directedMovement) {
        this.updateParticleWithDirectedMovement(deltaTime, particle);
      } else {
        this.updateFloatingParticle(deltaTime, particle, collisionService);
      }
      particle.display.x = particle.position.x;
      particle.display.y = particle.position.y;
    });
  }

  updateParticleWithDirectedMovement(deltaTime: number, particle: Particle) {
    if (!particle.directedMovement?.staticTarget && !particle.directedMovement?.dynamicTarget) {
      return;
    }
    const targetPosition = particle.directedMovement.staticTarget ?? particle.directedMovement.dynamicTarget!();
    const dx = targetPosition.x - particle.position.x;
    const dy = targetPosition.y - particle.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < SNAP_DISTANCE) {
      if (particle.directedMovement.destroyOnFinish) {
        this.system.removeParticle(particle.id);
        return;
      }
      particle.position.x = targetPosition.x;
      particle.position.y = targetPosition.y;
      if (particle.targetCell) {
        particle.currentCell = particle.targetCell;
        particle.targetCell = undefined;
      }
      this.system.updateParticleTags(particle.id, [particle.currentCell.id]);
    } else {
      particle.position.x += (dx / dist) * PARTICLE_SPEED * PARTICLE_TRAVEL_SPEED * deltaTime;
      particle.position.y += (dy / dist) * PARTICLE_SPEED * PARTICLE_TRAVEL_SPEED * deltaTime;
    }
  }

  updateFloatingParticle(deltaTime: number, particle: Particle, collisionService: CollisionService) {
    particle.vx += (Math.random() - 0.5) * PARTICLE_SPEED;
    particle.vy += (Math.random() - 0.5) * PARTICLE_SPEED;
    // Dampening
    particle.vx *= PARTICLE_DAMP;
    particle.vy *= PARTICLE_DAMP;
    particle.position.x += particle.vx * PARTICLE_SPEED * deltaTime;
    particle.position.y += particle.vy * PARTICLE_SPEED * deltaTime;

    const { p, v } = collisionService.enforceGridCellBoundaries(particle.position, { x: particle.width, y: particle.height }, particle.currentCell.position);
    particle.position = p;
    particle.vx *= v.x;
    particle.vy *= v.y;
  }

  getParticleIdListForResource(tag: string, resource: ResourceStack) {
    const particles = this.getParticlesByAnyTag([tag]);
    const idList: string[] = [];
    for (const particle of particles) {
      if (particle.resource.type === resource.type && particle.resource.quality === resource.quality) {
        idList.push(particle.id);
        if (idList.length === resource.quantity) {
          break;
        }
      }
    }

    return idList;
  }

  getParticlesByIds(ids: string[]) {
    return ids.map(id => this.system.particles.get(id)).filter((p): p is Particle => p !== undefined);
  }
}
