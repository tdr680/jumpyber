const PRIMARY_KEYS = new Set([" ", "ArrowUp", "w", "W"]);
const PRIMARY_CODES = new Set(["Space", "ArrowUp", "KeyW"]);

export function isPrimaryKey(key: string, code: string): boolean {
  return PRIMARY_KEYS.has(key) || PRIMARY_CODES.has(code);
}

export function shouldQueueKeyboardAction(
  key: string,
  code: string,
  repeat: boolean,
): boolean {
  return !repeat && isPrimaryKey(key, code);
}

export class PrimaryActionBuffer {
  private pending = false;

  public queue(): void {
    this.pending = true;
  }

  public consume(): boolean {
    const wasPending = this.pending;
    this.pending = false;
    return wasPending;
  }

  public clear(): void {
    this.pending = false;
  }
}

export class InputController {
  private readonly actions = new PrimaryActionBuffer();
  private disposed = false;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly documentTarget: Document = document,
  ) {
    documentTarget.addEventListener("keydown", this.handleKeyDown);
    canvas.addEventListener("pointerdown", this.handlePointerDown);
  }

  public consumePrimaryAction(): boolean {
    return this.actions.consume();
  }

  public clear(): void {
    this.actions.clear();
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.actions.clear();
    this.documentTarget.removeEventListener("keydown", this.handleKeyDown);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (
      isEditableTarget(event.target) ||
      !shouldQueueKeyboardAction(event.key, event.code, event.repeat)
    ) {
      return;
    }

    event.preventDefault();
    this.actions.queue();
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    event.preventDefault();
    this.canvas.focus({ preventScroll: true });
    this.actions.queue();
  };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
