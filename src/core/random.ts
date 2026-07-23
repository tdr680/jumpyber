export interface RandomSource {
  next(): number;
}

export class MathRandomSource implements RandomSource {
  public next(): number {
    return Math.random();
  }
}
