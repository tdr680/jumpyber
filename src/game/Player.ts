import type { GameConfig } from "../config/gameConfig";

export interface PlayerState {
  x: number;
  y: number;
  velocityY: number;
  radius: number;
}

type PlayerConfig = GameConfig["player"];

export function createPlayer(config: PlayerConfig): PlayerState {
  return {
    x: config.x,
    y: config.startY,
    velocityY: 0,
    radius: config.radius,
  };
}

export function resetPlayer(player: PlayerState, config: PlayerConfig): void {
  player.x = config.x;
  player.y = config.startY;
  player.velocityY = 0;
  player.radius = config.radius;
}

export function jumpPlayer(player: PlayerState, config: PlayerConfig): void {
  player.velocityY = config.jumpVelocity;
}

export function updatePlayer(
  player: PlayerState,
  deltaSeconds: number,
  config: PlayerConfig,
): void {
  player.velocityY = Math.min(
    player.velocityY + config.gravity * deltaSeconds,
    config.maxFallVelocity,
  );
  player.y += player.velocityY * deltaSeconds;
}
