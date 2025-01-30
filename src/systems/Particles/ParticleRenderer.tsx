import { ResourceType } from "@/generated/process";
import { useGameStore } from "@/store/gameStore";
import { ParticleSystem } from "@/systems/Particles/ParticleSystem";
import { useApp, Container, useTick } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useEffect, useRef } from "react";

export const ResourceTypeToColor = {
  [ResourceType.ENERGY]: 0x00FFFF,
  [ResourceType.MATTER]: 0xFFFF00,
  [ResourceType.INFORMATION]: 0xFF00FF,
}

export const PARTICLE_BASE_RADIUS = 10;

export const ParticleRenderer: React.FC<{ zIndex: number, onResize: number }> = ({ zIndex, onResize }) => {
  const app = useApp();
  const { dimensions } = useGameStore();
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());

  useEffect(() => {
    const createTexture = (color: number) => {
      const gfx = new Graphics();
      gfx.beginFill(color);
      gfx.drawCircle(0, 0, PARTICLE_BASE_RADIUS);
      gfx.endFill();
      return app.renderer.generateTexture(gfx);
    };

    particleSystemRef.current.textureMap.set(ResourceType.ENERGY, createTexture(ResourceTypeToColor[ResourceType.ENERGY]));
    particleSystemRef.current.textureMap.set(ResourceType.MATTER, createTexture(ResourceTypeToColor[ResourceType.MATTER]));
    particleSystemRef.current.textureMap.set(ResourceType.INFORMATION, createTexture(ResourceTypeToColor[ResourceType.INFORMATION]));
    
    return () => {
      particleSystemRef.current.textureMap.forEach((texture) => {
        texture.destroy();
      });
    };
  }, [app]);

  useTick((delta) => {
    if (!particleSystemRef.current.textureMap) return;
    particleSystemRef.current.tick({
      delta,
      application: app,
      particles: useGameStore.getState().particles,
      dimensions
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
