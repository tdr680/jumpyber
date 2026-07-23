export interface FrameScheduler {
  request(callback: FrameRequestCallback): number;
  cancel(requestId: number): void;
}

export interface GameLoopOptions {
  readonly fixedStepSeconds: number;
  readonly maxFrameDeltaSeconds: number;
  readonly update: (deltaSeconds: number) => void;
  readonly render: () => void;
  readonly scheduler?: FrameScheduler;
}

const browserFrameScheduler: FrameScheduler = {
  request: (callback) => window.requestAnimationFrame(callback),
  cancel: (requestId) => window.cancelAnimationFrame(requestId),
};

export class GameLoop {
  private readonly scheduler: FrameScheduler;
  private accumulatorSeconds = 0;
  private lastTimestampMilliseconds: number | null = null;
  private requestId: number | null = null;
  private running = false;

  public constructor(private readonly options: GameLoopOptions) {
    this.scheduler = options.scheduler ?? browserFrameScheduler;
  }

  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.accumulatorSeconds = 0;
    this.lastTimestampMilliseconds = null;
    this.requestId = this.scheduler.request(this.frame);
  }

  public stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    if (this.requestId !== null) {
      this.scheduler.cancel(this.requestId);
    }
    this.requestId = null;
    this.accumulatorSeconds = 0;
    this.lastTimestampMilliseconds = null;
  }

  private readonly frame: FrameRequestCallback = (timestampMilliseconds) => {
    if (!this.running) {
      return;
    }

    if (this.lastTimestampMilliseconds !== null) {
      const elapsedSeconds = Math.max(
        0,
        (timestampMilliseconds - this.lastTimestampMilliseconds) / 1000,
      );
      const frameDeltaSeconds = Math.min(
        elapsedSeconds,
        this.options.maxFrameDeltaSeconds,
      );
      this.accumulatorSeconds += frameDeltaSeconds;

      while (this.accumulatorSeconds >= this.options.fixedStepSeconds) {
        this.options.update(this.options.fixedStepSeconds);
        this.accumulatorSeconds -= this.options.fixedStepSeconds;
      }
    }

    this.lastTimestampMilliseconds = timestampMilliseconds;
    this.options.render();
    this.requestId = this.scheduler.request(this.frame);
  };
}
