import type { GameState as GameStateValue } from "../app/GameState";
import type { GameConfig } from "../config/gameConfig";

export const PLAYER_SPRITE_FRAME_NAMES = [
  "ready",
  "jump",
  "rise",
  "apex",
  "fall",
  "hit",
] as const;

export type PlayerSpriteFrame = (typeof PLAYER_SPRITE_FRAME_NAMES)[number];

type PlayerSpriteConfig = GameConfig["playerSprite"];

export function selectPlayerSpriteFrame(
  state: GameStateValue,
  velocityY: number,
  config: PlayerSpriteConfig,
): PlayerSpriteFrame {
  if (state === "ready") {
    return "ready";
  }

  if (state === "gameOver") {
    return "hit";
  }

  if (velocityY <= config.jumpVelocityThreshold) {
    return "jump";
  }

  if (velocityY < -config.apexSpeedThreshold) {
    return "rise";
  }

  if (velocityY <= config.apexSpeedThreshold) {
    return "apex";
  }

  return "fall";
}

export function getPlayerSpriteFrameIndex(frame: PlayerSpriteFrame): number {
  return PLAYER_SPRITE_FRAME_NAMES.indexOf(frame);
}
