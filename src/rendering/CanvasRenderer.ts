const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 600;

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;

  public constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");

    if (context === null) {
      throw new Error("Jumpyber could not start: Canvas 2D is unavailable.");
    }

    this.context = context;
  }

  public renderFoundationScene(): void {
    const context = this.context;
    const sky = context.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);

    sky.addColorStop(0, "#d8f2ff");
    sky.addColorStop(0.62, "#f7e9c6");
    sky.addColorStop(1, "#f3c989");
    context.fillStyle = sky;
    context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    this.drawCloud(76, 94, 0.9);
    this.drawCloud(315, 154, 0.65);

    context.fillStyle = "#9dc8b4";
    context.beginPath();
    context.moveTo(0, 430);
    context.quadraticCurveTo(90, 350, 180, 438);
    context.quadraticCurveTo(285, 330, 400, 422);
    context.lineTo(400, 600);
    context.lineTo(0, 600);
    context.closePath();
    context.fill();

    this.drawObstacle(304, 0, 68, 196);
    this.drawObstacle(304, 366, 68, 234);
    this.drawPlayer(118, 286);

    context.fillStyle = "rgba(20, 42, 54, 0.82)";
    context.font = "700 38px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText("Jumpyber", LOGICAL_WIDTH / 2, 66);

    context.font = "600 16px system-ui, sans-serif";
    context.fillText("Foundation ready", LOGICAL_WIDTH / 2, 548);
    context.font = "14px system-ui, sans-serif";
    context.fillText("The first jump comes next.", LOGICAL_WIDTH / 2, 574);
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

  private drawObstacle(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const context = this.context;

    context.fillStyle = "#315f5a";
    context.fillRect(x, y, width, height);
    context.fillStyle = "#4f8177";
    context.fillRect(x + 8, y, 12, height);
    context.fillStyle = "#234844";
    context.fillRect(x - 6, y === 0 ? height - 18 : y, width + 12, 18);
  }

  private drawPlayer(x: number, y: number): void {
    const context = this.context;

    context.save();
    context.translate(x, y);
    context.rotate(-0.12);

    context.strokeStyle = "#172f3a";
    context.lineCap = "round";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(0, 15);
    context.lineTo(0, 48);
    context.moveTo(0, 28);
    context.lineTo(-24, 10);
    context.moveTo(0, 28);
    context.lineTo(24, 6);
    context.moveTo(0, 47);
    context.lineTo(-18, 72);
    context.moveTo(0, 47);
    context.lineTo(22, 67);
    context.stroke();

    context.fillStyle = "#ff6b4a";
    context.beginPath();
    context.arc(0, 0, 18, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#172f3a";
    context.beginPath();
    context.arc(6, -4, 2.8, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}
