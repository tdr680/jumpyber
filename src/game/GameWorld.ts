import { GameState, type GameState as GameStateValue } from "../app/GameState";
import type { GameConfig } from "../config/gameConfig";
import { MathRandomSource, type RandomSource } from "../core/random";
import {
  circleIntersectsRectangle,
  circleTouchesWorldBoundary,
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

export interface GameSnapshot {
  readonly state: GameStateValue;
  readonly score: number;
  readonly worldTime: number;
  readonly gameOverElapsed: number;
  readonly player: Readonly<PlayerState>;
  readonly obstacles: ReadonlyArray<Readonly<ObstaclePair>>;
}

export class GameWorld {
  private state: GameStateValue = GameState.Ready;
  private score = 0;
  private worldTime = 0;
  private gameOverElapsed = 0;
  private readonly player: PlayerState;
  private readonly obstacleField: ObstacleField;

  public constructor(
    private readonly config: GameConfig,
    randomSource: RandomSource = new MathRandomSource(),
  ) {
    this.player = createPlayer(config.player);
    this.obstacleField = new ObstacleField(
      config.world.height,
      config.world.width,
      config.obstacles,
      randomSource,
    );
  }

  public get snapshot(): GameSnapshot {
    return {
      state: this.state,
      score: this.score,
      worldTime: this.worldTime,
      gameOverElapsed: this.gameOverElapsed,
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
    this.obstacleField.update(deltaSeconds);
    this.worldTime += deltaSeconds;

    if (this.hasCollision()) {
      this.endRun();
      return;
    }

    this.score += awardPassedObstacles(
      this.obstacleField.obstacles,
      this.player.x,
    );
    this.obstacleField.recycleOffscreen();
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
    if (circleTouchesWorldBoundary(this.player, this.config.world.height)) {
      return true;
    }

    return this.obstacleField.obstacles.some((obstacle) => {
      const rectangles = getObstacleRectangles(
        obstacle,
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
    this.gameOverElapsed = 0;
    resetPlayer(this.player, this.config.player);
    this.obstacleField.reset();
  }
}
