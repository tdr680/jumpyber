import type { GameConfig } from "../config/gameConfig";
import { validateGameConfig } from "../config/gameConfig";
import { GameWorld } from "../game/GameWorld";
import { InputController } from "../input/InputController";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { GameLoop } from "./GameLoop";

export interface GameAppOptions {
  readonly canvas: HTMLCanvasElement;
  readonly statusElement: HTMLElement;
  readonly config: GameConfig;
}

export class GameApp {
  private readonly renderer: CanvasRenderer;
  private readonly world: GameWorld;
  private readonly loop: GameLoop;
  private readonly input: InputController;
  private started = false;

  public constructor(private readonly options: GameAppOptions) {
    validateGameConfig(options.config);
    this.renderer = new CanvasRenderer(options.canvas, options.config);
    this.world = new GameWorld(options.config);
    this.input = new InputController(options.canvas);
    this.loop = new GameLoop({
      fixedStepSeconds: options.config.loop.fixedStepSeconds,
      maxFrameDeltaSeconds: options.config.loop.maxFrameDeltaSeconds,
      update: (deltaSeconds) => this.update(deltaSeconds),
      render: () => this.render(),
    });
  }

  public start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.syncBrowserState();
    this.loop.start();
  }

  public dispose(): void {
    if (!this.started) {
      return;
    }

    this.started = false;
    this.loop.stop();
    this.input.dispose();
  }

  private render(): void {
    const snapshot = this.world.snapshot;
    this.renderer.render(snapshot);
    this.syncBrowserState();
  }

  private update(deltaSeconds: number): void {
    const previousState = this.world.snapshot.state;
    this.world.update(deltaSeconds, this.input.consumePrimaryAction());

    if (
      previousState === "gameOver" &&
      this.world.snapshot.state === "playing"
    ) {
      this.input.clear();
    }
  }

  private syncBrowserState(): void {
    const { state } = this.world.snapshot;
    const { score } = this.world.snapshot;
    this.options.canvas.dataset.gameState = state;
    this.options.canvas.dataset.score = String(score);

    if (state === "ready") {
      this.options.statusElement.textContent = "Ready — Space, click, or tap";
      this.options.canvas.setAttribute(
        "aria-label",
        "Jumpyber game. Ready. Press Space, W, Arrow Up, click, or tap to jump.",
      );
      return;
    }

    if (state === "playing") {
      this.options.statusElement.textContent = `Playing — Score ${String(score)}`;
      this.options.canvas.setAttribute(
        "aria-label",
        `Jumpyber game. Playing. Score ${String(score)}.`,
      );
      return;
    }

    this.options.statusElement.textContent = `Game over — Score ${String(score)} — Press to restart`;
    this.options.canvas.setAttribute(
      "aria-label",
      `Jumpyber game over. Score ${String(score)}. Press to restart.`,
    );
  }
}
