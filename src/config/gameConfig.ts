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
  readonly playerSprite: {
    readonly imagePath: string;
    readonly frameSize: number;
    readonly frameCount: number;
    readonly drawSize: number;
    readonly jumpVelocityThreshold: number;
    readonly apexSpeedThreshold: number;
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
  readonly obstacleSprite: {
    readonly imagePath: string;
    readonly sourceSize: Size;
    readonly tileHeight: number;
  };
  readonly terrain: {
    readonly seed: number;
    readonly initialHeight: number;
    readonly noiseFrequency: number;
    /** Vertical logical world units per horizontal logical world unit. */
    readonly maximumSlope: number;
    readonly slopeSmoothingDistance: number;
    readonly integrationStep: number;
    readonly minHeight: number;
    readonly maxHeight: number;
    readonly centerHeight: number;
    readonly centerBiasStrength: number;
    readonly boundaryBiasStrength: number;
    readonly boundaryInfluenceDistance: number;
    readonly openingFlatDistance: number;
    readonly openingBlendDistance: number;
    readonly passageHalfHeight: number;
    readonly renderSampleSpacing: number;
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
  playerSprite: {
    imagePath: "assets/sprites/player/player-sheet.png",
    frameSize: 96,
    frameCount: 6,
    drawSize: 72,
    jumpVelocityThreshold: -340,
    apexSpeedThreshold: 75,
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
  obstacleSprite: {
    imagePath: "assets/sprites/obstacles/obstacle-body.png",
    sourceSize: {
      width: 64,
      height: 64,
    },
    tileHeight: 64,
  },
  terrain: {
    seed: 680,
    initialHeight: 300,
    noiseFrequency: 1 / 800,
    maximumSlope: 0.22,
    slopeSmoothingDistance: 80,
    integrationStep: 8,
    minHeight: 210,
    maxHeight: 390,
    centerHeight: 300,
    centerBiasStrength: 0.00045,
    boundaryBiasStrength: 0.08,
    boundaryInfluenceDistance: 60,
    openingFlatDistance: 320,
    openingBlendDistance: 480,
    passageHalfHeight: 190,
    renderSampleSpacing: 8,
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
    config.playerSprite.frameSize,
    config.playerSprite.frameCount,
    config.playerSprite.drawSize,
    config.playerSprite.apexSpeedThreshold,
    config.obstacles.width,
    config.obstacles.gapHeight,
    config.obstacles.scrollSpeed,
    config.obstacles.horizontalSpacing,
    config.obstacles.poolSize,
    config.obstacleSprite.sourceSize.width,
    config.obstacleSprite.sourceSize.height,
    config.obstacleSprite.tileHeight,
    config.terrain.noiseFrequency,
    config.terrain.maximumSlope,
    config.terrain.slopeSmoothingDistance,
    config.terrain.integrationStep,
    config.terrain.boundaryBiasStrength,
    config.terrain.boundaryInfluenceDistance,
    config.terrain.openingBlendDistance,
    config.terrain.passageHalfHeight,
    config.terrain.renderSampleSpacing,
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

  if (
    config.playerSprite.imagePath.startsWith("/") ||
    config.playerSprite.imagePath.length === 0
  ) {
    throw new Error(
      "The player sprite path must be relative to the deployment base.",
    );
  }

  if (
    !Number.isInteger(config.playerSprite.frameCount) ||
    config.playerSprite.frameCount !== 6 ||
    config.playerSprite.jumpVelocityThreshold >=
      -config.playerSprite.apexSpeedThreshold
  ) {
    throw new Error("Player sprite frame configuration is invalid.");
  }

  if (
    config.obstacleSprite.imagePath.startsWith("/") ||
    config.obstacleSprite.imagePath.length === 0
  ) {
    throw new Error(
      "The obstacle sprite path must be relative to the deployment base.",
    );
  }

  if (
    config.obstacleSprite.sourceSize.width !== config.obstacles.width ||
    config.obstacleSprite.tileHeight !== config.obstacleSprite.sourceSize.height
  ) {
    throw new Error("Obstacle sprite geometry is invalid.");
  }

  const { terrain } = config;
  const terrainValues = Object.values(terrain);

  if (terrainValues.some((value) => !Number.isFinite(value))) {
    throw new Error("Terrain configuration values must be finite.");
  }

  if (!Number.isInteger(terrain.seed)) {
    throw new Error("The terrain seed must be an integer.");
  }

  if (terrain.openingFlatDistance < 0) {
    throw new Error("The terrain opening distance cannot be negative.");
  }

  if (
    terrain.minHeight >= terrain.centerHeight ||
    terrain.centerHeight >= terrain.maxHeight ||
    terrain.initialHeight < terrain.minHeight ||
    terrain.initialHeight > terrain.maxHeight
  ) {
    throw new Error(
      "Terrain heights must form a playable interval around the centre.",
    );
  }

  if (
    terrain.minHeight - terrain.passageHalfHeight <= 0 ||
    terrain.maxHeight + terrain.passageHalfHeight >= config.world.height
  ) {
    throw new Error(
      "Terrain passage boundaries must remain inside the logical world.",
    );
  }

  const halfGapHeight = config.obstacles.gapHeight / 2;

  if (
    terrain.minHeight - halfGapHeight < config.obstacles.minimumTopClearance ||
    terrain.maxHeight + halfGapHeight >
      config.world.height - config.obstacles.minimumBottomClearance
  ) {
    throw new Error(
      "Terrain-aligned obstacle gaps must preserve safe clearances.",
    );
  }

  if (terrain.passageHalfHeight <= config.player.radius) {
    throw new Error("The terrain passage must fit the player.");
  }
}
