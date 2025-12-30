export class Camera {
  public x: number; // X position of the camera
  public y: number; // Y position of the camera
  private scaleFactor: number;
  private canvas: HTMLCanvasElement;

  constructor(scaleFactor: number, canvas: HTMLCanvasElement) {
    this.x = 0; // Default X coordinate
    this.y = 0; // Default Y coordinate
    this.scaleFactor = scaleFactor;
    this.canvas = canvas;
  }

  /**
   * Update the camera position to follow the player (or GameObject)
   * @param player - The GameObject representing the player's position
   * @param canvasWidth - Width of the game canvas
   * @param canvasHeight - Height of the game canvas
   * @param scaleFactor - The scaling factor of the game world
   */
  public setPos(object: { x: number; y: number }): void {
    this.x = object.x * this.scaleFactor - this.canvas.width / 2;
    this.y = object.y * this.scaleFactor - this.canvas.height / 2;
  }
}
