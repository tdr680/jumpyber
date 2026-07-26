import type { Rectangle } from "../core/types";

export interface ObstaclePair {
  worldX: number;
  width: number;
  gapHeight: number;
  terrainHeight: number;
  scored: boolean;
}

export interface ObstacleRectangles {
  readonly top: Rectangle;
  readonly bottom: Rectangle;
}

export function getObstacleRectangles(
  obstacle: Readonly<ObstaclePair>,
  worldDistance: number,
  worldHeight: number,
): ObstacleRectangles {
  const x = obstacle.worldX - worldDistance;
  const gapTop = obstacle.terrainHeight - obstacle.gapHeight / 2;
  const gapBottom = obstacle.terrainHeight + obstacle.gapHeight / 2;

  return {
    top: {
      x,
      y: 0,
      width: obstacle.width,
      height: gapTop,
    },
    bottom: {
      x,
      y: gapBottom,
      width: obstacle.width,
      height: worldHeight - gapBottom,
    },
  };
}
