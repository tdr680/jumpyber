import { describe, expect, it } from "vitest";

import { gameConfig } from "../config/gameConfig";
import { GameWorld } from "../game/GameWorld";

describe("GameWorld states", () => {
  it("starts ready and enters playing on a primary action", () => {
    const world = new GameWorld(gameConfig);

    expect(world.snapshot.state).toBe("ready");
    world.update(gameConfig.loop.fixedStepSeconds, true);
    expect(world.snapshot.state).toBe("playing");
    expect(world.snapshot.player.velocityY).toBeLessThan(0);
    expect(world.snapshot.player.y).toBeLessThan(gameConfig.player.startY);
  });

  it("advances world time only while playing", () => {
    const world = new GameWorld(gameConfig);

    world.update(0.5, false);
    expect(world.snapshot.worldTime).toBe(0);
    expect(world.snapshot.worldDistance).toBe(0);

    world.update(0.1, true);
    world.update(0.5, false);
    expect(world.snapshot.worldTime).toBe(0.6);
    expect(world.snapshot.worldDistance).toBeCloseTo(102);
  });

  it("enters game over and advances only its guard timer", () => {
    const world = new GameWorld(gameConfig);

    world.update(0, true);
    world.update(0.5, false);
    world.endRun();
    world.update(0.2, false);

    expect(world.snapshot.state).toBe("gameOver");
    expect(world.snapshot.worldTime).toBe(0.5);
    expect(world.snapshot.gameOverElapsed).toBe(0.2);
    expect(world.restartGuardSeconds).toBe(0.25);
  });

  it("enters game over when the player reaches a world boundary", () => {
    const boundaryConfig = {
      ...gameConfig,
      player: {
        ...gameConfig.player,
        startY: 126,
      },
    };
    const world = new GameWorld(boundaryConfig);

    world.update(gameConfig.loop.fixedStepSeconds, true);

    expect(world.snapshot.state).toBe("gameOver");
  });

  it("enters game over when the player intersects an obstacle", () => {
    const collisionConfig = {
      ...gameConfig,
      obstacles: {
        ...gameConfig.obstacles,
        firstSpawnOffset: -290,
        gapHeight: 100,
      },
      player: {
        ...gameConfig.player,
        startY: 200,
      },
    };
    const world = new GameWorld(collisionConfig);

    world.update(gameConfig.loop.fixedStepSeconds, true);

    expect(world.snapshot.state).toBe("gameOver");
  });

  it("does not award a point on a fatal scoring update", () => {
    const collisionConfig = {
      ...gameConfig,
      obstacles: {
        ...gameConfig.obstacles,
        firstSpawnOffset: -355,
        gapHeight: 100,
      },
      player: {
        ...gameConfig.player,
        startY: 200,
      },
    };
    const world = new GameWorld(collisionConfig);

    world.update(gameConfig.loop.fixedStepSeconds, true);

    expect(world.snapshot.state).toBe("gameOver");
    expect(world.snapshot.score).toBe(0);
  });

  it("ignores restart during the guard and cleanly restarts afterward", () => {
    const world = new GameWorld(gameConfig);

    world.update(gameConfig.loop.fixedStepSeconds, true);
    world.endRun();
    world.update(0.1, true);
    expect(world.snapshot.state).toBe("gameOver");

    world.update(0.15, false);
    world.update(gameConfig.loop.fixedStepSeconds, true);

    expect(world.snapshot.state).toBe("playing");
    expect(world.snapshot.score).toBe(0);
    expect(world.snapshot.worldTime).toBe(0);
    expect(world.snapshot.worldDistance).toBe(0);
    expect(world.snapshot.gameOverElapsed).toBe(0);
    expect(world.snapshot.player.velocityY).toBe(
      gameConfig.player.jumpVelocity,
    );
    expect(world.snapshot.obstacles.every(({ scored }) => !scored)).toBe(true);
    expect(world.snapshot.obstacles[0]?.worldX).toBe(500);
    expect(world.snapshot.terrain.sampleAt(0)).toEqual({
      height: gameConfig.terrain.initialHeight,
      slope: 0,
    });
  });

  it("scores a safe obstacle once and resets a non-zero score on restart", () => {
    const scoringConfig = {
      ...gameConfig,
      obstacles: {
        ...gameConfig.obstacles,
        firstSpawnOffset: -355,
      },
    };
    const world = new GameWorld(scoringConfig);

    world.update(gameConfig.loop.fixedStepSeconds, true);
    expect(world.snapshot.state).toBe("playing");
    expect(world.snapshot.score).toBe(1);

    world.update(gameConfig.loop.fixedStepSeconds, false);
    expect(world.snapshot.score).toBe(1);

    world.endRun();
    world.update(gameConfig.restart.guardSeconds, false);
    world.update(gameConfig.loop.fixedStepSeconds, true);

    expect(world.snapshot.state).toBe("playing");
    expect(world.snapshot.score).toBe(0);
    expect(world.snapshot.worldDistance).toBe(0);
    expect(world.snapshot.obstacles.every(({ scored }) => !scored)).toBe(true);
  });

  it("reproduces terrain samples and obstacle placement after restart", () => {
    const world = new GameWorld(gameConfig);
    const openingObstacleHeight = world.snapshot.obstacles[0]?.terrainHeight;
    const expectedTerrain = world.snapshot.terrain.sampleAt(2_000);

    world.update(gameConfig.loop.fixedStepSeconds, true);
    for (let index = 0; index < 1_000; index += 1) {
      world.update(gameConfig.loop.fixedStepSeconds, index % 45 === 0);
      if (world.snapshot.state === "gameOver") {
        break;
      }
    }
    world.endRun();
    world.update(gameConfig.restart.guardSeconds, false);
    world.update(gameConfig.loop.fixedStepSeconds, true);

    expect(world.snapshot.terrainSeed).toBe(gameConfig.terrain.seed);
    expect(world.snapshot.terrain.sampleAt(2_000)).toEqual(expectedTerrain);
    expect(world.snapshot.obstacles[0]?.terrainHeight).toBe(
      openingObstacleHeight,
    );
  });
});
