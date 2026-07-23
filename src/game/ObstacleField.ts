import type { GameConfig } from "../config/gameConfig";
import type { RandomSource } from "../core/random";
import type { ObstaclePair } from "./Obstacle";

type ObstacleConfig = GameConfig["obstacles"];

export class ObstacleField {
  private readonly obstaclePairs: ObstaclePair[] = [];

  public constructor(
    private readonly worldHeight: number,
    private readonly worldWidth: number,
    private readonly config: ObstacleConfig,
    private readonly randomSource: RandomSource,
  ) {
    this.reset();
  }

  public get obstacles(): ReadonlyArray<ObstaclePair> {
    return this.obstaclePairs;
  }

  public reset(): void {
    this.obstaclePairs.length = 0;

    for (let index = 0; index < this.config.poolSize; index += 1) {
      this.obstaclePairs.push({
        x:
          this.worldWidth +
          this.config.firstSpawnOffset +
          index * this.config.horizontalSpacing,
        width: this.config.width,
        gapTop: this.createGapTop(),
        gapHeight: this.config.gapHeight,
        scored: false,
      });
    }
  }

  public update(deltaSeconds: number): void {
    const distance = this.config.scrollSpeed * deltaSeconds;

    for (const obstacle of this.obstaclePairs) {
      obstacle.x -= distance;
    }
  }

  public recycleOffscreen(): void {
    for (const obstacle of this.obstaclePairs) {
      if (obstacle.x + obstacle.width >= 0) {
        continue;
      }

      const rightmostX = Math.max(
        ...this.obstaclePairs.map((candidate) => candidate.x),
      );
      obstacle.x = rightmostX + this.config.horizontalSpacing;
      obstacle.gapTop = this.createGapTop();
      obstacle.gapHeight = this.config.gapHeight;
      obstacle.width = this.config.width;
      obstacle.scored = false;
    }
  }

  private createGapTop(): number {
    const minimum = this.config.minimumTopClearance;
    const maximum =
      this.worldHeight -
      this.config.minimumBottomClearance -
      this.config.gapHeight;
    const randomValue = Math.min(1, Math.max(0, this.randomSource.next()));
    return minimum + randomValue * (maximum - minimum);
  }
}
