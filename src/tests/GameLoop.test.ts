import { describe, expect, it, vi } from "vitest";

import { GameLoop, type FrameScheduler } from "../app/GameLoop";

class FakeFrameScheduler implements FrameScheduler {
  private callback: FrameRequestCallback | null = null;
  private nextRequestId = 1;
  public readonly cancelled: number[] = [];

  public request(callback: FrameRequestCallback): number {
    this.callback = callback;
    return this.nextRequestId++;
  }

  public cancel(requestId: number): void {
    this.cancelled.push(requestId);
    this.callback = null;
  }

  public runFrame(timestampMilliseconds: number): void {
    const callback = this.callback;
    this.callback = null;
    callback?.(timestampMilliseconds);
  }
}

describe("GameLoop", () => {
  it("uses fixed updates and renders once per animation frame", () => {
    const scheduler = new FakeFrameScheduler();
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({
      fixedStepSeconds: 0.01,
      maxFrameDeltaSeconds: 0.1,
      update,
      render,
      scheduler,
    });

    loop.start();
    scheduler.runFrame(1_000);
    scheduler.runFrame(1_025);

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith(0.01);
    expect(render).toHaveBeenCalledTimes(2);
  });

  it("clamps unusually large frame deltas", () => {
    const scheduler = new FakeFrameScheduler();
    const update = vi.fn();
    const loop = new GameLoop({
      fixedStepSeconds: 0.01,
      maxFrameDeltaSeconds: 0.1,
      update,
      render: vi.fn(),
      scheduler,
    });

    loop.start();
    scheduler.runFrame(0);
    scheduler.runFrame(1_000);

    expect(update).toHaveBeenCalledTimes(10);
  });

  it("does not duplicate loops and cancels the active request", () => {
    const scheduler = new FakeFrameScheduler();
    const loop = new GameLoop({
      fixedStepSeconds: 0.01,
      maxFrameDeltaSeconds: 0.1,
      update: vi.fn(),
      render: vi.fn(),
      scheduler,
    });

    loop.start();
    loop.start();
    loop.stop();

    expect(scheduler.cancelled).toEqual([1]);
  });
});
