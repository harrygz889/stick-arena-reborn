// Import dependencies
import { Constants } from "./utils/Constants";
import { mouseMoveHandler, onMouseDown } from "./input/Mouse";
import { keyDownHandler, keyUpHandler, onBlurHandler, keyEvents } from "./input/Keyboard";
import { PlayerManager } from "./manager/PlayerManager";
import { Camera } from "./viewport/Camera";
import { GAME_STATES } from "./models/GameStates";
import { SocketManager } from "./manager/SocketManager";
import { initSocketHandlers } from "./handler/PlayerHandler";
import { SpritesheetManager } from "./manager/SpritesheetManager";

// Canvas and Context Types
const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

// Scaling factor for game rendering
let scaleFactor: number = Math.min(canvas.width / 800, canvas.height / 600);

// Tilemap and game state
const tilemap: string[] = Constants.TILEMAP;
const gameMap: HTMLImageElement = new Image();
gameMap.src = "sprites/maps/open-space.png";

let tiles: Record<string, HTMLImageElement> = {};

let currentState: GAME_STATES = GAME_STATES.MENU;


// Init player manager, camera manager, socket manager, and spritesheet manager singletons
const spritesheetManager = new SpritesheetManager();
const camera: Camera = new Camera(scaleFactor, canvas);
const socketManager: SocketManager = new SocketManager();
const playerManager: PlayerManager = new PlayerManager(camera, socketManager, spritesheetManager);

// Initialize socket event handlers for player management
initSocketHandlers(socketManager, playerManager, spritesheetManager);

// Draw the game menu
function drawMenu(): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset canvas transformations
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

  // Background fill for the menu
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Menu text
  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";

  // Title
  ctx.fillText("The Finals Ballistic (version 0.1)", canvas.width / 2, canvas.height / 3);

  // Options
  ctx.font = "32px Arial";
  ctx.fillText("Press 'Enter' to Start", canvas.width / 2, canvas.height / 2);
  ctx.fillText("Press 'H' for Help", canvas.width / 2, canvas.height / 2 + 50);
}

// Draw the tilemap on the canvas
function drawMap(): void {
  const tileSize = 50;
  const mapWidth = 35;
  const mapHeight = 24;

  const startX = Math.max(0, Math.floor(camera.x / (tileSize * scaleFactor)));
  const startY = Math.max(0, Math.floor(camera.y / (tileSize * scaleFactor)));

  const endX = Math.min(mapWidth, startX + Math.ceil(canvas.width / (tileSize * scaleFactor)) + 1);
  const endY = Math.min(mapHeight, startY + Math.ceil(canvas.height / (tileSize * scaleFactor)) + 1);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const tile = tilemap[y * mapWidth + x];
      ctx.drawImage(tiles[tile], x * tileSize, y * tileSize, tileSize * scaleFactor, tileSize * scaleFactor);
    }
  }
}

// Draw the player's health bar
function drawHealthBar(): void {
  const x = 50;
  const y = 15;
  const width = 100;
  const height = 20;
  const health: number = playerManager.mainPlayer!.health || 0;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  playerManager.mainPlayer!.healthbarHeart!.draw(ctx);
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, health, height);
  ctx.fillStyle = "black";
  ctx.fillRect(health + x, y, width - health, height);
  ctx.restore();
}

// Draw the HUD (health bar and other UI elements)
function drawHUD(): void {
  drawHealthBar();
}

// Update game logic
function update(): void {
  playerManager.updatePlayers();
}

// Draw the game frame
function draw(): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transforms
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.translate(-camera.x, -camera.y); // Apply camera transformations
  ctx.scale(scaleFactor, scaleFactor);

  drawMap();
  drawHUD();

  playerManager.drawPlayers(ctx);
}

// Main game loop
function loop(): void {
  if (currentState === GAME_STATES.MENU) {
    drawMenu();
  } else if (currentState === GAME_STATES.IN_GAME) {
    update();
    draw();
    keyEvents(currentState, playerManager); // Trigger key events
  }

  requestAnimationFrame(loop);
}

// Load tile images
function loadTiles(): void {
  for (const tileIndex in tilemap) {
    const rawTile = tilemap[tileIndex];
    const tileImg = new Image();
    tileImg.src = `sprites/maps/xgenhq/${rawTile}.png`;
    tiles[rawTile] = tileImg;
  }
}

// Initialize the game
function initializeGame(): void {
  console.log('Initializing game...');
  playerManager.createMainPlayer();
  loadTiles();
  currentState = GAME_STATES.IN_GAME;
}

// Event listeners for user input
document.addEventListener("keydown", (event) => keyDownHandler(event, currentState, playerManager, initializeGame), false);
document.addEventListener("keyup", (event) => keyUpHandler(event, currentState), false);
document.addEventListener("blur", onBlurHandler);
canvas.addEventListener("mousemove", (event) => mouseMoveHandler(event, currentState, playerManager, canvas), false);
canvas.addEventListener("mousedown", (event) => onMouseDown(event, currentState, playerManager), false);

// Observe canvas resizing for scaling factor adjustments
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "width" || mutation.attributeName === "height") {
      scaleFactor = Math.min(canvas.width / 800, canvas.height / 600);
    }
  });
});

observer.observe(canvas, { attributes: true });

// Start the game loop
loop();
