import { ResourceType } from "@/generated/process";
import { useGameStore } from "@/store/gameStore";
import { ParticleSystem } from "@/systems/Particles/ParticleSystem";
import { PARTICLE_BASE_RADIUS } from "@/utils/constants";
import { useApp, Container, useTick } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useEffect } from "react";

export const ResourceTypeToColor = {
  [ResourceType.ENERGY]: 0x00FFFF,
  [ResourceType.MATTER]: 0xFFFF00,
  [ResourceType.INFORMATION]: 0xFF00FF,
}

export const ParticleRenderer: React.FC<{ zIndex: number, onResize: number }> = ({ zIndex }) => {
  const app = useApp();
  const {
    dimensions,
    particles,
    registerParticleSystem,
    refreshGridMap,
  } = useGameStore();

  useEffect(() => {
    const createTexture = (color: number) => {
      const gfx = new Graphics();
      gfx.beginFill(color);
      gfx.drawCircle(0, 0, PARTICLE_BASE_RADIUS);
      gfx.endFill();
      return app.renderer.generateTexture(gfx);
    };

    const particleSystem = new ParticleSystem();
    registerParticleSystem(particleSystem);
    particleSystem.textureMap.set(ResourceType.ENERGY, createTexture(ResourceTypeToColor[ResourceType.ENERGY]));
    particleSystem.textureMap.set(ResourceType.MATTER, createTexture(ResourceTypeToColor[ResourceType.MATTER]));
    particleSystem.textureMap.set(ResourceType.INFORMATION, createTexture(ResourceTypeToColor[ResourceType.INFORMATION]));
    
    return () => {
      particleSystem.textureMap.forEach((texture) => {
        texture.destroy();
      });
    };
  }, [app]);

  useTick((delta) => {
    if (!particles.system?.textureMap) return;
    particles.system.tick({
      delta,
      application: app,
      particles: useGameStore.getState().particles,
      dimensions,
      refreshGridMap
    });
  });

  return (
    <Container zIndex={zIndex} />
  )
}
