import type { GameConfig } from "../../config/gameConfig";
import { GradientNoise1D } from "./GradientNoise1D";
import type { TerrainSample, TerrainSampler } from "./TerrainTypes";

type TerrainConfig = GameConfig["terrain"];

interface TerrainNode extends TerrainSample {
  readonly filteredNoiseSlope: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(value: number): number {
  const normalized = clamp(value, 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

export class TerrainProfile implements TerrainSampler {
  private readonly noise: GradientNoise1D;
  private readonly nodes: TerrainNode[] = [];

  public constructor(private readonly config: TerrainConfig) {
    this.noise = new GradientNoise1D(config.seed);
    this.reset();
  }

  public sampleAt(worldX: number): TerrainSample {
    if (!Number.isFinite(worldX)) {
      throw new Error("Terrain positions must be finite.");
    }

    if (worldX <= 0) {
      return { height: this.config.initialHeight, slope: 0 };
    }

    const segmentIndex = Math.floor(worldX / this.config.integrationStep);
    this.ensureNode(segmentIndex + 1);

    const start = this.nodes[segmentIndex];
    const end = this.nodes[segmentIndex + 1];

    if (start === undefined || end === undefined) {
      throw new Error("Terrain segment generation failed.");
    }

    const distance = worldX - segmentIndex * this.config.integrationStep;
    const slopeDelta = end.slope - start.slope;
    const slope =
      start.slope + (slopeDelta * distance) / this.config.integrationStep;
    const height =
      start.height +
      start.slope * distance +
      (slopeDelta * distance * distance) / (2 * this.config.integrationStep);

    return { height, slope };
  }

  public reset(): void {
    this.nodes.length = 0;
    this.nodes.push({
      height: this.config.initialHeight,
      slope: 0,
      filteredNoiseSlope: 0,
    });
  }

  private ensureNode(index: number): void {
    while (this.nodes.length <= index) {
      this.appendNode();
    }
  }

  private appendNode(): void {
    const previous = this.nodes.at(-1);

    if (previous === undefined) {
      throw new Error("Terrain requires an initial control node.");
    }

    const worldX = this.nodes.length * this.config.integrationStep;
    const blend = this.openingBlendAt(worldX);
    const targetNoiseSlope =
      this.noise.sample(worldX * this.config.noiseFrequency) *
      this.config.maximumSlope *
      blend;
    const filterAmount =
      1 -
      Math.exp(
        -this.config.integrationStep / this.config.slopeSmoothingDistance,
      );
    const filteredNoiseSlope =
      previous.filteredNoiseSlope +
      (targetNoiseSlope - previous.filteredNoiseSlope) * filterAmount;

    if (blend === 0) {
      this.nodes.push({
        height: this.config.initialHeight,
        slope: 0,
        filteredNoiseSlope: 0,
      });
      return;
    }

    const predictedHeight =
      previous.height + previous.slope * this.config.integrationStep;
    let slope = this.effectiveSlope(filteredNoiseSlope, predictedHeight, blend);
    let height =
      previous.height +
      ((previous.slope + slope) / 2) * this.config.integrationStep;

    slope = this.effectiveSlope(filteredNoiseSlope, height, blend);
    height =
      previous.height +
      ((previous.slope + slope) / 2) * this.config.integrationStep;

    this.nodes.push({ height, slope, filteredNoiseSlope });
  }

  private openingBlendAt(worldX: number): number {
    if (worldX <= this.config.openingFlatDistance) {
      return 0;
    }

    return smoothstep(
      (worldX - this.config.openingFlatDistance) /
        this.config.openingBlendDistance,
    );
  }

  private effectiveSlope(
    noiseSlope: number,
    height: number,
    openingBlend: number,
  ): number {
    const centerBias =
      (this.config.centerHeight - height) * this.config.centerBiasStrength;
    let slope = noiseSlope + centerBias * openingBlend;

    if (slope < 0) {
      const distanceFromUpperBound = height - this.config.minHeight;
      const influence = smoothstep(
        distanceFromUpperBound / this.config.boundaryInfluenceDistance,
      );
      slope =
        slope * influence +
        (1 - influence) * this.config.boundaryBiasStrength * openingBlend;
    } else if (slope > 0) {
      const distanceFromLowerBound = this.config.maxHeight - height;
      const influence = smoothstep(
        distanceFromLowerBound / this.config.boundaryInfluenceDistance,
      );
      slope =
        slope * influence -
        (1 - influence) * this.config.boundaryBiasStrength * openingBlend;
    }

    return clamp(slope, -this.config.maximumSlope, this.config.maximumSlope);
  }
}
