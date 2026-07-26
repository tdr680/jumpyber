export interface TerrainSample {
  readonly height: number;
  /**
   * dy/dx in logical world units. Positive slopes descend on the Canvas because
   * logical y increases downward.
   */
  readonly slope: number;
}

export interface TerrainSampler {
  sampleAt(worldX: number): TerrainSample;
}
