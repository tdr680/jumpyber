import { describe, expect, it } from "vitest";

import type { ObstaclePair } from "../game/Obstacle";
import { awardPassedObstacles } from "../game/Score";

function obstacleAt(x: number): ObstaclePair {
  return {
    x,
    width: 64,
    gapTop: 100,
    gapHeight: 155,
    scored: false,
  };
}

describe("awardPassedObstacles", () => {
  it("awards when the trailing edge passes the player", () => {
    const obstacle = obstacleAt(45);

    expect(awardPassedObstacles([obstacle], 110)).toBe(1);
    expect(obstacle.scored).toBe(true);
  });

  it("does not award at the line or before it", () => {
    expect(awardPassedObstacles([obstacleAt(46)], 110)).toBe(0);
    expect(awardPassedObstacles([obstacleAt(100)], 110)).toBe(0);
  });

  it("awards each obstacle only once", () => {
    const obstacle = obstacleAt(45);

    expect(awardPassedObstacles([obstacle], 110)).toBe(1);
    expect(awardPassedObstacles([obstacle], 110)).toBe(0);
  });
});
