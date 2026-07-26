import type { ObstaclePair } from "./Obstacle";

export function awardPassedObstacles(
  obstacles: ReadonlyArray<ObstaclePair>,
  playerWorldX: number,
): number {
  let awardedPoints = 0;

  for (const obstacle of obstacles) {
    if (!obstacle.scored && obstacle.worldX + obstacle.width < playerWorldX) {
      obstacle.scored = true;
      awardedPoints += 1;
    }
  }

  return awardedPoints;
}
