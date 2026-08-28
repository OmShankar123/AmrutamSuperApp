export class SeededRandom {
  private seed: number;

  constructor(seed = 123456789) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: readonly T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  pickMultiple<T>(array: readonly T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.next() - 0.5);
    return shuffled.slice(0, count);
  }
}
