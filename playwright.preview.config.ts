import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = 4174;
const origin = `http://${host}:${String(port)}`;
const path = process.env.VITE_BASE_PATH?.replace(/^\/+|\/+$/gu, "");
const baseURL = path ? `${origin}/${path}/` : `${origin}/`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run preview -- --host ${host} --port ${String(port)}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
