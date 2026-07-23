import { describe, expect, it } from "vitest";

import { calculateViewportMetrics } from "../rendering/Viewport";

const logicalSize = { width: 400, height: 600 };

describe("calculateViewportMetrics", () => {
  it("scales a logical viewport into a high-DPI backing store", () => {
    const metrics = calculateViewportMetrics(300, 450, 2, logicalSize, 3);

    expect(metrics.backingWidth).toBe(600);
    expect(metrics.backingHeight).toBe(900);
    expect(metrics.scaleX).toBe(1.5);
    expect(metrics.scaleY).toBe(1.5);
  });

  it("clamps device pixel ratio", () => {
    const metrics = calculateViewportMetrics(400, 600, 5, logicalSize, 3);

    expect(metrics.devicePixelRatio).toBe(3);
    expect(metrics.backingWidth).toBe(1200);
    expect(metrics.backingHeight).toBe(1800);
  });

  it("avoids invalid zero-sized backing stores", () => {
    const metrics = calculateViewportMetrics(0, 0, 0, logicalSize, 3);

    expect(metrics.cssWidth).toBe(1);
    expect(metrics.cssHeight).toBe(1);
    expect(metrics.backingWidth).toBe(1);
    expect(metrics.backingHeight).toBe(1);
  });
});
