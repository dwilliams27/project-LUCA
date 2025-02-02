import { useGridStore, useServiceStore } from "@/store/gameStore";
import { ParticleSystem } from "@/systems/Particles/ParticleSystem";
import { ProcessSynthesisEngine } from "@/systems/PSE/ProcessSynthesisEngine";
import { useApp, useTick } from "@pixi/react";
import { useEffect } from "react";

export function GameLoop() {
  const { gameServiceLocator } = useServiceStore();
  const app = useApp();
  const grid = useGridStore();
  
  useTick((delta) => {
    gameServiceLocator.tick(delta);
  });

  useEffect(() => {
    gameServiceLocator.initializeGame(app);

    // Init systems
    const particleSystem = new ParticleSystem(gameServiceLocator);
    gameServiceLocator.addService(particleSystem);
    const pse = new ProcessSynthesisEngine(
      gameServiceLocator,
      grid.cells
    );
    gameServiceLocator.addService(pse);
  }, []);

  return null;
}
