import type { Circle, Rectangle } from "../core/types";
import type { TerrainSample } from "./terrain/TerrainTypes";

export function circleIntersectsRectangle(
  circle: Circle,
  rectangle: Rectangle,
): boolean {
  const nearestX = Math.max(
    rectangle.x,
    Math.min(circle.x, rectangle.x + rectangle.width),
  );
  const nearestY = Math.max(
    rectangle.y,
    Math.min(circle.y, rectangle.y + rectangle.height),
  );
  const distanceX = circle.x - nearestX;
  const distanceY = circle.y - nearestY;

  return distanceX * distanceX + distanceY * distanceY <= circle.radius ** 2;
}

export function circleTouchesWorldBoundary(
  circle: Circle,
  worldHeight: number,
): boolean {
  return (
    circle.y - circle.radius <= 0 || circle.y + circle.radius >= worldHeight
  );
}

export function circleTouchesTerrainPassage(
  circle: Circle,
  terrain: TerrainSample,
  passageHalfHeight: number,
): boolean {
  const collisionTolerance = 1e-9;
  const slopeLength = Math.sqrt(1 + terrain.slope * terrain.slope);
  const normalRadius = circle.radius * slopeLength;
  const upperBoundary = terrain.height - passageHalfHeight;
  const lowerBoundary = terrain.height + passageHalfHeight;

  return (
    circle.y - upperBoundary <= normalRadius + collisionTolerance ||
    lowerBoundary - circle.y <= normalRadius + collisionTolerance
  );
}
