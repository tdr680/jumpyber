import type { Circle, Rectangle } from "../core/types";

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
