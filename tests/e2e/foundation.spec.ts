import { expect, test } from "@playwright/test";

test("loads and renders the responsive foundation scene", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Jumpyber" })).toBeVisible();

  const canvas = page.locator("#game-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-scene", "foundation");

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
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
