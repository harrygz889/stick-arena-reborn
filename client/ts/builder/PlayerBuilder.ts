import { Player } from "../entity/Player";
import { SocketManager } from "../manager/SocketManager";
import { SpritesheetManager } from "../manager/SpritesheetManager";

export class PlayerBuilder {
  private x: number; // The player's x-coordinate
  private y: number; // The player's y-coordinate
  private socketManager: SocketManager;
  private spritesheetManager: SpritesheetManager;
  // This is needed for the main player to access other players
  private getPlayers: () => Record<string, Player>; // Function to get all players

  constructor(socketManager: SocketManager, spritesheetManager: SpritesheetManager, getPlayers?: () => Record<string, Player>) {
    this.x = 0; // Default x-coordinate
    this.y = 0; // Default y-coordinate
    this.socketManager = socketManager;
    this.spritesheetManager = spritesheetManager;
    this.getPlayers = getPlayers ?? (() => ({})); // Default to an empty object if not provided
  }

  // Set the x-coordinate of the player and return `this` for method chaining
  public withX(x: number): this {
    this.x = x;
    return this;
  }

  // Set the y-coordinate of the player and return `this` for method chaining
  public withY(y: number): this {
    this.y = y;
    return this;
  }

  // Build method that constructs a new Player instance based on the builder's properties
  public build(): Player {
    return new Player(this.x, this.y, this.getPlayers, this.socketManager, this.spritesheetManager);
  }
}
