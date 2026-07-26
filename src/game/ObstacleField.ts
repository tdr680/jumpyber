import type { GameConfig } from "../config/gameConfig";
import type { ObstaclePair } from "./Obstacle";
import type { TerrainSampler } from "./terrain/TerrainTypes";

type ObstacleConfig = GameConfig["obstacles"];

export class ObstacleField {
  private readonly obstaclePairs: ObstaclePair[] = [];

  public constructor(
    private readonly worldWidth: number,
    private readonly config: ObstacleConfig,
    private readonly terrain: TerrainSampler,
  ) {
    this.reset();
  }

  public get obstacles(): ReadonlyArray<ObstaclePair> {
    return this.obstaclePairs;
  }

  public reset(): void {
    this.obstaclePairs.length = 0;

    for (let index = 0; index < this.config.poolSize; index += 1) {
      this.obstaclePairs.push(
        this.createObstacle(
          this.worldWidth +
            this.config.firstSpawnOffset +
            index * this.config.horizontalSpacing,
        ),
      );
    }
  }

  public recycleOffscreen(worldDistance: number): void {
    for (const obstacle of this.obstaclePairs) {
      if (obstacle.worldX + obstacle.width >= worldDistance) {
        continue;
      }

      const rightmostWorldX = Math.max(
        ...this.obstaclePairs.map((candidate) => candidate.worldX),
      );
      obstacle.worldX = rightmostWorldX + this.config.horizontalSpacing;
      obstacle.gapHeight = this.config.gapHeight;
      obstacle.width = this.config.width;
      obstacle.terrainHeight = this.sampleObstacleHeight(obstacle.worldX);
      obstacle.scored = false;
    }
  }

  private createObstacle(worldX: number): ObstaclePair {
    return {
      worldX,
      width: this.config.width,
      gapHeight: this.config.gapHeight,
      terrainHeight: this.sampleObstacleHeight(worldX),
      scored: false,
    };
  }

  private sampleObstacleHeight(worldX: number): number {
    return this.terrain.sampleAt(worldX + this.config.width / 2).height;
  }
}
