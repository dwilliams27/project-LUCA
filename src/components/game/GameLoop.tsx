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
import { CollisionService } from "@/services/collision.service";
import { ParticleService } from "@/services/particle.service";
import { SubscriptionService } from "@/services/subscription.service";
import { ImageService } from "@/services/image.service";
import { InventoryService } from "@/services/inventory.service";
import { RoundService } from "@/services/round.service";

export function GameLoop() {
  const { gameServiceLocator } = useServiceStore();
  const app = useApp();
  
  useTick((delta) => {
    gameServiceLocator.tick(delta);
  });

  useEffect(() => {
    gameServiceLocator.initializeGame(app);

    new PromptService(gameServiceLocator);
    new AgentService(gameServiceLocator);
    new RoundService(gameServiceLocator);
    new ToolService(gameServiceLocator);
    new IpcService(gameServiceLocator);
    new TextService(gameServiceLocator);

    new CollisionService(gameServiceLocator);

    new InventoryService(gameServiceLocator);
    new SubscriptionService(gameServiceLocator);

    new ParticleService(gameServiceLocator);
    new SpriteService(gameServiceLocator);
    new TextureService(gameServiceLocator);
    new ImageService(gameServiceLocator);
  }, []);

  return null;
}
