import { LocatableGameService } from "@/services/ServiceLocator";
import { Text } from "pixi.js";

export class TextService extends LocatableGameService {
  static name = "TEXT_SERVICE";

  createText(value: string, size: number) {
    const text = new Text(value, {
      fontFamily: 'Arial',
      fontSize: size,
      fill: 0x000000
    });
    text.anchor.set(0.5);
    this.application.stage.addChild(text);

    return text;
  };
}
