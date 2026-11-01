import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Each test file runs the Spectral binary once over a batch of documents; startup dominates.
    testTimeout: 60_000,
  },
});
