import { defineConfig } from "vitest/config";

function resolveBasePath(value: string | undefined): string {
  const path = value?.replace(/^\/+|\/+$/gu, "");
  return path ? `/${path}/` : "/";
}

export default defineConfig({
  base: resolveBasePath(process.env.VITE_BASE_PATH),
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
