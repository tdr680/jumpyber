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
});
