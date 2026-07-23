export const GameState = {
  Ready: "ready",
  Playing: "playing",
  GameOver: "gameOver",
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];
