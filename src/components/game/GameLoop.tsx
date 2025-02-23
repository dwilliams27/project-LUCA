import { useGridStore, useServiceStore } from "@/store/gameStore";
import { ParticleSystem } from "@/services/Particles/ParticleSystem";
import { ProcessSynthesisEngine } from "@/services/PSE/ProcessSynthesisEngine";
import { useApp, useTick } from "@pixi/react";
import { useEffect } from "react";
import { PromptService } from "@/services/PromptService";
import { SpriteService } from "@/services/SpriteService";
import { TextureService } from "@/services/TextureService";
import { AgentService } from "@/services/AgentService";
import { ToolService } from "@/services/ToolService";
import { IpcService } from "@/services/IpcService";
import { TextService } from "@/services/TextService";
import { CollisionService } from "@/services/CollisionService";
import { ParticleService } from "@/services/ParticleService";

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
    // const particleSystem = new ParticleSystem(gameServiceLocator);
    // gameServiceLocator.addService(particleSystem);
    // const pse = new ProcessSynthesisEngine(
    //   gameServiceLocator,
    //   grid.cells
    // );
    // gameServiceLocator.addService(pse);


    // TODO: Streamline
    const promptService = new PromptService(gameServiceLocator);
    gameServiceLocator.addService(promptService);
    const agentService = new AgentService(gameServiceLocator);
    gameServiceLocator.addService(agentService);
    const toolService = new ToolService(gameServiceLocator);
    gameServiceLocator.addService(toolService);
    const ipcService = new IpcService(gameServiceLocator);
    gameServiceLocator.addService(ipcService);
    const textService = new TextService(gameServiceLocator);
    gameServiceLocator.addService(textService);
    const collisionService = new CollisionService(gameServiceLocator);
    gameServiceLocator.addService(collisionService);

    const particleService = new ParticleService(gameServiceLocator);
    gameServiceLocator.addService(particleService);
    const spriteService = new SpriteService(gameServiceLocator);
    gameServiceLocator.addService(spriteService);
    const textureService = new TextureService(gameServiceLocator);
    gameServiceLocator.addService(textureService);
  }, []);

  return null;
}
