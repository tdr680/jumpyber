/// <reference lib="dom" />

import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function expectCleanPage(page: Page): Promise<{
  consoleErrors: string[];
  pageErrors: string[];
}> {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("./");
  return { consoleErrors, pageErrors };
}

async function flapUntilScore(page: Page, targetScore: number): Promise<void> {
  const canvas = page.locator("#game-canvas");
  await page.keyboard.press("Space");
  const intervalId = await page.evaluate(() =>
    window.setInterval(() => {
      const gameCanvas =
        document.querySelector<HTMLCanvasElement>("#game-canvas");

      if (
        gameCanvas?.dataset.gameState === "playing" &&
        Number(gameCanvas.dataset.playerY) > 315 &&
        Number(gameCanvas.dataset.playerVelocityY) > 0
      ) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            bubbles: true,
            code: "Space",
            key: " ",
          }),
        );
      }
    }, 10),
  );

  try {
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-score")), {
        timeout: 7_000,
      })
      .toBeGreaterThanOrEqual(targetScore);
  } finally {
    await page.evaluate((id) => window.clearInterval(id), intervalId);
  }
}

test("loads and renders the responsive ready state", async ({ page }) => {
  const errors = await expectCleanPage(page);
  await expect(page.getByRole("heading", { name: "Jumpyber" })).toBeVisible();

  const canvas = page.locator("#game-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-game-state", "ready");
  await expect(canvas).toHaveAttribute("data-player-sprite", "loaded");
  await expect(canvas).toHaveAttribute("data-obstacle-sprites", "loaded");
  await expect(canvas).toHaveAttribute("data-background-sprites", "loaded");
  await expect(canvas).toHaveAttribute("data-player-frame", "ready");

  const initialSize = await canvas.boundingBox();
  expect(initialSize?.width).toBeGreaterThan(0);
  expect(initialSize?.height).toBeGreaterThan(0);

  const centerPixelAlpha = await canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext("2d");
    return context?.getImageData(200, 300, 1, 1).data[3] ?? 0;
  });
  expect(centerPixelAlpha).toBeGreaterThan(0);

  await page.setViewportSize({ width: 375, height: 667 });
  await expect(canvas).toBeVisible();

  const resizedSize = await canvas.boundingBox();
  expect(resizedSize?.width).toBeGreaterThan(0);
  expect(resizedSize?.height).toBeGreaterThan(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test("keyboard input starts the game", async ({ page }) => {
  await expectCleanPage(page);
  await page.keyboard.press("Space");
  await expect(page.locator("#game-canvas")).toHaveAttribute(
    "data-game-state",
    "playing",
  );
});

test("player sprite follows jump velocity through stable pose bands", async ({
  page,
}) => {
  await expectCleanPage(page);
  const canvas = page.locator("#game-canvas");

  await expect(canvas).toHaveAttribute("data-player-sprite", "loaded");
  await expect(canvas).toHaveAttribute("data-player-frame", "ready");
  await page.evaluate(() => {
    const gameCanvas =
      document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (gameCanvas === null) {
      throw new Error("Game canvas is unavailable.");
    }

    const observedFrames = [gameCanvas.dataset.playerFrame];
    const observer = new MutationObserver(() => {
      observedFrames.push(gameCanvas.dataset.playerFrame);
    });
    observer.observe(gameCanvas, {
      attributeFilter: ["data-player-frame"],
      attributes: true,
    });
    window.setTimeout(() => observer.disconnect(), 1_000);
    (
      window as typeof window & {
        observedPlayerFrames?: Array<string | undefined>;
      }
    ).observedPlayerFrames = observedFrames;
  });
  await page.keyboard.press("Space");
  await page.waitForTimeout(700);

  const observedFrames = await page.evaluate(
    () =>
      (
        window as typeof window & {
          observedPlayerFrames?: Array<string | undefined>;
        }
      ).observedPlayerFrames ?? [],
  );
  expect(observedFrames).toEqual(
    expect.arrayContaining(["ready", "jump", "rise", "apex", "fall"]),
  );
});

test("pointer input starts the game", async ({ page }) => {
  await expectCleanPage(page);
  const canvas = page.locator("#game-canvas");
  await canvas.click();
  await expect(canvas).toHaveAttribute("data-game-state", "playing");
});

test("touch pointer input starts the game", async ({ page }) => {
  await expectCleanPage(page);
  const canvas = page.locator("#game-canvas");
  await canvas.dispatchEvent("pointerdown", {
    button: 0,
    isPrimary: true,
    pointerType: "touch",
  });
  await expect(canvas).toHaveAttribute("data-game-state", "playing");
});

test("procedural terrain advances and scoring remains one per obstacle", async ({
  page,
}) => {
  const errors = await expectCleanPage(page);
  const canvas = page.locator("#game-canvas");

  await expect(canvas).toHaveAttribute("data-world-distance", "0.000");
  await expect(canvas).toHaveAttribute("data-terrain-height", "300.000");
  await expect(canvas).toHaveAttribute("data-terrain-slope", "0.000000");

  await flapUntilScore(page, 1);

  const worldDistance = Number(
    await canvas.getAttribute("data-world-distance"),
  );
  const terrainSlope = Number(await canvas.getAttribute("data-terrain-slope"));

  expect(worldDistance).toBeGreaterThan(400);
  expect(Math.abs(terrainSlope)).toBeGreaterThan(0.001);
  await expect(canvas).toHaveAttribute("data-score", "1");
  await page.waitForTimeout(150);
  await expect(canvas).toHaveAttribute("data-score", "1");
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test("terrain collision reaches game over and restart resets the opening", async ({
  page,
}) => {
  await expectCleanPage(page);
  const canvas = page.locator("#game-canvas");

  await page.keyboard.press("Space");
  await expect(canvas).toHaveAttribute("data-game-state", "gameOver", {
    timeout: 4_000,
  });
  await expect(canvas).toHaveAttribute("data-player-frame", "hit");

  await page.waitForTimeout(300);
  await canvas.click();

  await expect(canvas).toHaveAttribute("data-game-state", "playing");
  await expect(canvas).toHaveAttribute("data-score", "0");
  expect(Number(await canvas.getAttribute("data-world-distance"))).toBeLessThan(
    200,
  );
  await expect(canvas).toHaveAttribute("data-terrain-height", "300.000");
  await expect(canvas).toHaveAttribute("data-terrain-slope", "0.000000");
});
