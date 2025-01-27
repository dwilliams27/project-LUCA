import { ResourceType } from "@/generated/process";
import { useGameStore } from "@/store/gameStore";
import { Particle } from "@/types";
import { useApp, Container, useTick } from "@pixi/react";
import { Graphics, Sprite, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";

export const ResourceTypeToColor = {
  [ResourceType.ENERGY]: 0x00FFFF,
  [ResourceType.MATTER]: 0xFFFF00,
  [ResourceType.INFORMATION]: 0xFF00FF,
}

export const ParticleRenderer: React.FC<{ zIndex: number }> = ({ zIndex }) => {
  const app = useApp();
  const textureMapRef = useRef<Map<ResourceType, Texture>>(new Map());
  const spriteMapRef = useRef<Map<string, Sprite>>(new Map());

  useEffect(() => {
    const createTexture = (color: number) => {
      const gfx = new Graphics();
      gfx.beginFill(color);
      gfx.drawCircle(0, 0, 4);
      gfx.endFill();
      return app.renderer.generateTexture(gfx);
    };

    textureMapRef.current.set(ResourceType.ENERGY, createTexture(ResourceTypeToColor[ResourceType.ENERGY]));
    textureMapRef.current.set(ResourceType.MATTER, createTexture(ResourceTypeToColor[ResourceType.MATTER]));
    textureMapRef.current.set(ResourceType.INFORMATION, createTexture(ResourceTypeToColor[ResourceType.INFORMATION]));
    
    return () => {
      textureMapRef.current.forEach((texture) => {
        texture.destroy();
      });
    };
  }, [app]);

  const updateTransitioningParticle = (particle: Particle, deltaTime: number) => {
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

  const updateFloatingParticle = (particle: Particle, deltaTime: number) => {
    // Add random movement within cell bounds
    const cellBounds = useGameStore.getState().getCellBounds(particle.sourceCell!.position);
    
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

  useTick((delta) => {
    if (!textureMapRef.current) return;

    const particles = useGameStore.getState().particles;
    Object.keys(particles.byId).forEach((key) => {
      const particle = particles.byId[key];

      if (particle.transitioning) {
        updateTransitioningParticle(particle, delta);
      } else {
        updateFloatingParticle(particle, delta);
      }
      
      // Get or create sprite for this particle
      const spriteMap = spriteMapRef.current;
      let sprite = spriteMap.get(particle.id);
      
      if (!sprite) {
        if (!textureMapRef.current) {
          return;
        }
        sprite = new Sprite(textureMapRef.current.get(particle.resource.type));
        sprite.name = particle.id;
        sprite.scale = { x: particle.resource.quantity / 50, y: particle.resource.quantity / 50 };
        sprite.alpha = particle.resource.quality / 3;
        spriteMap.set(particle.id, sprite);
        app.stage.addChild(sprite);
      }
      
      // Update sprite position
      sprite.x = particle.x;
      sprite.y = particle.y;
    });
  });

  return (
    <Container zIndex={zIndex} />
  )
}

// TODO integrate
// transferParticle(particleId: string, fromCell: VGridCell, toCell: VGridCell) {
//   const particle = useGameStore.getState().particles.byId[particleId];
//   if (!particle) return;
  
//   particle.transitioning = true;
//   particle.sourceCell = fromCell;
//   particle.targetCell = toCell;
  
//   const targetBounds = useGameStore.getState().getCellBounds(toCell.position);
//   const cellSize = targetBounds.right - targetBounds.left;
//   particle.targetX = targetBounds.left + Math.random() * cellSize;
//   particle.targetY = targetBounds.top + Math.random() * cellSize;
// }
