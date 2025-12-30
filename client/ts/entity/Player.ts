import { GameObject } from '../entity/GameObject';
import { GameObjectBuilder } from '../builder/GameObjectBuilder';
import { Constants } from '../utils/Constants';
import { Physics } from '../utils/Physics';
import { SocketManager } from '../manager/SocketManager';
import { SpritesheetManager } from '../manager/SpritesheetManager';

export interface PlayerPosition {
  x: number;
  y: number;
  rotation?: number;
}

export class Player {
  public x: number;
  public y: number;
  public health: number = 100; // Default player health
  public canMove: boolean = true;
  public canShoot: boolean = true;
  public isRespawning: boolean = false;
  public isMainPlayer: boolean = false;
  private previousPosition: PlayerPosition;

  public body: GameObject; // Main player body
  public legs: GameObject;
  public hitsplat: GameObject;
  public deathSoul: GameObject;
  public healthbarHeart?: GameObject; // For the main player

  // This is only needed for the mainPlayer instance to access other players
  // Will return an empty object if ever used on other instances
  private getPlayers: () => Record<string, Player>;

  private socketManager: SocketManager;
  private spritesheetManager: SpritesheetManager;

  constructor(x: number, y: number, getPlayers: () => Record<string, Player>, socketManager: SocketManager, spritesheetManager: SpritesheetManager) {
    // Utility injected by PlayerManager to get all players
    this.getPlayers = getPlayers;

    this.socketManager = socketManager;
    this.spritesheetManager = spritesheetManager;

    this.x = x;
    this.y = y;

    this.previousPosition = { x: -1, y: -1, rotation: -1 };

    const getSpritesheet = this.spritesheetManager.getSpritesheet.bind(this.spritesheetManager);

    // Initialize GameObjects using the builders
    this.body = new GameObjectBuilder(getSpritesheet)
      .withSpritesheetName("glock-stance")
      .withX(x)
      .withY(y)
      .build();

    this.legs = new GameObjectBuilder(getSpritesheet)
      .withSpritesheetName("legs-walking")
      .withX(x)
      .withY(y)
      .withIsVisible(false)
      .withRepeatTimes(1)
      .build();

    this.hitsplat = new GameObjectBuilder(getSpritesheet)
      .withSpritesheetName("glock-hitsplat")
      .withX(x)
      .withY(y)
      .withIsVisible(false)
      .withRepeatTimes(1)
      .build();

    this.deathSoul = new GameObjectBuilder(getSpritesheet)
      .withSpritesheetName("death-soul")
      .withX(x)
      .withY(y)
      .withIsVisible(false)
      .withRepeatTimes(1)
      .build();

    // Add animation event listeners for the player's body, legs, hitsplat, etc.
    this.body.addEventListener("animationcomplete", this.onAnimationComplete.bind(this));
    this.legs.addEventListener("animationcomplete", this.onLegAnimationComplete.bind(this));
    this.hitsplat.addEventListener("animationcomplete", this.onHitsplatAnimationComplete.bind(this));
    this.body.addEventListener("shotsfired", this.checkCollision.bind(this));
  }

  // Handle body animation completion
  private onAnimationComplete(data: { name: string }): void {
    const animationName = data.name;

    if (animationName === "death") {
      this.respawn();
    } else if (animationName === "glock-shoot") {
      this.canShoot = true;
    }

    this.body.resetAnimation();
  }

  // Handle leg animation completion
  private onLegAnimationComplete(): void {
    this.canMove = true;
    this.legs.isVisible = false;
    this.legs.resetAnimationRepeat(1);
  }

  // Handle hitsplat animation completion
  private onHitsplatAnimationComplete(): void {
    this.hitsplat.isVisible = false;
  }

  // Check collision for "shotsfired" event
  private checkCollision(data: { playerPos: PlayerPosition }): void {
    if (!this.isMainPlayer) return;

    const playerPos = data.playerPos;
    const rotation = this.body.rotation;
    const transformedPoint = Physics.calculateTransformedPoint(
      playerPos.x,
      playerPos.y,
      this.body.spritesheetData.spriteCenter,
      rotation
    );

    const playerX = transformedPoint.x;
    const playerY = transformedPoint.y;
    const hitboxOffsets = this.body.spritesheetData.hitboxOffsets;

    const hitboxRegion = {
      topLeft: {
        x: playerX + hitboxOffsets!.topLeft.x,
        y: playerY + hitboxOffsets!.topLeft.y,
      },
      topRight: {
        x: playerX + hitboxOffsets!.topRight.x,
        y: playerY + hitboxOffsets!.topRight.y,
      },
      bottomLeft: {
        x: playerX + hitboxOffsets!.bottomLeft.x,
        y: playerY + hitboxOffsets!.bottomLeft.y,
      },
      bottomRight: {
        x: playerX + hitboxOffsets!.bottomRight.x,
        y: playerY + hitboxOffsets!.bottomRight.y,
      },
    };

    for (const coordinate in hitboxRegion) {
      const expectedPoint = hitboxRegion[coordinate as keyof typeof hitboxRegion];
      const xyTest = Physics.rotatePoint(
        playerX,
        playerY,
        expectedPoint.x,
        expectedPoint.y,
        rotation
      );
      hitboxRegion[coordinate as keyof typeof hitboxRegion].x = xyTest.x;
      hitboxRegion[coordinate as keyof typeof hitboxRegion].y = xyTest.y;
    }

    const otherPlayers = this.getPlayers();
    for (const playerId in otherPlayers) {
      const otherPlayer = otherPlayers[playerId];
      if (
        !otherPlayer.isMainPlayer &&
        !otherPlayer.isRespawning &&
        !Physics.checkForObstacles(playerPos, otherPlayer.getPosition()) &&
        Physics.isCircleCollidingRect(otherPlayer.getPosition(), hitboxRegion)
      ) {
        this.socketManager.emit("playerHit", { playerId });
      }
    }
  }

  // Update player position
  setPosition(x: number, y: number, rotation?: number): void {
    this.body.setPosition(x, y);
    if (rotation != null) {
      this.body.setRotation(rotation);
    }
  }

  getPosition(): PlayerPosition {
    return {
      x: this.body.x,
      y: this.body.y,
      rotation: this.body.rotation,
    };
  }

  // Play walking animation
  playWalkingAnim(legRotation: number = 0): void {
    this.legs.isVisible = true;
    this.canMove = false;
    this.legs.setPosition(this.body.x, this.body.y);
    this.legs.setRotation(legRotation * Constants.TO_RADIANS);
  }

  // Move the player
  move(speedX: number | null, speedY: number | null = null, legRotation: number = 0): void {
    let newTileX: number;
    let newTileY: number;

    if (speedX != null) {
      newTileX = Math.floor((this.body.x + speedX) / 50);
    } else {
      newTileX = Math.floor(this.body.x / 50);
    }

    if (speedY != null) {
      newTileY = Math.floor((this.body.y + speedY) / 50);
    } else {
      newTileY = Math.floor(this.body.y / 50);
    }

    if (Constants.TILE_OBSTACLES[newTileY * 35 + newTileX] === 1) {
      return; // Movement blocked by an obstacle
    }

    if (speedX != null) this.body.setVelocityX(speedX);
    if (speedY != null) this.body.setVelocityY(speedY);

    this.playWalkingAnim(legRotation);

    if (this.isMainPlayer) {
      this.socketManager.emit("playerMovement", { x: this.body.x, y: this.body.y });
    }
  }

  // Trigger shoot animation
  shoot(): void {
    if (this.isMainPlayer) {
      this.socketManager.emit("shotFired");
    }

    this.body.swapSpritesheet("glock-shoot", 1);
    this.canShoot = false;
  }

  // Trigger death logic
  death(): void {
    this.health = 0;
    this.body.swapSpritesheet("death", 1);
    this.isRespawning = true;
    this.canShoot = false;
    this.canMove = false;

    this.deathSoul.setPosition(this.body.x, this.body.y);
    this.deathSoul.resetAnimationRepeat(1);
    this.deathSoul.isVisible = true;
  }

  // Respawn the player
  respawn(): void {
    const randomIndex = Math.floor(Math.random() * Constants.PLAYER_SPAWN_POINTS.length);
    const { x, y } = Constants.PLAYER_SPAWN_POINTS[randomIndex];
    this.body.setPosition(x, y);

    this.socketManager.emit("playerMoved", { x, y, isRespawning: true });
  }

  // Show hitsplat effect
  showHitsplat(): void {
    this.hitsplat.isVisible = true;
    this.hitsplat.setPosition(this.body.x, this.body.y);
    this.hitsplat.resetAnimationRepeat(1);
    this.health -= 20;

    if (this.isMainPlayer && this.healthbarHeart) {
      if (this.health >= 75) {
        this.healthbarHeart.swapSpritesheet("heartbeat-healthy");
      } else if (this.health >= 20) {
        this.healthbarHeart.swapSpritesheet("heartbeat-impacted");
      } else {
        this.healthbarHeart.swapSpritesheet("heartbeat-critical");
      }
    }
  }

  // Update player logic
  update(): void {
    this.legs.update();
    this.body.update();
    this.hitsplat.update();
    this.deathSoul.update();

    if (this.isMainPlayer && this.healthbarHeart) {
      this.healthbarHeart.update();
    }

    const currentPosition = this.getPosition();
    if (
      currentPosition.x !== this.previousPosition.x ||
      currentPosition.y !== this.previousPosition.y ||
      currentPosition.rotation !== this.previousPosition.rotation
    ) {
      if (this.isMainPlayer) {
        this.socketManager.emit("playerMovement", currentPosition);
      }

      this.previousPosition = currentPosition;
    }
  }

  // Draw the player
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.canMove) {
      this.legs.draw(ctx);
    }

    this.body.draw(ctx);
    this.hitsplat.draw(ctx);

    if (this.isRespawning) {
      this.deathSoul.draw(ctx);
    }
  }
}
