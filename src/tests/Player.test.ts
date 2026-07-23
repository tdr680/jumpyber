import { describe, expect, it } from "vitest";

import { gameConfig } from "../config/gameConfig";
import {
  createPlayer,
  jumpPlayer,
  resetPlayer,
  updatePlayer,
} from "../game/Player";

describe("player physics", () => {
  it("applies gravity and integrates position using elapsed seconds", () => {
    const player = createPlayer(gameConfig.player);

    updatePlayer(player, 0.1, gameConfig.player);

    expect(player.velocityY).toBe(150);
    expect(player.y).toBe(315);
  });

  it("sets jump velocity immediately", () => {
    const player = createPlayer(gameConfig.player);

    jumpPlayer(player, gameConfig.player);

    expect(player.velocityY).toBe(-460);
  });

  it("clamps maximum fall velocity", () => {
    const player = createPlayer(gameConfig.player);

    player.velocityY = 790;
    updatePlayer(player, 0.1, gameConfig.player);

    expect(player.velocityY).toBe(800);
    expect(player.y).toBe(380);
  });

  it("resets every player field", () => {
    const player = createPlayer(gameConfig.player);
    player.x = 1;
    player.y = 2;
    player.velocityY = 3;
    player.radius = 4;

    resetPlayer(player, gameConfig.player);

    expect(player).toEqual({
      x: 110,
      y: 300,
      velocityY: 0,
      radius: 16,
    });
  });
});
