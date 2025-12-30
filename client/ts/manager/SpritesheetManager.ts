import { Constants, SpriteDefinition } from "../utils/Constants";
import { SpritesheetBuilder } from "../builder/SpritesheetBuilder";
import { Spritesheet } from "../spritesheet/Spritesheet";

export class SpritesheetManager {
  private spritesheets: Record<string, Spritesheet>;

  constructor() {
    this.spritesheets = {};
    this.loadSpritesheets();
  }

  private loadSpritesheets(): void {
    for (const spriteName in Constants.SPRITE_DEFINITIONS) {
      const sprite: SpriteDefinition = Constants.SPRITE_DEFINITIONS[spriteName];
      const spritesheetBuilder = new SpritesheetBuilder()
        .withSpritesheetName(spriteName)
        .withSpritesheetUrl(sprite.spritesheetUrl)
        .withWidth(sprite.width)
        .withHeight(sprite.height)
        .withFps(sprite.fps)
        .withNumberOfFrames(sprite.numberOfFrames)
        .withSpriteCenter(sprite.spriteCenter);

      if (sprite.isShootingAnimation) {
        spritesheetBuilder.withIsShootingAnimation(sprite.isShootingAnimation);
      }

      if (sprite.hitboxOffsets) {
        spritesheetBuilder.withHitboxOffsets(sprite.hitboxOffsets);
      }

      this.addSpritesheet(spriteName, spritesheetBuilder.build());
    }
  }

  public addSpritesheet(name: string, spritesheet: Spritesheet): void {
    this.spritesheets[name] = spritesheet;
  }

  public getSpritesheet(name: string): Spritesheet {
    return this.spritesheets[name];
  }

  public updateSpritesheet(name: string, spritesheet: Spritesheet): void {
    this.spritesheets[name] = spritesheet;
  }
}
