import type { ObstaclePair } from "./Obstacle";

export function awardPassedObstacles(
  obstacles: ReadonlyArray<ObstaclePair>,
  playerX: number,
): number {
  let awardedPoints = 0;

  for (const obstacle of obstacles) {
    if (!obstacle.scored && obstacle.x + obstacle.width < playerX) {
      obstacle.scored = true;
      awardedPoints += 1;
    }
  }

  return awardedPoints;
}
