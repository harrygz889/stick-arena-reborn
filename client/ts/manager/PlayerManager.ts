import { Constants } from "../utils/Constants";
import { Player } from "../entity/Player";
import { GameObjectBuilder } from "../builder/GameObjectBuilder";
import { PlayerBuilder } from "../builder/PlayerBuilder";
import { Camera } from "../viewport/Camera";
import { SocketManager } from "./SocketManager";
import { SpritesheetManager } from "./SpritesheetManager";

export class PlayerManager {
  private players: Record<string, Player>; // Map of player IDs to Player instances
  public mainPlayer: Player | null; // The main player instance
  private camera: Camera; // Camera instance to track the main player
  private socketManager: SocketManager;
  private spritesheetManager: SpritesheetManager;

  constructor(camera: Camera, socketManager: SocketManager, spritesheetManager: SpritesheetManager) {
    this.players = {};
    this.mainPlayer = null;
    this.camera = camera;
    this.socketManager = socketManager;
    this.spritesheetManager = spritesheetManager;
  }

  // Create the main player
  public createMainPlayer(): void {
    const getSpritesheet = this.spritesheetManager.getSpritesheet.bind(this.spritesheetManager);
    const randomIndex = Math.floor(Math.random() * Constants.PLAYER_SPAWN_POINTS.length);
    const { x, y } = Constants.PLAYER_SPAWN_POINTS[randomIndex];

    // Create the main player with default position, and pass a function to get all players
    this.mainPlayer = new PlayerBuilder(this.socketManager, this.spritesheetManager, () => this.players)
      .withX(x)
      .withY(y)
      .build();

    this.mainPlayer!.isMainPlayer = true;

    // Create the main player's health bar
    this.mainPlayer!.healthbarHeart = new GameObjectBuilder(getSpritesheet)
      .withSpritesheetName("heartbeat-healthy")
      .withX(30)
      .withY(25)
      .withIsVisible(true)
      .build();

    // Notify the server of the new player position
    this.socketManager.emit("playerMoved", { x, y });
  }

  // Retrieve a specific player by ID
  public getPlayer(id: string): Player | undefined {
    return this.players[id];
  }

  // Retrieve all players
  public getPlayers(): Record<string, Player> {
    return this.players;
  }

  // Add a player to the player map
  public addPlayer(id: string, player: Player): void {
    this.players[id] = player;
  }

  // Remove a player from the player map
  public removePlayer(id: string): void {
    delete this.players[id];
  }

  // Update all players' states
  public updatePlayers(): void {
    if (this.mainPlayer) {
      this.mainPlayer.update();
      this.camera.setPos(this.mainPlayer.body); // Update the camera to follow main player
    }

    // Update other players
    for (const id in this.players) {
      this.players[id].update();
    }
  }

  // Draw all players on the canvas
  public drawPlayers(ctx: CanvasRenderingContext2D): void {
    // Draw non-main players
    for (const id in this.players) {
      this.players[id].draw(ctx);
    }

    // Draw the main player
    if (this.mainPlayer) {
      this.mainPlayer.draw(ctx);
    }
  }
}


