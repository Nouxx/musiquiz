import { defineConfig } from "vitest/config";

// tsconfig sets `jsx: preserve` for the Studio bundler, which vite cannot parse
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
});
