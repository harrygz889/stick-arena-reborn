import { GameObject } from '../entity/GameObject'; // Assuming GameObject exists
import { Spritesheet } from '../spritesheet/Spritesheet';
import { GameObjectConfig } from '../utils/GameTypes'; // Import GameObjectConfig

export class GameObjectBuilder {
  private config: GameObjectConfig; // The configuration object

  // Initialize with default values
  constructor(getSpritesheet: (name: string) => Spritesheet) {
    this.config = {
      spritesheetName: null,
      x: 0,
      y: 0,
      isVisible: true,
      repeatTimes: -1,
      getSpritesheet: getSpritesheet
    };
  }

  public withSpritesheetName(spritesheetName: string): this {
    this.config.spritesheetName = spritesheetName;
    return this;
  }

  public withX(x: number): this {
    this.config.x = x;
    return this;
  }

  public withY(y: number): this {
    this.config.y = y;
    return this;
  }

  public withIsVisible(isVisible: boolean): this {
    this.config.isVisible = isVisible;
    return this;
  }

  public withRepeatTimes(repeatTimes: number): this {
    this.config.repeatTimes = repeatTimes;
    return this;
  }

  public build(): GameObject {
    // Validate config props before initializing
    if (!this.config.spritesheetName) {
      throw new Error('GameObjectBuilder: spritesheetName must be set before building.');
    }

    // Return the constructed GameObject
    return new GameObject(
      this.config.spritesheetName,
      this.config.x,
      this.config.y,
      this.config.isVisible,
      this.config.repeatTimes,
      this.config.getSpritesheet
    );
  }
}
