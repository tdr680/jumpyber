import { describe, expect, it } from "vitest";

import { gameConfig } from "../config/gameConfig";
import {
  getPlayerSpriteFrameIndex,
  PLAYER_SPRITE_FRAME_NAMES,
  selectPlayerSpriteFrame,
} from "../rendering/PlayerSprite";

describe("player sprite frames", () => {
  it("keeps metadata order stable", () => {
    expect(PLAYER_SPRITE_FRAME_NAMES).toEqual([
      "ready",
      "jump",
      "rise",
      "apex",
      "fall",
      "hit",
    ]);
    expect(PLAYER_SPRITE_FRAME_NAMES.map(getPlayerSpriteFrameIndex)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
  });

  it("uses state-specific ready and hit frames", () => {
    expect(selectPlayerSpriteFrame("ready", 800, gameConfig.playerSprite)).toBe(
      "ready",
    );
    expect(
      selectPlayerSpriteFrame("gameOver", -460, gameConfig.playerSprite),
    ).toBe("hit");
  });

  it("maps broad velocity bands without rise/apex/fall overlap", () => {
    expect(
      selectPlayerSpriteFrame("playing", -460, gameConfig.playerSprite),
    ).toBe("jump");
    expect(
      selectPlayerSpriteFrame("playing", -200, gameConfig.playerSprite),
    ).toBe("rise");
    expect(
      selectPlayerSpriteFrame("playing", -75, gameConfig.playerSprite),
    ).toBe("apex");
    expect(
      selectPlayerSpriteFrame("playing", 75, gameConfig.playerSprite),
    ).toBe("apex");
    expect(
      selectPlayerSpriteFrame("playing", 200, gameConfig.playerSprite),
    ).toBe("fall");
  });
});
