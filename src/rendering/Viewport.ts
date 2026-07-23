import type { Size } from "../core/types";

export interface ViewportMetrics {
  readonly cssWidth: number;
  readonly cssHeight: number;
  readonly backingWidth: number;
  readonly backingHeight: number;
  readonly devicePixelRatio: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

export function calculateViewportMetrics(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
  logicalSize: Size,
  maxDevicePixelRatio: number,
): ViewportMetrics {
  const safeCssWidth = Math.max(1, cssWidth);
  const safeCssHeight = Math.max(1, cssHeight);
  const safeDevicePixelRatio = Math.min(
    Math.max(1, devicePixelRatio),
    maxDevicePixelRatio,
  );
  const backingWidth = Math.max(
    1,
    Math.round(safeCssWidth * safeDevicePixelRatio),
  );
  const backingHeight = Math.max(
    1,
    Math.round(safeCssHeight * safeDevicePixelRatio),
  );

  return {
    cssWidth: safeCssWidth,
    cssHeight: safeCssHeight,
    backingWidth,
    backingHeight,
    devicePixelRatio: safeDevicePixelRatio,
    scaleX: backingWidth / logicalSize.width,
    scaleY: backingHeight / logicalSize.height,
  };
}

export class Viewport {
  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly logicalSize: Size,
    private readonly maxDevicePixelRatio: number,
  ) {}

  public prepare(context: CanvasRenderingContext2D): ViewportMetrics {
    const metrics = calculateViewportMetrics(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      window.devicePixelRatio,
      this.logicalSize,
      this.maxDevicePixelRatio,
    );

    if (
      this.canvas.width !== metrics.backingWidth ||
      this.canvas.height !== metrics.backingHeight
    ) {
      this.canvas.width = metrics.backingWidth;
      this.canvas.height = metrics.backingHeight;
    }

    context.setTransform(metrics.scaleX, 0, 0, metrics.scaleY, 0, 0);
    return metrics;
  }
}
