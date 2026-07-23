import { describe, expect, it } from "vitest";

import {
  isPrimaryKey,
  PrimaryActionBuffer,
  shouldQueueKeyboardAction,
} from "../input/InputController";

describe("input normalization", () => {
  it.each([
    [" ", "Space"],
    ["ArrowUp", "ArrowUp"],
    ["w", "KeyW"],
    ["W", "KeyW"],
  ])("accepts primary key %s", (key, code) => {
    expect(isPrimaryKey(key, code)).toBe(true);
  });

  it("rejects unrelated and repeated keys", () => {
    expect(isPrimaryKey("Escape", "Escape")).toBe(false);
    expect(shouldQueueKeyboardAction(" ", "Space", true)).toBe(false);
  });

  it("coalesces actions until the simulation consumes them", () => {
    const actions = new PrimaryActionBuffer();

    actions.queue();
    actions.queue();
    expect(actions.consume()).toBe(true);
    expect(actions.consume()).toBe(false);
  });

  it("clears pending input", () => {
    const actions = new PrimaryActionBuffer();

    actions.queue();
    actions.clear();
    expect(actions.consume()).toBe(false);
  });
});
