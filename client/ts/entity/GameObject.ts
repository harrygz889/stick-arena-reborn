import { Spritesheet } from "../spritesheet/Spritesheet";
import { GameObjectEventListener } from "../utils/GameTypes";

export class GameObject {
  // Properties
  public spritesheetData: Spritesheet; // Contains spritesheet info
  public x: number;                          // Current x-coordinate
  public y: number;                          // Current y-coordinate
  public rotation: number = 0;               // Rotation (radians)
  public isVisible: boolean;                 // Whether the object is drawn
  private frameIndex: number = 0;            // Current frame in the animation
  private repeatTimes: number;               // Remaining animation repeats (-1 = infinite)
  private listeners: { [key: string]: GameObjectEventListener[] } = {}; // Event listeners
  private lastUpdated: number = Date.now();  // Last frame update time
  private spritesheetSnapshot: string;       // Stores original spritesheet (for resets)
  private getSpritesheet: (name: string) => Spritesheet;

  constructor(
    spritesheetName: string,
    x: number,
    y: number,
    isVisible: boolean = true,
    repeatTimes: number = -1,
    getSpritesheet: (name: string) => Spritesheet
  ) {
    this.spritesheetData = getSpritesheet(spritesheetName);
    this.x = x;
    this.y = y;
    this.isVisible = isVisible;
    this.repeatTimes = repeatTimes;
    this.spritesheetSnapshot = spritesheetName; // Backup for sprite resets
    this.getSpritesheet = getSpritesheet;
  }

  // Methods

  setPosition(newX: number, newY: number): void {
    this.x = newX;
    this.y = newY;
  }

  setVelocityX(speed: number): void {
    this.x += speed;
  }

  setVelocityY(speed: number): void {
    this.y += speed;
  }

  setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  resetAnimationRepeat(numTimes: number): void {
    this.frameIndex = -1;
    this.repeatTimes = numTimes;
  }

  swapSpritesheet(spritesheetName: string, repeatNumTimes: number = -1): void {
    this.spritesheetData = this.getSpritesheet(spritesheetName);
    if (repeatNumTimes > 0) this.resetAnimationRepeat(repeatNumTimes);
  }

  resetAnimation(): void {
    this.swapSpritesheet(this.spritesheetSnapshot);
  }

  update(): void {
    if (!this.isVisible || (this.repeatTimes !== -1 && this.repeatTimes <= 0)) return;

    const now = Date.now();
    if (now - this.lastUpdated >= this.spritesheetData.timePerFrame) {
      // Check for hitbox collision
      if (
        this.frameIndex === this.spritesheetData.hitboxIndex &&
        this.spritesheetData.isShootingAnimation
      ) {
        this.dispatchEvent("shotsfired", { playerPos: { x: this.x, y: this.y } });
      }

      // Update frame index
      this.frameIndex++;
      if (this.frameIndex >= this.spritesheetData.numberOfFrames) {
        this.frameIndex = 0; // Loop animation
        if (this.repeatTimes > 0) this.repeatTimes--;

        // Trigger completion event for animations
        if (this.repeatTimes === 0) {
          this.dispatchEvent("animationcomplete", { name: this.spritesheetData.spritesheetName });
        }
      }
      this.lastUpdated = now; // Update timestamp
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isVisible) return;

    ctx.save();
    ctx.translate(this.x, this.y); // Move to object position
    ctx.rotate(this.rotation); // Apply rotation

    ctx.drawImage(
      this.spritesheetData.spritesheet,
      (this.frameIndex * this.spritesheetData.width) / this.spritesheetData.numberOfFrames,
      0,
      this.spritesheetData.width / this.spritesheetData.numberOfFrames,
      this.spritesheetData.height,
      -this.spritesheetData.spriteCenter.x,
      -this.spritesheetData.spriteCenter.y,
      this.spritesheetData.width / this.spritesheetData.numberOfFrames,
      this.spritesheetData.height
    );

    ctx.restore();
  }

  // Event Listener Methods
  addEventListener(eventName: string, callback: GameObjectEventListener): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  removeEventListener(eventName: string, callback: GameObjectEventListener): void {
    const callbacks = this.listeners[eventName];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  dispatchEvent(eventName: string, data: any = null): void {
    const callbacks = this.listeners[eventName];
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}
