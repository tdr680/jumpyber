import { describe, expect, it } from "vitest";

import { gameConfig } from "../config/gameConfig";
import type { RandomSource } from "../core/random";
import { ObstacleField } from "../game/ObstacleField";
import { awardPassedObstacles } from "../game/Score";

class ScriptedRandomSource implements RandomSource {
  private index = 0;

  public constructor(private readonly values: readonly number[]) {}

  public next(): number {
    const value = this.values[this.index % this.values.length];
    this.index += 1;
    return value ?? 0;
  }
}

function createField(values: readonly number[]): ObstacleField {
  return new ObstacleField(
    gameConfig.world.height,
    gameConfig.world.width,
    gameConfig.obstacles,
    new ScriptedRandomSource(values),
  );
}

describe("ObstacleField", () => {
  it("creates a fixed-size, evenly spaced obstacle pool", () => {
    const field = createField([0.5]);

    expect(field.obstacles).toHaveLength(3);
    expect(field.obstacles.map(({ x }) => x)).toEqual([500, 720, 940]);
  });

  it("maps scripted randomness into safe gap bounds", () => {
    const field = createField([0, 1, 0.5]);

    expect(field.obstacles.map(({ gapTop }) => gapTop)).toEqual([
      60, 365, 212.5,
    ]);
  });

  it("moves obstacles by speed multiplied by elapsed seconds", () => {
    const field = createField([0.5]);

    field.update(0.1);

    expect(field.obstacles.map(({ x }) => x)).toEqual([483, 703, 923]);
  });

  it("recycles offscreen obstacles without growing the pool", () => {
    const field = createField([0.5]);

    field.update(4);
    field.recycleOffscreen();

    expect(field.obstacles).toHaveLength(3);
    expect(field.obstacles.map(({ x }) => x)).toEqual([480, 40, 260]);
    expect(field.obstacles.every(({ scored }) => !scored)).toBe(true);
  });

  it("clears the scored flag only on the recycled obstacle", () => {
    const field = createField([0.5]);

    field.update(4);
    expect(awardPassedObstacles(field.obstacles, 110)).toBe(2);
    field.recycleOffscreen();

    expect(field.obstacles[0]?.scored).toBe(false);
    expect(field.obstacles[1]?.scored).toBe(true);
  });
});
