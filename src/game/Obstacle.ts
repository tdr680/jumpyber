import type { Rectangle } from "../core/types";

export interface ObstaclePair {
  x: number;
  width: number;
  gapTop: number;
  gapHeight: number;
  scored: boolean;
}

export interface ObstacleRectangles {
  readonly top: Rectangle;
  readonly bottom: Rectangle;
}

export function getObstacleRectangles(
  obstacle: Readonly<ObstaclePair>,
  worldHeight: number,
): ObstacleRectangles {
  const gapBottom = obstacle.gapTop + obstacle.gapHeight;

  return {
    top: {
      x: obstacle.x,
      y: 0,
      width: obstacle.width,
      height: obstacle.gapTop,
    },
    bottom: {
      x: obstacle.x,
      y: gapBottom,
      width: obstacle.width,
      height: worldHeight - gapBottom,
    },
  };
}
