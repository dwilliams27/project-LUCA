import { LocatableGameService } from "@/services/ServiceLocator";
import { Text } from "pixi.js";

export class TextService extends LocatableGameService {
  static name = "TEXT_SERVICE";

  createText(value: string, size: number, anchor = { x: 0.5, y: 0.5 }) {
    const text = new Text(value, {
      fontFamily: 'Arial',
      fontSize: size,
      fill: 0x000000
    });
    text.anchor.set(anchor.x, anchor.y);
    this.application.stage.addChild(text);

    return text;
  };
}
