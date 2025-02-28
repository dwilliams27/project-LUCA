import { LocatableGameService } from "@/services/service-locator";
import { Sprite, Texture } from "pixi.js";

export class SpriteService extends LocatableGameService {
  static name = "SPRITE_SERVICE";

  createSprite(name: string, texture: Texture) {
    const sprite = new Sprite(texture);
    sprite.name = name;
    this.application.stage.addChild(sprite);

    return sprite;
  };
}
