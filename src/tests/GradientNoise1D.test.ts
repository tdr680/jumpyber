import { describe, expect, it } from "vitest";

import { GradientNoise1D } from "../game/terrain/GradientNoise1D";

describe("GradientNoise1D", () => {
  it("is deterministic for a fixed seed and arbitrary query order", () => {
    const first = new GradientNoise1D(680);
    const second = new GradientNoise1D(680);
    const positions = [0, 0.125, 1.75, 19.5, 4.25, -2.5];
    const expected = positions.map((position) => first.sample(position));

    expect(
      [...positions].reverse().map((position) => second.sample(position)),
    ).toEqual([...expected].reverse());
    expect(first.sample(19.5)).toBe(first.sample(19.5));
  });

  it("produces different profiles for different seeds", () => {
    const first = new GradientNoise1D(1);
    const second = new GradientNoise1D(2);
    const positions = [0.2, 0.7, 1.2, 2.8, 5.4];

    expect(
      positions.some(
        (position) => first.sample(position) !== second.sample(position),
      ),
    ).toBe(true);
  });

  it("stays in its documented range", () => {
    const noise = new GradientNoise1D(680);
    let minimum = Number.POSITIVE_INFINITY;
    let maximum = Number.NEGATIVE_INFINITY;

    for (let index = -10_000; index <= 10_000; index += 1) {
      const value = noise.sample(index / 137);
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }

    expect(minimum).toBeGreaterThanOrEqual(-1);
    expect(maximum).toBeLessThanOrEqual(1);
  });

  it("changes smoothly near lattice boundaries", () => {
    const noise = new GradientNoise1D(680);
    const epsilon = 0.0001;

    for (let lattice = -10; lattice <= 10; lattice += 1) {
      expect(
        Math.abs(
          noise.sample(lattice - epsilon) - noise.sample(lattice + epsilon),
        ),
      ).toBeLessThan(0.001);
    }
  });
});
