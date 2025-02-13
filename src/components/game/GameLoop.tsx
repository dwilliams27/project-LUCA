import { useGridStore, useServiceStore } from "@/store/gameStore";
import { ParticleSystem } from "@/services/Particles/ParticleSystem";
import { ProcessSynthesisEngine } from "@/services/PSE/ProcessSynthesisEngine";
import { useApp, useTick } from "@pixi/react";
import { useEffect } from "react";
import { PromptService } from "@/services/PromptService";
import { SpriteService } from "@/services/SpriteService";
import { TextureService } from "@/services/TextureService";
import { AgentService } from "@/services/AgentService";
import { GoalService } from "@/services/GoalService";
import { ToolService } from "@/services/ToolService";

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


    // TODO: Streamline
    const promptService = new PromptService(gameServiceLocator);
    gameServiceLocator.addService(promptService);
    const agentService = new AgentService(gameServiceLocator);
    gameServiceLocator.addService(agentService);
    const goalService = new GoalService(gameServiceLocator);
    gameServiceLocator.addService(goalService);
    const toolService = new ToolService(gameServiceLocator);
    gameServiceLocator.addService(toolService);

    const spriteService = new SpriteService(gameServiceLocator);
    gameServiceLocator.addService(spriteService);
    const textureService = new TextureService(gameServiceLocator);
    gameServiceLocator.addService(textureService);
  }, []);

  return null;
}
