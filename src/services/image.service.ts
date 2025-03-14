import { IpcService } from "@/services/ipc.service";
import { GameServiceLocator, LocatableGameService } from "@/services/service-locator";
import { Graphics, Texture } from "pixi.js";

export const GLOBAL_IMAGES = {
  BASIC_WEAPON: "BASIC_WEAPON",
  BASIC_ARMOR: "BASIC_ARMOR"
}

export class ImageService extends LocatableGameService {
  static name = "IMAGE_SERVICE";
  private imageCatalog: Record<string, string> = {};

  constructor(serviceLocator: GameServiceLocator) {
    super(serviceLocator);

    const ipcService = serviceLocator.getService(IpcService);
    ipcService.generateImage({ prompt: "Pixel art of a simple sword" }).then((res) => {
      this.registerGlobalImage(GLOBAL_IMAGES.BASIC_WEAPON, res.b64_json)
    });
    ipcService.generateImage({ prompt: "Pixel art of simple armor" }).then((res) => {
      this.registerGlobalImage(GLOBAL_IMAGES.BASIC_ARMOR, res.b64_json);
    });
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

  registerGlobalImage(name: string, image: string) {
    this.imageCatalog[name] = image;
  }

  getImage(name: string): string {
    return this.imageCatalog[name];
  }
}
