import { ResourceType } from "@/generated/process";
import { Particle } from "@/types";
import { Application, Graphics, Sprite, Texture } from "pixi.js";

export const ResourceTypeToColor = {
  [ResourceType.ENERGY]: 0x00FFFF,
  [ResourceType.MATTER]: 0xFFFF00,
  [ResourceType.INFORMATION]: 0xFF00FF,
}
export class ParticleRenderer {
  private app: Application;
  private particleTextures: Map<ResourceType, Texture>;
  private particleSprites: Map<string, Sprite>;

  constructor(app: Application) {
    this.app = app;

    this.particleTextures = new Map();
    this.particleSprites = new Map();
    
    this.setupTextures();
  }

  private setupTextures() {
    this.particleTextures = new Map();
    const gfxEnergy = new Graphics();
    gfxEnergy.beginFill(ResourceTypeToColor[ResourceType.ENERGY]);
    gfxEnergy.drawCircle(0, 0, 4);
    gfxEnergy.endFill();
    this.particleTextures.set(ResourceType.ENERGY, this.app.renderer.generateTexture(gfxEnergy));

    const gfxMatter = new Graphics();
    gfxEnergy.beginFill(ResourceTypeToColor[ResourceType.MATTER]);
    gfxEnergy.drawCircle(0, 0, 4);
    gfxEnergy.endFill();
    this.particleTextures.set(ResourceType.MATTER, this.app.renderer.generateTexture(gfxMatter));

    const gfxInformation = new Graphics();
    gfxEnergy.beginFill(ResourceTypeToColor[ResourceType.INFORMATION]);
    gfxEnergy.drawCircle(0, 0, 4);
    gfxEnergy.endFill();
    this.particleTextures.set(ResourceType.INFORMATION, this.app.renderer.generateTexture(gfxInformation));
  }

  render(particles: Map<string, Particle>) {
    for (const [id, particle] of particles) {
      let sprite = this.particleSprites.get(id);
      if (!sprite) {
        sprite = new Sprite(this.particleTextures.get(particle.resourceType)!);
        this.particleSprites.set(id, sprite);
        this.app.stage.addChild(sprite);
      }
      sprite.x = particle.x;
      sprite.y = particle.y;
    }
  }
}
