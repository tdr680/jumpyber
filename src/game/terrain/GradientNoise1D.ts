function fade(value: number): number {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function interpolate(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

export class GradientNoise1D {
  public constructor(private readonly seed: number) {
    if (!Number.isFinite(seed) || !Number.isInteger(seed)) {
      throw new Error("Gradient noise requires a finite integer seed.");
    }
  }

  /**
   * Samples normalized one-dimensional gradient noise in the range [-1, 1].
   */
  public sample(position: number): number {
    if (!Number.isFinite(position)) {
      throw new Error("Gradient noise positions must be finite.");
    }

    const left = Math.floor(position);
    const offset = position - left;
    const leftContribution = this.gradientAt(left) * offset;
    const rightContribution = this.gradientAt(left + 1) * (offset - 1);

    return interpolate(leftContribution, rightContribution, fade(offset)) * 2;
  }

  private gradientAt(lattice: number): number {
    let hash = Math.imul(lattice | 0, 0x27d4eb2d) ^ (this.seed | 0);
    hash ^= hash >>> 15;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return (hash & 1) === 0 ? -1 : 1;
  }
}
