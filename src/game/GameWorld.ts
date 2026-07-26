import { GameState, type GameState as GameStateValue } from "../app/GameState";
import type { GameConfig } from "../config/gameConfig";
import {
  circleIntersectsRectangle,
  circleTouchesTerrainPassage,
} from "./Collision";
import { getObstacleRectangles, type ObstaclePair } from "./Obstacle";
import { ObstacleField } from "./ObstacleField";
import {
  createPlayer,
  jumpPlayer,
  resetPlayer,
  type PlayerState,
  updatePlayer,
} from "./Player";
import { awardPassedObstacles } from "./Score";
import { TerrainProfile } from "./terrain/TerrainProfile";
import type { TerrainSampler } from "./terrain/TerrainTypes";

export interface GameSnapshot {
  readonly state: GameStateValue;
  readonly score: number;
  readonly worldTime: number;
  readonly worldDistance: number;
  readonly gameOverElapsed: number;
  readonly terrainSeed: number;
  readonly terrain: TerrainSampler;
  readonly player: Readonly<PlayerState>;
  readonly obstacles: ReadonlyArray<Readonly<ObstaclePair>>;
}

export class GameWorld {
  private state: GameStateValue = GameState.Ready;
  private score = 0;
  private worldTime = 0;
  private worldDistance = 0;
  private gameOverElapsed = 0;
  private readonly player: PlayerState;
  private readonly obstacleField: ObstacleField;
  private readonly terrain: TerrainProfile;

  public constructor(private readonly config: GameConfig) {
    this.player = createPlayer(config.player);
    this.terrain = new TerrainProfile(config.terrain);
    this.obstacleField = new ObstacleField(
      config.world.width,
      config.obstacles,
      this.terrain,
    );
  }

  public get snapshot(): GameSnapshot {
    return {
      state: this.state,
      score: this.score,
      worldTime: this.worldTime,
      worldDistance: this.worldDistance,
      gameOverElapsed: this.gameOverElapsed,
      terrainSeed: this.config.terrain.seed,
      terrain: this.terrain,
      player: this.player,
      obstacles: this.obstacleField.obstacles,
    };
  }

  public update(deltaSeconds: number, primaryAction: boolean): void {
    if (this.state === GameState.Ready) {
      if (!primaryAction) {
        return;
      }

      this.state = GameState.Playing;
    }

    if (this.state === GameState.GameOver) {
      this.gameOverElapsed += deltaSeconds;
      if (
        !primaryAction ||
        this.gameOverElapsed < this.config.restart.guardSeconds
      ) {
        return;
      }

      this.resetRun();
      jumpPlayer(this.player, this.config.player);
      return;
    }

    if (primaryAction) {
      jumpPlayer(this.player, this.config.player);
    }

    updatePlayer(this.player, deltaSeconds, this.config.player);
    this.worldDistance += this.config.obstacles.scrollSpeed * deltaSeconds;
    this.worldTime += deltaSeconds;

    if (this.hasCollision()) {
      this.endRun();
      return;
    }

    this.score += awardPassedObstacles(
      this.obstacleField.obstacles,
      this.worldDistance + this.player.x,
    );
    this.obstacleField.recycleOffscreen(this.worldDistance);
  }

  public endRun(): void {
    if (this.state !== GameState.Playing) {
      return;
    }

    this.state = GameState.GameOver;
    this.gameOverElapsed = 0;
  }

  public get restartGuardSeconds(): number {
    return this.config.restart.guardSeconds;
  }

  private hasCollision(): boolean {
    const playerTerrain = this.terrain.sampleAt(
      this.worldDistance + this.player.x,
    );

    if (
      circleTouchesTerrainPassage(
        this.player,
        playerTerrain,
        this.config.terrain.passageHalfHeight,
      )
    ) {
      return true;
    }

    return this.obstacleField.obstacles.some((obstacle) => {
      const rectangles = getObstacleRectangles(
        obstacle,
        this.worldDistance,
        this.config.world.height,
      );
      return (
        circleIntersectsRectangle(this.player, rectangles.top) ||
        circleIntersectsRectangle(this.player, rectangles.bottom)
      );
    });
  }

  private resetRun(): void {
    this.state = GameState.Playing;
    this.score = 0;
    this.worldTime = 0;
    this.worldDistance = 0;
    this.gameOverElapsed = 0;
    resetPlayer(this.player, this.config.player);
    this.terrain.reset();
    this.obstacleField.reset();
  }
}
