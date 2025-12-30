import { Spritesheet } from "../spritesheet/Spritesheet";

interface SpriteCenter {
  x: number;
  y: number;
}

interface HitboxOffsets {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export class SpritesheetBuilder {
  private spritesheetName: string | null; // Name of the spritesheet
  private spritesheetUrl: string | null; // Path/URL for the spritesheet file
  private width: number | null; // Width of each frame
  private height: number | null; // Height of each frame
  private fps: number | null; // Frames per second for animation
  private numberOfFrames: number; // Number of frames in the spritesheet
  private spriteCenter: SpriteCenter | null; // Center offset of the sprite
  private isShootingAnimation: boolean; // Whether the spritesheet is for shooting animations
  private hitboxOffsets: HitboxOffsets; // Hitbox offsets for collision detection

  constructor() {
    this.spritesheetName = null;
    this.spritesheetUrl = null;
    this.width = null;
    this.height = null;
    this.fps = null;
    this.numberOfFrames = 1; // Default is 1 frame (static image)
    this.spriteCenter = null;
    this.isShootingAnimation = false;
    this.hitboxOffsets = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
    };
  }

  public withSpritesheetName(spritesheetName: string): this {
    this.spritesheetName = spritesheetName;
    return this;
  }

  public withSpritesheetUrl(spritesheetUrl: string): this {
    this.spritesheetUrl = spritesheetUrl;
    return this;
  }

  public withWidth(width: number): this {
    this.width = width;
    return this;
  }

  public withHeight(height: number): this {
    this.height = height;
    return this;
  }

  public withFps(fps: number): this {
    this.fps = fps;
    return this;
  }

  public withNumberOfFrames(numberOfFrames: number): this {
    this.numberOfFrames = numberOfFrames;
    return this;
  }

  public withSpriteCenter(spriteCenter: SpriteCenter): this {
    this.spriteCenter = spriteCenter;
    return this;
  }

  public withIsShootingAnimation(isShootingAnimation: boolean): this {
    this.isShootingAnimation = isShootingAnimation;
    return this;
  }

  public withHitboxOffsets(hitboxOffsets: HitboxOffsets): this {
    this.hitboxOffsets = hitboxOffsets;
    return this;
  }

  public build(): Spritesheet {
    if (!this.spritesheetName || !this.spritesheetUrl || !this.width || !this.height || !this.fps || !this.spriteCenter) {
      throw new Error("All required properties must be set before building the Spritesheet.");
    }

    return new Spritesheet(
      this.spritesheetName,
      this.spritesheetUrl,
      this.width,
      this.height,
      this.fps,
      this.numberOfFrames,
      this.spriteCenter,
      this.isShootingAnimation,
      this.hitboxOffsets
    );
  }
}
