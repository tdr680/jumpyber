import { describe, expect, it } from "vitest";

import { gameConfig } from "../config/gameConfig";
import { getObstacleRectangles, type ObstaclePair } from "../game/Obstacle";
import {
  createObstacleSpriteAssembly,
  usesDamagedObstacleCap,
} from "../rendering/ObstacleSprite";

const obstacle: ObstaclePair = {
  worldX: 500,
  width: gameConfig.obstacles.width,
  gapHeight: gameConfig.obstacles.gapHeight,
  terrainHeight: 300,
  scored: false,
};

describe("obstacle sprite assembly", () => {
  it("derives caps and bodies from the authoritative obstacle rectangles", () => {
    const rectangles = getObstacleRectangles(
      obstacle,
      468,
      gameConfig.world.height,
    );
    const assembly = createObstacleSpriteAssembly(
      rectangles,
      obstacle.terrainHeight,
      0,
      gameConfig.terrain.passageHalfHeight,
      gameConfig.obstacleSprite,
    );

    expect(
      assembly.upper.cap.rectangle.y + assembly.upper.cap.rectangle.height,
    ).toBe(rectangles.top.y + rectangles.top.height);
    expect(assembly.lower.cap.rectangle.y).toBe(rectangles.bottom.y);
    expect(assembly.upper.body.x).toBe(rectangles.top.x);
    expect(assembly.upper.body.width).toBe(rectangles.top.width);
    expect(assembly.lower.body.x).toBe(rectangles.bottom.x);
    expect(assembly.lower.body.width).toBe(rectangles.bottom.width);
    expect(assembly.upper.body.y).toBe(rectangles.top.y);
    expect(assembly.lower.body.y + assembly.lower.body.height).toBe(
      rectangles.bottom.y + rectangles.bottom.height,
    );
    expect(assembly.upper.cap.flipVertically).toBe(true);
    expect(assembly.lower.cap.flipVertically).toBe(false);
  });

  it("attaches mirrored bases to the shared terrain passage boundaries", () => {
    const rectangles = getObstacleRectangles(
      obstacle,
      0,
      gameConfig.world.height,
    );
    const assembly = createObstacleSpriteAssembly(
      rectangles,
      obstacle.terrainHeight,
      0.2,
      gameConfig.terrain.passageHalfHeight,
      gameConfig.obstacleSprite,
    );
    const upperTerrainY =
      obstacle.terrainHeight - gameConfig.terrain.passageHalfHeight;
    const lowerTerrainY =
      obstacle.terrainHeight + gameConfig.terrain.passageHalfHeight;

    expect(assembly.upper.base.rectangle.y).toBe(upperTerrainY);
    expect(
      assembly.lower.base.rectangle.y + assembly.lower.base.rectangle.height,
    ).toBe(lowerTerrainY);
    expect(assembly.upper.base.flipVertically).toBe(true);
    expect(assembly.lower.base.flipVertically).toBe(false);
    expect(assembly.terrainAngleRadians).toBeCloseTo(Math.atan(0.2), 12);
  });

  it("varies full post lengths when the terrain-centred gap moves", () => {
    const lowerTerrainObstacle = {
      ...obstacle,
      terrainHeight: 350,
    };
    const higherTerrainObstacle = {
      ...obstacle,
      terrainHeight: 250,
    };
    const lowerTerrainAssembly = createObstacleSpriteAssembly(
      getObstacleRectangles(lowerTerrainObstacle, 0, gameConfig.world.height),
      lowerTerrainObstacle.terrainHeight,
      0,
      gameConfig.terrain.passageHalfHeight,
      gameConfig.obstacleSprite,
    );
    const higherTerrainAssembly = createObstacleSpriteAssembly(
      getObstacleRectangles(higherTerrainObstacle, 0, gameConfig.world.height),
      higherTerrainObstacle.terrainHeight,
      0,
      gameConfig.terrain.passageHalfHeight,
      gameConfig.obstacleSprite,
    );

    expect(lowerTerrainAssembly.upper.body.height).toBeGreaterThan(
      higherTerrainAssembly.upper.body.height,
    );
    expect(lowerTerrainAssembly.lower.body.height).toBeLessThan(
      higherTerrainAssembly.lower.body.height,
    );
  });

  it("uses restrained damage deterministically without changing geometry", () => {
    const interval = gameConfig.obstacleSprite.damagedCapInterval;
    const spacing = gameConfig.obstacles.horizontalSpacing;

    expect(usesDamagedObstacleCap(spacing * 3, spacing, interval)).toBe(true);
    expect(usesDamagedObstacleCap(spacing * 4, spacing, interval)).toBe(false);
    expect(usesDamagedObstacleCap(spacing * 3, spacing, interval)).toBe(true);
  });
});
