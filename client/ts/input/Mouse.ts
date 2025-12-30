import { GAME_STATES } from "../models/GameStates";
import { PlayerManager } from "../manager/PlayerManager";
import { Constants } from "../utils/Constants";

// Mouse move handler, requires the current game state
export function mouseMoveHandler(event: MouseEvent, currentState: GAME_STATES, playerManager: PlayerManager, canvas: HTMLCanvasElement): void {
  if (currentState !== GAME_STATES.IN_GAME || playerManager.mainPlayer!.isRespawning) return;

  const mouseX = event.offsetX - canvas.width / 2;
  const mouseY = event.offsetY - canvas.height / 2;

  const spriteRotation = Math.atan2(mouseY, mouseX) + (90 * Constants.TO_RADIANS);
  playerManager.mainPlayer!.body.setRotation(spriteRotation);
}

// Mouse down handler, requires the current game state
export function onMouseDown(event: MouseEvent, currentState: GAME_STATES, playerManager: PlayerManager): void {
  if (event.button !== Constants.LEFT_MOUSE_BUTTON) return;

  if (currentState === GAME_STATES.MENU) {
    // Add menu-related click logic here if needed
    return;
  }

  if (currentState === GAME_STATES.IN_GAME) {
    if (!playerManager.mainPlayer!.canShoot || playerManager.mainPlayer!.isRespawning) return;
    playerManager.mainPlayer!.shoot();
  }
}
