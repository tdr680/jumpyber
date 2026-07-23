import { GameApp } from "./app/GameApp";
import { gameConfig } from "./config/gameConfig";
import "./styles/main.css";

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (element === null) {
    throw new Error(`Jumpyber could not start: ${selector} was not found.`);
  }

  return element;
}

const app = new GameApp({
  canvas: getElement<HTMLCanvasElement>("#game-canvas"),
  statusElement: getElement<HTMLElement>("#game-status"),
  config: gameConfig,
});

app.start();
window.addEventListener("pagehide", () => app.dispose(), { once: true });
