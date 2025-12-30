import { PlayerBuilder } from "../builder/PlayerBuilder";
import { PlayerManager } from "../manager/PlayerManager";
import { SocketManager } from "../manager/SocketManager";
import { SpritesheetManager } from "../manager/SpritesheetManager";

export const initSocketHandlers = (socketManager: SocketManager, playerManager: PlayerManager, spritesheetManager: SpritesheetManager): void => {

  // Listen for all server-to-client events
  socketManager.on("currentPlayers", (players: Record<string, { position: { x: number; y: number; rotation?: number } }>) => {
    for (const playerId in players) {
      // Skip the current main player
      if (playerId === socketManager["socket"].id) continue;

      const playerInfo = players[playerId].position;

      // Create a new player
      const player = new PlayerBuilder(socketManager, spritesheetManager)
        .withX(playerInfo.x)
        .withY(playerInfo.y)
        .build();

      // Add the player to the PlayerManager
      playerManager.addPlayer(playerId, player);
    }
  });

  socketManager.on("newPlayer", (playerId: string) => {
    // Create a placeholder player until their position is updated
    const player = new PlayerBuilder(socketManager, spritesheetManager)
      .withX(-10)
      .withY(-10)
      .build();

    // Add the new player
    playerManager.addPlayer(playerId, player);
  });

  socketManager.on("playerDisconnected", (playerId: string) => {
    // Remove the player from PlayerManager
    playerManager.removePlayer(playerId);
  });

  socketManager.on("playWalkingAnimation", (data: { playerId: string; rotation: number }) => {
    const { playerId, rotation } = data;

    const player = playerManager.getPlayer(playerId);
    if (!player) return;

    // Play the walking animation for the specified player
    player.playWalkingAnim(rotation);
  });

  socketManager.on("playerMoved", (data: { playerId: string; playerPos: { x: number; y: number; rotation?: number } }) => {
    const { playerId, playerPos } = data;

    const player = playerManager.getPlayer(playerId);
    if (!player) return;

    // Update the position of the specified player
    player.setPosition(playerPos.x, playerPos.y, playerPos.rotation);
  });

  socketManager.on("playShoot", (data: { playerId: string }) => {
    const { playerId } = data;

    const player = playerManager.getPlayer(playerId);
    if (!player) return;

    // Trigger the shooting animation
    player.shoot();
  });

  socketManager.on("playerGotHit", (data: { playerId: string }) => {
    const { playerId } = data;

    let player = playerManager.getPlayer(playerId);
    if (!player) {
      player = playerManager.mainPlayer!;
    }

    // Trigger the hitsplat animation for the hit player
    player.showHitsplat();
  });

  socketManager.on("playerDied", (data: { playerId: string }) => {
    const { playerId } = data;

    let player = playerManager.getPlayer(playerId);
    if (!player) {
      player = playerManager.mainPlayer!;
    }

    // Handle the player death animation or logic
    player.death();
  });
}
