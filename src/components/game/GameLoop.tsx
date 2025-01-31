import { useServiceStore } from "@/store/gameStore";
import { ParticleSystem } from "@/systems/Particles/ParticleSystem";
import { useApp, useTick } from "@pixi/react";
import { useEffect } from "react";

export function GameLoop() {
  const { gameServiceLocator } = useServiceStore();
  const app = useApp();
  
  useTick((delta) => {
    gameServiceLocator.tick(delta);
  });

  useEffect(() => {
    gameServiceLocator.initializeGame(app);

    const particleSystem = new ParticleSystem(
      gameServiceLocator,
    );
    gameServiceLocator.addService(particleSystem);
  }, []);

  return null;
}
