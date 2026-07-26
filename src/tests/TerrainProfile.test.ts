import { describe, expect, it } from "vitest";

import { gameConfig } from "../config/gameConfig";
import { TerrainProfile } from "../game/terrain/TerrainProfile";

function sampleRange(
  terrain: TerrainProfile,
  start: number,
  end: number,
  step: number,
) {
  const samples = [];

  for (let worldX = start; worldX <= end; worldX += step) {
    samples.push({ worldX, ...terrain.sampleAt(worldX) });
  }

  return samples;
}

describe("TerrainProfile", () => {
  it("keeps the opening exactly horizontal", () => {
    const terrain = new TerrainProfile(gameConfig.terrain);
    const samples = sampleRange(
      terrain,
      0,
      gameConfig.terrain.openingFlatDistance,
      7,
    );

    expect(samples.every(({ height }) => height === 300)).toBe(true);
    expect(samples.every(({ slope }) => slope === 0)).toBe(true);
  });

  it("blends smoothly away from the flat opening", () => {
    const terrain = new TerrainProfile(gameConfig.terrain);
    const start = gameConfig.terrain.openingFlatDistance;
    const before = terrain.sampleAt(start - 0.01);
    const atStart = terrain.sampleAt(start);
    const after = terrain.sampleAt(start + 0.01);

    expect(atStart).toEqual({ height: 300, slope: 0 });
    expect(Math.abs(after.height - before.height)).toBeLessThan(0.001);
    expect(Math.abs(after.slope - atStart.slope)).toBeLessThan(0.001);
  });

  it("returns the same samples repeatedly and in any query order", () => {
    const positions = [0, 123.4, 810.25, 4_000, 955.5];
    const sequential = new TerrainProfile(gameConfig.terrain);
    const expected = positions.map((position) => sequential.sampleAt(position));
    const shuffled = new TerrainProfile(gameConfig.terrain);

    expect(
      [4_000, 955.5, 0, 810.25, 123.4].map((position) =>
        shuffled.sampleAt(position),
      ),
    ).toEqual([
      expected[3],
      expected[4],
      expected[0],
      expected[2],
      expected[1],
    ]);
    expect(sequential.sampleAt(810.25)).toEqual(expected[2]);
  });

  it("is independent of render-frame sampling frequency", () => {
    const sparse = new TerrainProfile(gameConfig.terrain);
    const dense = new TerrainProfile(gameConfig.terrain);

    sampleRange(dense, 0, 5_000, 170 / 120);

    for (let worldX = 0; worldX <= 5_000; worldX += 170 / 60) {
      expect(sparse.sampleAt(worldX)).toEqual(dense.sampleAt(worldX));
    }
  });

  it("stays bounded, slope-limited, and smooth over a long course", () => {
    const terrain = new TerrainProfile(gameConfig.terrain);
    const samples = sampleRange(terrain, 0, 100_000, 8);
    const heights = samples.map(({ height }) => height);
    const slopes = samples.map(({ slope }) => slope);
    let maximumSlopeChange = 0;

    for (let index = 1; index < samples.length; index += 1) {
      maximumSlopeChange = Math.max(
        maximumSlopeChange,
        Math.abs(
          (samples[index]?.slope ?? 0) - (samples[index - 1]?.slope ?? 0),
        ),
      );
    }

    expect(Math.min(...heights)).toBeGreaterThanOrEqual(
      gameConfig.terrain.minHeight - 0.001,
    );
    expect(Math.max(...heights)).toBeLessThanOrEqual(
      gameConfig.terrain.maxHeight + 0.001,
    );
    expect(Math.max(...slopes.map(Math.abs))).toBeLessThanOrEqual(
      gameConfig.terrain.maximumSlope + 1e-10,
    );
    expect(maximumSlopeChange).toBeLessThan(0.03);
  });

  it("contains ascending, descending, and nearly horizontal sections", () => {
    const terrain = new TerrainProfile(gameConfig.terrain);
    const slopes = sampleRange(terrain, 1_000, 30_000, 20).map(
      ({ slope }) => slope,
    );

    expect(slopes.some((slope) => slope < -0.04)).toBe(true);
    expect(slopes.some((slope) => slope > 0.04)).toBe(true);
    expect(slopes.some((slope) => Math.abs(slope) < 0.005)).toBe(true);
  });

  it("changes profile when the seed changes", () => {
    const first = new TerrainProfile(gameConfig.terrain);
    const second = new TerrainProfile({
      ...gameConfig.terrain,
      seed: gameConfig.terrain.seed + 1,
    });

    expect(first.sampleAt(2_000)).not.toEqual(second.sampleAt(2_000));
  });

  it("reset reproduces the configured opening profile", () => {
    const terrain = new TerrainProfile(gameConfig.terrain);
    const expected = terrain.sampleAt(2_000);

    terrain.sampleAt(20_000);
    terrain.reset();

    expect(terrain.sampleAt(2_000)).toEqual(expected);
    expect(terrain.sampleAt(0)).toEqual({ height: 300, slope: 0 });
  });
});
