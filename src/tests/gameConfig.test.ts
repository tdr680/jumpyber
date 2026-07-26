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
