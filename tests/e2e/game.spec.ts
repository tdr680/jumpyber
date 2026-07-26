import { expect, test, type Page } from "@playwright/test";

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

test("loads and renders the responsive ready state", async ({ page }) => {
  const errors = await expectCleanPage(page);
  await expect(page.getByRole("heading", { name: "Jumpyber" })).toBeVisible();

  const canvas = page.locator("#game-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-game-state", "ready");

  const initialSize = await canvas.boundingBox();
  expect(initialSize?.width).toBeGreaterThan(0);
  expect(initialSize?.height).toBeGreaterThan(0);

  const centerPixelAlpha = await canvas.evaluate((element) => {
    const context = element.getContext("2d");
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
