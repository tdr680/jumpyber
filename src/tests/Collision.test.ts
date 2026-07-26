import { describe, expect, it } from "vitest";

import {
  circleIntersectsRectangle,
  circleTouchesTerrainPassage,
  circleTouchesWorldBoundary,
} from "../game/Collision";

const rectangle = { x: 20, y: 20, width: 40, height: 30 };

describe("circleIntersectsRectangle", () => {
  it("does not collide when the shapes are separate", () => {
    expect(
      circleIntersectsRectangle({ x: 5, y: 5, radius: 5 }, rectangle),
    ).toBe(false);
  });

  it.each([
    { x: 15, y: 35, radius: 5 },
    { x: 65, y: 35, radius: 5 },
    { x: 40, y: 15, radius: 5 },
    { x: 40, y: 55, radius: 5 },
  ])("collides inclusively at a rectangle edge", (circle) => {
    expect(circleIntersectsRectangle(circle, rectangle)).toBe(true);
  });

  it("collides on exact corner tangency", () => {
    expect(
      circleIntersectsRectangle({ x: 17, y: 16, radius: 5 }, rectangle),
    ).toBe(true);
  });

  it("does not collide just beyond a corner", () => {
    expect(
      circleIntersectsRectangle({ x: 16.9, y: 16, radius: 5 }, rectangle),
    ).toBe(false);
  });
});

describe("circleTouchesWorldBoundary", () => {
  it("treats top and bottom contact as fatal", () => {
    expect(circleTouchesWorldBoundary({ x: 10, y: 5, radius: 5 }, 100)).toBe(
      true,
    );
    expect(circleTouchesWorldBoundary({ x: 10, y: 95, radius: 5 }, 100)).toBe(
      true,
    );
  });

  it("allows a circle fully inside the world", () => {
    expect(circleTouchesWorldBoundary({ x: 10, y: 50, radius: 5 }, 100)).toBe(
      false,
    );
  });
});

describe("circleTouchesTerrainPassage", () => {
  const terrain = { height: 300, slope: 0.2 };

  it("allows a circle safely inside a sloped passage", () => {
    expect(
      circleTouchesTerrainPassage({ x: 110, y: 300, radius: 16 }, terrain, 190),
    ).toBe(false);
  });

  it("collides inclusively with upper and lower sloped boundaries", () => {
    const normalRadius = 16 * Math.sqrt(1 + terrain.slope ** 2);

    expect(
      circleTouchesTerrainPassage(
        { x: 110, y: 110 + normalRadius, radius: 16 },
        terrain,
        190,
      ),
    ).toBe(true);
    expect(
      circleTouchesTerrainPassage(
        { x: 110, y: 490 - normalRadius, radius: 16 },
        terrain,
        190,
      ),
    ).toBe(true);
  });
});
