import { describe, expect, it } from "vitest";

import { gameConfig } from "../config/gameConfig";
import { getObstacleRectangles } from "../game/Obstacle";
import { ObstacleField } from "../game/ObstacleField";
import { awardPassedObstacles } from "../game/Score";
import { TerrainProfile } from "../game/terrain/TerrainProfile";

function createField(): {
  readonly field: ObstacleField;
  readonly terrain: TerrainProfile;
} {
  const terrain = new TerrainProfile(gameConfig.terrain);
  return {
    field: new ObstacleField(
      gameConfig.world.width,
      gameConfig.obstacles,
      terrain,
    ),
    terrain,
  };
}

describe("ObstacleField", () => {
  it("creates a fixed-size, evenly spaced world-space obstacle pool", () => {
    const { field } = createField();

    expect(field.obstacles).toHaveLength(3);
    expect(field.obstacles.map(({ worldX }) => worldX)).toEqual([
      500, 720, 940,
    ]);
  });

  it("uses the shared terrain sample as each gap centre", () => {
    const { field, terrain } = createField();

    for (const obstacle of field.obstacles) {
      expect(obstacle.terrainHeight).toBe(
        terrain.sampleAt(obstacle.worldX + obstacle.width / 2).height,
      );
      const rectangles = getObstacleRectangles(
        obstacle,
        0,
        gameConfig.world.height,
      );
      expect((rectangles.top.height + rectangles.bottom.y) / 2).toBeCloseTo(
        obstacle.terrainHeight,
        10,
      );
    }
  });

  it("projects world positions using elapsed-distance scrolling", () => {
    const { field } = createField();
    const distance = gameConfig.obstacles.scrollSpeed * 0.1;

    expect(
      field.obstacles.map(
        (obstacle) =>
          getObstacleRectangles(obstacle, distance, gameConfig.world.height).top
            .x,
      ),
    ).toEqual([483, 703, 923]);
  });

  it("recycles offscreen obstacles without growing the pool", () => {
    const { field, terrain } = createField();
    const worldDistance = gameConfig.obstacles.scrollSpeed * 4;

    field.recycleOffscreen(worldDistance);

    expect(field.obstacles).toHaveLength(3);
    expect(field.obstacles.map(({ worldX }) => worldX)).toEqual([
      1160, 720, 940,
    ]);
    expect(
      field.obstacles.map((obstacle) => obstacle.worldX - worldDistance),
    ).toEqual([480, 40, 260]);
    expect(field.obstacles.every(({ scored }) => !scored)).toBe(true);
    expect(field.obstacles[0]?.terrainHeight).toBe(
      terrain.sampleAt(1192).height,
    );
  });

  it("clears the scored flag only on the recycled obstacle", () => {
    const { field } = createField();
    const worldDistance = gameConfig.obstacles.scrollSpeed * 4;

    expect(
      awardPassedObstacles(
        field.obstacles,
        worldDistance + gameConfig.player.x,
      ),
    ).toBe(2);
    field.recycleOffscreen(worldDistance);

    expect(field.obstacles[0]?.scored).toBe(false);
    expect(field.obstacles[1]?.scored).toBe(true);
  });

  it("keeps terrain-aligned gaps inside safe clearances on slopes", () => {
    const { field } = createField();

    for (
      let worldDistance = 0;
      worldDistance <= 50_000;
      worldDistance += gameConfig.obstacles.horizontalSpacing
    ) {
      field.recycleOffscreen(worldDistance);
      for (const obstacle of field.obstacles) {
        const rectangles = getObstacleRectangles(
          obstacle,
          worldDistance,
          gameConfig.world.height,
        );
        expect(rectangles.top.height).toBeGreaterThanOrEqual(
          gameConfig.obstacles.minimumTopClearance,
        );
        expect(rectangles.bottom.height).toBeGreaterThanOrEqual(
          gameConfig.obstacles.minimumBottomClearance,
        );
      }
    }
  });
});
