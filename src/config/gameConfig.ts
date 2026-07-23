import type { Size } from "../core/types";

export interface GameConfig {
  readonly world: Size;
  readonly loop: {
    readonly fixedStepSeconds: number;
    readonly maxFrameDeltaSeconds: number;
  };
  readonly viewport: {
    readonly maxDevicePixelRatio: number;
  };
  readonly player: {
    readonly x: number;
    readonly startY: number;
    readonly radius: number;
    readonly gravity: number;
    readonly jumpVelocity: number;
    readonly maxFallVelocity: number;
  };
  readonly obstacles: {
    readonly width: number;
    readonly gapHeight: number;
    readonly scrollSpeed: number;
    readonly horizontalSpacing: number;
    readonly minimumTopClearance: number;
    readonly minimumBottomClearance: number;
    readonly firstSpawnOffset: number;
    readonly poolSize: number;
  };
  readonly restart: {
    readonly guardSeconds: number;
  };
  readonly colors: {
    readonly skyTop: string;
    readonly skyMiddle: string;
    readonly skyBottom: string;
    readonly distantGround: string;
    readonly obstacle: string;
    readonly obstacleHighlight: string;
    readonly obstacleEdge: string;
    readonly player: string;
    readonly ink: string;
  };
}

export const gameConfig = {
  world: {
    width: 400,
    height: 600,
  },
  loop: {
    fixedStepSeconds: 1 / 120,
    maxFrameDeltaSeconds: 0.1,
  },
  viewport: {
    maxDevicePixelRatio: 3,
  },
  player: {
    x: 110,
    startY: 300,
    radius: 16,
    gravity: 1500,
    jumpVelocity: -460,
    maxFallVelocity: 800,
  },
  obstacles: {
    width: 64,
    gapHeight: 155,
    scrollSpeed: 170,
    horizontalSpacing: 220,
    minimumTopClearance: 60,
    minimumBottomClearance: 80,
    firstSpawnOffset: 100,
    poolSize: 3,
  },
  restart: {
    guardSeconds: 0.25,
  },
  colors: {
    skyTop: "#d8f2ff",
    skyMiddle: "#f7e9c6",
    skyBottom: "#f3c989",
    distantGround: "#9dc8b4",
    obstacle: "#315f5a",
    obstacleHighlight: "#4f8177",
    obstacleEdge: "#234844",
    player: "#ff6b4a",
    ink: "#172f3a",
  },
} as const satisfies GameConfig;

export function validateGameConfig(config: GameConfig): void {
  const positiveValues = [
    config.world.width,
    config.world.height,
    config.loop.fixedStepSeconds,
    config.loop.maxFrameDeltaSeconds,
    config.viewport.maxDevicePixelRatio,
    config.player.radius,
    config.player.gravity,
    config.player.maxFallVelocity,
    config.obstacles.width,
    config.obstacles.gapHeight,
    config.obstacles.scrollSpeed,
    config.obstacles.horizontalSpacing,
    config.obstacles.poolSize,
    config.restart.guardSeconds,
  ];

  if (positiveValues.some((value) => value <= 0)) {
    throw new Error(
      "Game configuration values that represent sizes must be positive.",
    );
  }

  const requiredHeight =
    config.obstacles.minimumTopClearance +
    config.obstacles.gapHeight +
    config.obstacles.minimumBottomClearance;

  if (requiredHeight > config.world.height) {
    throw new Error("Obstacle clearances and gap do not fit inside the world.");
  }

  if (
    config.player.startY - config.player.radius <= 0 ||
    config.player.startY + config.player.radius >= config.world.height
  ) {
    throw new Error(
      "The player start position must be inside the world boundaries.",
    );
  }
}
