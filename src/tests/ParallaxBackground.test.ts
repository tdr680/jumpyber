import { describe, expect, it } from "vitest";

import {
  getFirstRepeatedX,
  getParallaxTravel,
  getRequiredRepeatCount,
  wrapParallaxOffset,
} from "../rendering/ParallaxBackground";

describe("parallax calculations", () => {
  it("selects world or camera travel explicitly", () => {
    expect(getParallaxTravel("world", 840, 35)).toBe(840);
    expect(getParallaxTravel("camera", 840, 35)).toBe(35);
  });

  it("maps world scroll to a deterministic layer offset", () => {
    expect(wrapParallaxOffset(840, 0.025, 768)).toBe(21);
    expect(wrapParallaxOffset(840, 0.07, 768)).toBeCloseTo(58.8);
    expect(wrapParallaxOffset(840, 0.15, 768)).toBe(126);
    expect(wrapParallaxOffset(840, 0.15, 768)).toBe(
      wrapParallaxOffset(840, 0.15, 768),
    );
  });

  it("wraps offsets in both scrolling directions", () => {
    expect(wrapParallaxOffset(5_200, 0.15, 768)).toBe(12);
    expect(wrapParallaxOffset(-80, 0.15, 768)).toBe(756);
  });

  it("covers the viewport with only the required repeated tiles", () => {
    const firstX = getFirstRepeatedX(173);
    const repeatSpan = 768;
    const count = getRequiredRepeatCount(firstX, 400, repeatSpan);

    expect(firstX).toBe(-173);
    expect(count).toBe(1);
    expect(firstX + count * repeatSpan).toBeGreaterThanOrEqual(400);
    expect(firstX + (count - 1) * repeatSpan).toBeLessThan(400);
  });
});
