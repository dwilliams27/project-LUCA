import { GameServiceLocator, LocatableGameService } from "@/services/service-locator";
import { Graphics, Texture } from "pixi.js";

export const GLOBAL_TEXTURES = {
  DEBUG_AGENT: "DEBUG_AGENT",
}

export class TextureService extends LocatableGameService {
  static name = "TEXTURE_SERVICE";
  private textureCatalog: Record<string, Texture>;

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);
    this.textureCatalog = {
      [GLOBAL_TEXTURES.DEBUG_AGENT]: this.createBasicCircleTexture(0xFFFFFF, 30)
    };
  }

  createBasicCircleTexture(color: number, radius: number) {
    const gfx = new Graphics();
    gfx.beginFill(color);
    gfx.drawCircle(0, 0, radius);
    gfx.endFill();
    return this.application.renderer.generateTexture(gfx);
  };

  createTextureFromImage(base64: string) {
    return Texture.from(base64);
  }

  registerGlobalTexture(name: string, texture: Texture) {
    this.textureCatalog[name] = texture;
  }

  getTexture(name: string): Texture {
    return this.textureCatalog[name];
  }
}
