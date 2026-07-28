import type { GameConfig } from "../config/gameConfig";
import type { GameSnapshot } from "../game/GameWorld";
import { getObstacleRectangles, type ObstaclePair } from "../game/Obstacle";
import type { PlayerState } from "../game/Player";
import { Viewport } from "./Viewport";
import {
  getPlayerSpriteFrameIndex,
  selectPlayerSpriteFrame,
} from "./PlayerSprite";
import {
  createObstacleSpriteAssembly,
  type ObstacleSpritePost,
  type ObstacleSpriteSection,
  usesDamagedObstacleCap,
} from "./ObstacleSprite";

interface ObstacleSpriteImages {
  readonly cap: HTMLImageElement;
  readonly body: HTMLImageElement;
  readonly base: HTMLImageElement;
  readonly damagedCap: HTMLImageElement;
}

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly viewport: Viewport;
  private readonly playerSpriteImage: HTMLImageElement;
  private readonly obstacleSpriteImages: ObstacleSpriteImages;
  private obstacleSpriteLoadFailed = false;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: GameConfig,
  ) {
    const context = canvas.getContext("2d");

    if (context === null) {
      throw new Error("Jumpyber could not start: Canvas 2D is unavailable.");
    }

    this.context = context;
    this.viewport = new Viewport(
      canvas,
      config.world,
      config.viewport.maxDevicePixelRatio,
    );
    this.playerSpriteImage = new Image();
    this.canvas.dataset.playerSprite = "loading";
    this.playerSpriteImage.addEventListener("load", () => {
      this.canvas.dataset.playerSprite = "loaded";
    });
    this.playerSpriteImage.addEventListener("error", () => {
      this.canvas.dataset.playerSprite = "fallback";
    });
    this.playerSpriteImage.src = `${import.meta.env.BASE_URL}${config.playerSprite.imagePath}`;

    this.obstacleSpriteImages = {
      cap: new Image(),
      body: new Image(),
      base: new Image(),
      damagedCap: new Image(),
    };
    this.canvas.dataset.obstacleSprites = "loading";
    this.loadObstacleSprites();
  }

  public render(snapshot: GameSnapshot): void {
    const context = this.context;
    const { width, height } = this.config.world;
    const { colors } = this.config;
    this.viewport.prepare(context);
    context.clearRect(0, 0, width, height);
    const sky = context.createLinearGradient(0, 0, 0, height);

    sky.addColorStop(0, colors.skyTop);
    sky.addColorStop(0.62, colors.skyMiddle);
    sky.addColorStop(1, colors.skyBottom);
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    this.drawCloud(76, 94, 0.9);
    this.drawCloud(315, 154, 0.65);

    this.drawTerrain(snapshot);

    for (const obstacle of snapshot.obstacles) {
      this.drawObstaclePair(obstacle, snapshot);
    }
    this.drawPlayer(snapshot);

    this.drawInterface(snapshot);
  }

  private drawCloud(x: number, y: number, scale: number): void {
    const context = this.context;

    context.save();
    context.translate(x, y);
    context.scale(scale, scale);
    context.fillStyle = "rgba(255, 255, 255, 0.72)";
    context.beginPath();
    context.arc(-28, 8, 22, 0, Math.PI * 2);
    context.arc(0, 0, 31, 0, Math.PI * 2);
    context.arc(31, 10, 20, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  private drawTerrain(snapshot: GameSnapshot): void {
    const context = this.context;
    const { width, height } = this.config.world;
    const { passageHalfHeight, renderSampleSpacing } = this.config.terrain;
    const points: Array<{
      readonly x: number;
      readonly upperY: number;
      readonly lowerY: number;
    }> = [];

    for (let x = 0; x <= width; x += renderSampleSpacing) {
      const sample = snapshot.terrain.sampleAt(snapshot.worldDistance + x);
      points.push({
        x,
        upperY: sample.height - passageHalfHeight,
        lowerY: sample.height + passageHalfHeight,
      });
    }

    if (points.at(-1)?.x !== width) {
      const sample = snapshot.terrain.sampleAt(snapshot.worldDistance + width);
      points.push({
        x: width,
        upperY: sample.height - passageHalfHeight,
        lowerY: sample.height + passageHalfHeight,
      });
    }

    context.save();
    context.fillStyle = this.config.colors.distantGround;
    context.globalAlpha = 0.58;

    context.beginPath();
    context.moveTo(0, 0);
    for (const point of points) {
      context.lineTo(point.x, point.upperY);
    }
    context.lineTo(width, 0);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(0, height);
    for (const point of points) {
      context.lineTo(point.x, point.lowerY);
    }
    context.lineTo(width, height);
    context.closePath();
    context.fill();

    context.globalAlpha = 0.9;
    context.strokeStyle = this.config.colors.obstacleEdge;
    context.lineWidth = 3;
    for (const edge of ["upperY", "lowerY"] as const) {
      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point[edge]);
        } else {
          context.lineTo(point.x, point[edge]);
        }
      });
      context.stroke();
    }
    context.restore();
  }

  private drawObstaclePair(
    obstacle: Readonly<ObstaclePair>,
    snapshot: GameSnapshot,
  ): void {
    const rectangles = getObstacleRectangles(
      obstacle,
      snapshot.worldDistance,
      this.config.world.height,
    );
    const terrainSample = snapshot.terrain.sampleAt(
      obstacle.worldX + obstacle.width / 2,
    );

    if (this.obstacleSpritesReady()) {
      const assembly = createObstacleSpriteAssembly(
        rectangles,
        obstacle.terrainHeight,
        terrainSample.slope,
        this.config.terrain.passageHalfHeight,
        this.config.obstacleSprite,
      );
      const capImage = usesDamagedObstacleCap(
        obstacle.worldX,
        this.config.obstacles.horizontalSpacing,
        this.config.obstacleSprite.damagedCapInterval,
      )
        ? this.obstacleSpriteImages.damagedCap
        : this.obstacleSpriteImages.cap;

      this.drawObstacleSpritePost(
        assembly.upper,
        capImage,
        assembly.terrainAngleRadians,
      );
      this.drawObstacleSpritePost(
        assembly.lower,
        capImage,
        assembly.terrainAngleRadians,
      );
      return;
    }

    this.drawObstacleRectangle(rectangles.top, "bottom");
    this.drawObstacleRectangle(rectangles.bottom, "top");
  }

  private loadObstacleSprites(): void {
    const { obstacleSprite } = this.config;
    const sources: ReadonlyArray<readonly [HTMLImageElement, string]> = [
      [this.obstacleSpriteImages.cap, obstacleSprite.capImagePath],
      [this.obstacleSpriteImages.body, obstacleSprite.bodyImagePath],
      [this.obstacleSpriteImages.base, obstacleSprite.baseImagePath],
      [
        this.obstacleSpriteImages.damagedCap,
        obstacleSprite.damagedCapImagePath,
      ],
    ];

    for (const [image, path] of sources) {
      image.addEventListener("load", () => {
        if (this.obstacleSpritesReady()) {
          this.canvas.dataset.obstacleSprites = "loaded";
        }
      });
      image.addEventListener("error", () => {
        this.obstacleSpriteLoadFailed = true;
        this.canvas.dataset.obstacleSprites = "fallback";
      });
      image.src = `${import.meta.env.BASE_URL}${path}`;
    }
  }

  private obstacleSpritesReady(): boolean {
    if (this.obstacleSpriteLoadFailed) {
      return false;
    }

    const { obstacleSprite } = this.config;
    const requirements: ReadonlyArray<
      readonly [HTMLImageElement, Readonly<{ width: number; height: number }>]
    > = [
      [this.obstacleSpriteImages.cap, obstacleSprite.capSourceSize],
      [this.obstacleSpriteImages.body, obstacleSprite.bodySourceSize],
      [this.obstacleSpriteImages.base, obstacleSprite.baseSourceSize],
      [this.obstacleSpriteImages.damagedCap, obstacleSprite.capSourceSize],
    ];

    return requirements.every(
      ([image, size]) =>
        image.complete &&
        image.naturalWidth === size.width &&
        image.naturalHeight === size.height,
    );
  }

  private drawObstacleSpritePost(
    post: Readonly<ObstacleSpritePost>,
    capImage: CanvasImageSource,
    terrainAngleRadians: number,
  ): void {
    this.drawObstacleBodyTiles(post.body);
    this.drawObstacleSpriteSection(capImage, post.cap, 0);
    this.drawObstacleSpriteSection(
      this.obstacleSpriteImages.base,
      post.base,
      terrainAngleRadians,
    );
  }

  private drawObstacleBodyTiles(
    rectangle: Readonly<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>,
  ): void {
    const { bodySourceSize, bodyTileHeight } = this.config.obstacleSprite;
    let destinationY = rectangle.y;
    let remainingHeight = rectangle.height;

    while (remainingHeight > 0) {
      const destinationHeight = Math.min(bodyTileHeight, remainingHeight);
      const sourceHeight =
        (destinationHeight / bodyTileHeight) * bodySourceSize.height;
      this.context.drawImage(
        this.obstacleSpriteImages.body,
        0,
        0,
        bodySourceSize.width,
        sourceHeight,
        rectangle.x,
        destinationY,
        rectangle.width,
        destinationHeight,
      );
      destinationY += destinationHeight;
      remainingHeight -= destinationHeight;
    }
  }

  private drawObstacleSpriteSection(
    image: CanvasImageSource,
    section: Readonly<ObstacleSpriteSection>,
    rotationRadians: number,
  ): void {
    const { rectangle, flipVertically } = section;
    const context = this.context;

    context.save();
    context.translate(
      rectangle.x + rectangle.width / 2,
      rectangle.y + rectangle.height / 2,
    );
    context.rotate(rotationRadians);
    context.scale(1, flipVertically ? -1 : 1);
    context.drawImage(
      image,
      -rectangle.width / 2,
      -rectangle.height / 2,
      rectangle.width,
      rectangle.height,
    );
    context.restore();
  }

  private drawObstacleRectangle(
    rectangle: Readonly<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>,
    gapEdge: "top" | "bottom",
  ): void {
    const context = this.context;
    const edgeHeight = Math.min(18, rectangle.height);
    const edgeY =
      gapEdge === "top"
        ? rectangle.y
        : rectangle.y + rectangle.height - edgeHeight;

    context.fillStyle = this.config.colors.obstacle;
    context.fillRect(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height,
    );
    context.fillStyle = this.config.colors.obstacleHighlight;
    context.fillRect(
      rectangle.x + 8,
      rectangle.y,
      Math.min(12, rectangle.width - 8),
      rectangle.height,
    );
    context.fillStyle = this.config.colors.obstacleEdge;
    context.fillRect(rectangle.x, edgeY, rectangle.width, edgeHeight);
  }

  private drawPlayer(snapshot: GameSnapshot): void {
    const frame = selectPlayerSpriteFrame(
      snapshot.state,
      snapshot.player.velocityY,
      this.config.playerSprite,
    );
    this.canvas.dataset.playerFrame = frame;

    if (
      this.playerSpriteImage.complete &&
      this.playerSpriteImage.naturalWidth >=
        this.config.playerSprite.frameSize *
          this.config.playerSprite.frameCount &&
      this.playerSpriteImage.naturalHeight >= this.config.playerSprite.frameSize
    ) {
      const frameIndex = getPlayerSpriteFrameIndex(frame);
      const { frameSize, drawSize } = this.config.playerSprite;
      this.context.drawImage(
        this.playerSpriteImage,
        frameIndex * frameSize,
        0,
        frameSize,
        frameSize,
        snapshot.player.x - drawSize / 2,
        snapshot.player.y - drawSize / 2,
        drawSize,
        drawSize,
      );
      return;
    }

    this.drawFallbackPlayer(snapshot.player);
  }

  private drawFallbackPlayer(player: Readonly<PlayerState>): void {
    const context = this.context;

    context.save();
    context.translate(player.x, player.y);
    context.rotate(-0.08);

    context.strokeStyle = this.config.colors.ink;
    context.lineCap = "round";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(-7, 5);
    context.lineTo(-20, -3);
    context.moveTo(7, 5);
    context.lineTo(20, -6);
    context.moveTo(-5, 12);
    context.lineTo(-12, 25);
    context.moveTo(5, 12);
    context.lineTo(13, 24);
    context.stroke();

    context.fillStyle = this.config.colors.player;
    context.beginPath();
    context.arc(0, 0, player.radius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = this.config.colors.ink;
    context.beginPath();
    context.arc(6, -4, 2.8, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  private drawInterface(snapshot: GameSnapshot): void {
    const context = this.context;
    const centerX = this.config.world.width / 2;
    context.save();
    context.textAlign = "center";

    if (snapshot.state === "playing") {
      context.fillStyle = this.config.colors.ink;
      context.font = "800 44px system-ui, sans-serif";
      context.fillText(String(snapshot.score), centerX, 68);
      context.restore();
      return;
    }

    if (snapshot.state === "ready") {
      context.fillStyle = this.config.colors.ink;
      context.font = "800 40px system-ui, sans-serif";
      context.fillText("Jumpyber", centerX, 70);
      this.drawPanel(52, 458, 296, 92);
      context.fillStyle = "#ffffff";
      context.font = "700 18px system-ui, sans-serif";
      context.fillText("Press, click, or tap", centerX, 497);
      context.font = "15px system-ui, sans-serif";
      context.fillText("to jump", centerX, 526);
      context.restore();
      return;
    }

    this.drawPanel(48, 202, 304, 188);
    context.fillStyle = "#ffffff";
    context.font = "800 34px system-ui, sans-serif";
    context.fillText("Game over", centerX, 250);
    context.font = "700 22px system-ui, sans-serif";
    context.fillText(`Score ${String(snapshot.score)}`, centerX, 296);
    context.font = "16px system-ui, sans-serif";
    context.fillText("Press, click, or tap", centerX, 342);
    context.fillText("to restart", centerX, 368);
    context.restore();
  }

  private drawPanel(x: number, y: number, width: number, height: number): void {
    const context = this.context;
    context.fillStyle = "rgba(23, 47, 58, 0.9)";
    context.beginPath();
    context.roundRect(x, y, width, height, 18);
    context.fill();
  }
}
