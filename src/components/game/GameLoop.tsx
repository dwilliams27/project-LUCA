import { useServiceStore } from "@/store/game-store";
import { useApp, useTick } from "@pixi/react";
import { useEffect } from "react";
import { PromptService } from "@/services/prompt.service";
import { SpriteService } from "@/services/sprite.service";
import { TextureService } from "@/services/texture.service";
import { AgentService } from "@/services/agent.service";
import { ToolService } from "@/services/tool.service";
import { IpcService } from "@/services/ipc.service";
import { TextService } from "@/services/text.service";
import { CollisionService } from "@/services/physics.service";
import { ParticleService } from "@/services/particle.service";

export function GameLoop() {
  const { gameServiceLocator } = useServiceStore();
  const app = useApp();
  
  useTick((delta) => {
    gameServiceLocator.tick(delta);
  });

  useEffect(() => {
    gameServiceLocator.initializeGame(app);

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
