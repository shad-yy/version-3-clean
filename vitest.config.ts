import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Playwright specs live in e2e/ and are run by `npm run playwright:test`.
    // If one lands in tests/ Vitest crashes trying to collect it.
    exclude: ["**/node_modules/**", "**/e2e/**", "**/*.spec.ts"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
})



