import type { GameConfig } from "../config/gameConfig";
import type { GameSnapshot } from "../game/GameWorld";
import { getObstacleRectangles, type ObstaclePair } from "../game/Obstacle";
import type { PlayerState } from "../game/Player";
import { Viewport } from "./Viewport";

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly viewport: Viewport;

  public constructor(
    canvas: HTMLCanvasElement,
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
      this.drawObstaclePair(obstacle, snapshot.worldDistance);
    }
    this.drawPlayer(snapshot.player);

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
    worldDistance: number,
  ): void {
    const rectangles = getObstacleRectangles(
      obstacle,
      worldDistance,
      this.config.world.height,
    );
    this.drawObstacleRectangle(rectangles.top, "bottom");
    this.drawObstacleRectangle(rectangles.bottom, "top");
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

  private drawPlayer(player: Readonly<PlayerState>): void {
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
