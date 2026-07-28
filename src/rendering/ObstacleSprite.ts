import type { GameConfig } from "../config/gameConfig";
import type { Rectangle } from "../core/types";
import type { ObstacleRectangles } from "../game/Obstacle";

type ObstacleSpriteConfig = GameConfig["obstacleSprite"];

export interface ObstacleSpriteSection {
  readonly rectangle: Rectangle;
  readonly flipVertically: boolean;
}

export interface ObstacleSpritePost {
  readonly cap: ObstacleSpriteSection;
  readonly body: Rectangle;
  readonly base: ObstacleSpriteSection;
}

export interface ObstacleSpriteAssembly {
  readonly upper: ObstacleSpritePost;
  readonly lower: ObstacleSpritePost;
  readonly terrainAngleRadians: number;
}

function centeredRectangle(
  obstacleRectangle: Readonly<Rectangle>,
  y: number,
  width: number,
  height: number,
): Rectangle {
  return {
    x: obstacleRectangle.x + (obstacleRectangle.width - width) / 2,
    y,
    width,
    height,
  };
}

export function createObstacleSpriteAssembly(
  rectangles: Readonly<ObstacleRectangles>,
  terrainHeight: number,
  terrainSlope: number,
  passageHalfHeight: number,
  config: ObstacleSpriteConfig,
): ObstacleSpriteAssembly {
  const upperTerrainY = terrainHeight - passageHalfHeight;
  const lowerTerrainY = terrainHeight + passageHalfHeight;
  const upperGapY = rectangles.top.y + rectangles.top.height;
  const lowerGapY = rectangles.bottom.y;
  const overlap = config.connectionOverlap;

  const upperCap = centeredRectangle(
    rectangles.top,
    upperGapY - config.capDrawSize.height,
    config.capDrawSize.width,
    config.capDrawSize.height,
  );
  const upperBase = centeredRectangle(
    rectangles.top,
    upperTerrainY,
    config.baseDrawSize.width,
    config.baseDrawSize.height,
  );
  const lowerCap = centeredRectangle(
    rectangles.bottom,
    lowerGapY,
    config.capDrawSize.width,
    config.capDrawSize.height,
  );
  const lowerBase = centeredRectangle(
    rectangles.bottom,
    lowerTerrainY - config.baseDrawSize.height,
    config.baseDrawSize.width,
    config.baseDrawSize.height,
  );

  return {
    upper: {
      cap: { rectangle: upperCap, flipVertically: true },
      body: {
        x: rectangles.top.x,
        y: rectangles.top.y,
        width: rectangles.top.width,
        height: Math.max(0, upperCap.y - rectangles.top.y + overlap),
      },
      base: { rectangle: upperBase, flipVertically: true },
    },
    lower: {
      cap: { rectangle: lowerCap, flipVertically: false },
      body: {
        x: rectangles.bottom.x,
        y: lowerCap.y + lowerCap.height - overlap,
        width: rectangles.bottom.width,
        height: Math.max(
          0,
          rectangles.bottom.y +
            rectangles.bottom.height -
            (lowerCap.y + lowerCap.height) +
            overlap,
        ),
      },
      base: { rectangle: lowerBase, flipVertically: false },
    },
    terrainAngleRadians: Math.atan(terrainSlope),
  };
}

export function usesDamagedObstacleCap(
  obstacleWorldX: number,
  horizontalSpacing: number,
  damagedCapInterval: number,
): boolean {
  const courseIndex = Math.floor(obstacleWorldX / horizontalSpacing);
  const normalizedIndex =
    ((courseIndex % damagedCapInterval) + damagedCapInterval) %
    damagedCapInterval;
  return normalizedIndex === damagedCapInterval - 1;
}
