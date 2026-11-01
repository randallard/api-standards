// The examples are the standard's own illustrations, so they must lint with no results at all:
// no errors, no warnings, and nothing from spectral:oas either.

import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { lintFiles } from "../src/spectral.ts";

const dir = resolve(import.meta.dirname, "..", "examples");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => join(dir, f));

describe("examples", () => {
  it("exist", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  const results = lintFiles(files);
  for (const file of files) {
    it(`${file.slice(dir.length + 1)} lints clean`, () => {
      expect([...(results.get(file) ?? ["missing"])]).toEqual([]);
    });
  }
});
