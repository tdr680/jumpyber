import { describe, expect, it } from "vitest";

import { gameConfig, validateGameConfig } from "../config/gameConfig";

describe("gameConfig", () => {
  it("contains a valid playable logical world", () => {
    expect(() => validateGameConfig(gameConfig)).not.toThrow();
    expect(gameConfig.world).toEqual({ width: 400, height: 600 });
  });

  it("rejects an obstacle gap that cannot fit", () => {
    const invalidConfig = {
      ...gameConfig,
      obstacles: {
        ...gameConfig.obstacles,
        gapHeight: gameConfig.world.height,
      },
    };

    expect(() => validateGameConfig(invalidConfig)).toThrow(
      "Obstacle clearances and gap do not fit inside the world.",
    );
  });

  it("documents a bounded terrain slope in dy/dx world units", () => {
    expect(gameConfig.terrain.maximumSlope).toBeGreaterThan(0);
    expect(gameConfig.terrain.minHeight).toBeLessThan(
      gameConfig.terrain.centerHeight,
    );
    expect(gameConfig.terrain.centerHeight).toBeLessThan(
      gameConfig.terrain.maxHeight,
    );
  });

  it("uses a deployment-relative six-frame player sprite", () => {
    expect(gameConfig.playerSprite.imagePath.startsWith("/")).toBe(false);
    expect(gameConfig.playerSprite.frameSize).toBe(96);
    expect(gameConfig.playerSprite.frameCount).toBe(6);
  });

  it("uses one deployment-relative normalized obstacle body tile", () => {
    expect(gameConfig.obstacleSprite.imagePath.startsWith("/")).toBe(false);
    expect(gameConfig.obstacleSprite.sourceSize).toEqual({
      width: 64,
      height: 64,
    });
    expect(gameConfig.obstacleSprite.tileHeight).toBe(64);
  });

  it("uses three ordered deployment-relative parallax sprite layers", () => {
    expect(gameConfig.background.layers).toHaveLength(3);
    expect(
      gameConfig.background.layers.map((layer) => layer.imagePath),
    ).toEqual([
      "assets/sprites/background/far-mist.png",
      "assets/sprites/background/far-skyline.png",
      "assets/sprites/background/midground-ruins.png",
    ]);
    expect(
      gameConfig.background.layers.every(
        (layer) =>
          !layer.imagePath.startsWith("/") &&
          layer.repeatMode === "repeat-x" &&
          layer.spacing === 0,
      ),
    ).toBe(true);
    expect(
      new Set(gameConfig.background.layers.map((layer) => layer.scrollFactor))
        .size,
    ).toBe(3);
  });

  it("rejects terrain-aligned gaps outside safe clearances", () => {
    const invalidConfig = {
      ...gameConfig,
      obstacles: {
        ...gameConfig.obstacles,
        gapHeight: 350,
      },
    };

    expect(() => validateGameConfig(invalidConfig)).toThrow(
      "Terrain-aligned obstacle gaps must preserve safe clearances.",
    );
  });
});
