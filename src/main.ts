import { CanvasRenderer } from "./rendering/CanvasRenderer";
import "./styles/main.css";

function getCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");

  if (canvas === null) {
    throw new Error("Jumpyber could not start: #game-canvas was not found.");
  }

  return canvas;
}

const canvas = getCanvas();
const renderer = new CanvasRenderer(canvas);

renderer.renderFoundationScene();
canvas.dataset.scene = "foundation";
