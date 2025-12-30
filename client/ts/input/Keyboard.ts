import { PlayerManager } from "../manager/PlayerManager";
import { GAME_STATES } from "../models/GameStates";
import { Constants } from "../utils/Constants";

// Interface for keys
interface Keys {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}

// Initialize keys object with default values
let keys: Keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

export function keyDownHandler(
  event: KeyboardEvent,
  currentState: GAME_STATES,
  playerManager: PlayerManager,
  initializeGame: () => void
): void {
  console.log('called yes')
  const pressedKey = event.key.toLowerCase();

  if (currentState === GAME_STATES.MENU) {
    if (pressedKey === "enter") {
      initializeGame();
    } else if (pressedKey === "h") {
      alert("Help:\n- Use WASD to move\n- Mouse to aim\n- Space or Click to shoot");
    }
  } else if (currentState === GAME_STATES.IN_GAME) {
    if (pressedKey === "w") keys.w = true;
    else if (pressedKey === "s") keys.s = true;
    else if (pressedKey === "a") keys.a = true;
    else if (pressedKey === "d") keys.d = true;
    else if (pressedKey === " ") {
      const mainPlayer = playerManager.mainPlayer!;
      if (!mainPlayer.canShoot || mainPlayer.isRespawning) return;
      mainPlayer.shoot();
    }
  }
}

export function keyUpHandler(event: KeyboardEvent, currentState: GAME_STATES): void {
  const pressedKey = event.key.toLowerCase();

  if (currentState === GAME_STATES.IN_GAME) {
    if (pressedKey === "w") keys.w = false;
    else if (pressedKey === "s") keys.s = false;
    else if (pressedKey === "a") keys.a = false;
    else if (pressedKey === "d") keys.d = false;
  }
}

export function onBlurHandler(): void {
  keys = {
    w: false,
    a: false,
    s: false,
    d: false
  };
}

export function keyEvents(currentState: GAME_STATES, playerManager: PlayerManager): void {
  if (currentState !== GAME_STATES.IN_GAME) return;

  const mainPlayer = playerManager.mainPlayer!;

  if (mainPlayer.isRespawning) return;

  if (keys.w && keys.d) {
    mainPlayer.move(Constants.SPEED / 1.25, -Constants.SPEED / 1.25, 45);
  } else if (keys.w && keys.a) {
    mainPlayer.move(-Constants.SPEED / 1.25, -Constants.SPEED / 1.25, 135);
  } else if (keys.s && keys.d) {
    mainPlayer.move(Constants.SPEED / 1.25, Constants.SPEED / 1.25, -45);
  } else if (keys.s && keys.a) {
    mainPlayer.move(-Constants.SPEED / 1.25, Constants.SPEED / 1.25, -315);
  } else if (keys.w) {
    mainPlayer.move(null, -Constants.SPEED, 0);
  } else if (keys.a) {
    mainPlayer.move(-Constants.SPEED, null, 90);
  } else if (keys.s) {
    mainPlayer.move(null, Constants.SPEED, 0);
  } else if (keys.d) {
    mainPlayer.move(Constants.SPEED, null, 90);
  }
}
