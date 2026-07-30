import type {
  ParallaxLayerConfig,
  ParallaxMotionSource,
} from "../config/gameConfig";

export type BackgroundAssetStatus =
  "loading" | "loaded" | "partial" | "fallback";

interface LoadedParallaxLayer {
  readonly config: ParallaxLayerConfig;
  readonly image: HTMLImageElement;
  settled: boolean;
  ready: boolean;
}

export function getParallaxTravel(
  motionSource: ParallaxMotionSource,
  worldDistance: number,
  cameraOffset: number,
): number {
  return motionSource === "world" ? worldDistance : cameraOffset;
}

export function wrapParallaxOffset(
  travel: number,
  scrollFactor: number,
  repeatSpan: number,
): number {
  if (repeatSpan <= 0) {
    throw new Error("A repeating parallax layer needs a positive span.");
  }

  const offset = (travel * scrollFactor) % repeatSpan;
  return offset < 0 ? offset + repeatSpan : offset;
}

export function getFirstRepeatedX(offset: number): number {
  return -offset;
}

export function getRequiredRepeatCount(
  firstX: number,
  viewportWidth: number,
  repeatSpan: number,
): number {
  if (repeatSpan <= 0) {
    throw new Error("A repeating parallax layer needs a positive span.");
  }

  return Math.max(0, Math.ceil((viewportWidth - firstX) / repeatSpan));
}

export class ParallaxBackground {
  private readonly layers: LoadedParallaxLayer[];

  public constructor(
    layerConfigs: readonly ParallaxLayerConfig[],
    baseUrl: string,
    private readonly onStatusChange: (status: BackgroundAssetStatus) => void,
  ) {
    this.layers = layerConfigs.map((config) => {
      const layer: LoadedParallaxLayer = {
        config,
        image: new Image(),
        settled: false,
        ready: false,
      };

      layer.image.addEventListener("load", () => {
        layer.settled = true;
        layer.ready = this.hasExpectedDimensions(layer);
        this.reportStatus();
      });
      layer.image.addEventListener("error", () => {
        layer.settled = true;
        layer.ready = false;
        this.reportStatus();
      });
      layer.image.src = `${baseUrl}${config.imagePath}`;
      return layer;
    });

    this.reportStatus();
  }

  public render(
    context: CanvasRenderingContext2D,
    viewportWidth: number,
    worldDistance: number,
    cameraOffset = 0,
  ): void {
    for (const layer of this.layers) {
      if (!layer.ready) {
        continue;
      }

      const { config } = layer;
      const travel = getParallaxTravel(
        config.motionSource,
        worldDistance,
        cameraOffset,
      );

      context.save();
      context.globalAlpha = config.opacity;

      if (config.repeatMode === "none") {
        context.drawImage(
          layer.image,
          -travel * config.scrollFactor,
          config.verticalOffset,
          config.drawSize.width,
          config.drawSize.height,
        );
        context.restore();
        continue;
      }

      const repeatSpan = config.drawSize.width + config.spacing;
      const offset = wrapParallaxOffset(
        travel,
        config.scrollFactor,
        repeatSpan,
      );
      const firstX = getFirstRepeatedX(offset);
      const repeatCount = getRequiredRepeatCount(
        firstX,
        viewportWidth,
        repeatSpan,
      );

      for (let index = 0; index < repeatCount; index += 1) {
        context.drawImage(
          layer.image,
          firstX + index * repeatSpan,
          config.verticalOffset,
          config.drawSize.width,
          config.drawSize.height,
        );
      }
      context.restore();
    }
  }

  private hasExpectedDimensions(layer: LoadedParallaxLayer): boolean {
    return (
      layer.image.complete &&
      layer.image.naturalWidth === layer.config.sourceSize.width &&
      layer.image.naturalHeight === layer.config.sourceSize.height
    );
  }

  private reportStatus(): void {
    let settledCount = 0;
    let readyCount = 0;

    for (const layer of this.layers) {
      if (layer.settled) {
        settledCount += 1;
      }
      if (layer.ready) {
        readyCount += 1;
      }
    }

    if (settledCount < this.layers.length) {
      this.onStatusChange("loading");
    } else if (readyCount === this.layers.length) {
      this.onStatusChange("loaded");
    } else if (readyCount > 0) {
      this.onStatusChange("partial");
    } else {
      this.onStatusChange("fallback");
    }
  }
}
