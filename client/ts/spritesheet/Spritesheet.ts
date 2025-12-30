export interface HitboxOffsets {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export interface SpriteCenter {
  x: number;
  y: number;
}

export class Spritesheet {
  public spritesheetName: string; // Name of the spritesheet
  public spritesheet: HTMLImageElement; // The loaded image for the spritesheet
  public width: number; // Width of the entire spritesheet
  public height: number; // Height of the spritesheet
  public fps: number; // Frames per second of the animation
  public timePerFrame: number; // Duration of each frame in milliseconds
  public numberOfFrames: number; // Total number of frames within the spritesheet
  public spriteCenter: SpriteCenter; // Center point of the sprite (for transformations)
  public isShootingAnimation: boolean; // Whether this is a shooting animation
  public hitboxIndex: number; // Specific frame used for hitbox collision
  public hitboxOffsets: HitboxOffsets; // Offsets for hitbox collision detection

  constructor(
    spritesheetName: string,
    spritesheetUrl: string,
    width: number,
    height: number,
    fps: number,
    numberOfFrames: number,
    spriteCenter: SpriteCenter,
    isShootingAnimation: boolean = false,
    hitboxOffsets: HitboxOffsets = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
    }
  ) {
    this.spritesheetName = spritesheetName; // Name of the spritesheet, e.g., "player-frame1"
    this.spritesheet = new Image(); // Load the image as an HTML5 Image object
    this.spritesheet.src = spritesheetUrl; // URL to the image file
    this.width = width * numberOfFrames; // Total width of the spritesheet (all frames combined)
    this.height = height; // Height of the spritesheet
    this.fps = fps; // Frames per second for animation playback
    this.timePerFrame = 1000 / fps; // Duration of each frame in milliseconds (e.g., 33ms for 30fps)
    this.numberOfFrames = numberOfFrames || 1; // Total number of frames (default is 1)
    this.spriteCenter = spriteCenter; // Center offset for the sprite
    this.isShootingAnimation = isShootingAnimation; // Shooting-specific animation flag
    this.hitboxIndex = 0; // Frame used for collision detection (default: first frame)
    this.hitboxOffsets = hitboxOffsets; // Hitbox offsets for collision detection
  }
}
