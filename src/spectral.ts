// The shell: runs the pinned Spectral binary over a batch of documents. One process per batch,
// because Spectral's startup dominates the cost of linting a small document.

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { codesByFile, parseResults } from "./results.ts";
import type { JsonObject } from "./spec.ts";

const root = resolve(import.meta.dirname, "..");
export const rulesetPath = join(root, "spectral", "api-standards.yaml");

function spectralBin(): string {
  return process.env["SPECTRAL_BIN"] ?? join(root, ".tools", "spectral");
}

/** Lint files on disk; returns the rule codes reported per file. */
export function lintFiles(files: readonly string[]): Map<string, Set<string>> {
  const run = spawnSync(
    spectralBin(),
    ["lint", "--quiet", "--format", "json", "--fail-severity", "error", "--ruleset", rulesetPath, ...files],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (run.error !== undefined) {
    throw new Error(`could not run spectral (run scripts/install-spectral.sh first): ${run.error.message}`);
  }
  // Exit 1 just means errors were found. Anything else, or output that isn't JSON, is a failure
  // of the tool, and the test has to say so rather than read it as "no results".
  if (run.status !== 0 && run.status !== 1) {
    throw new Error(`spectral exited ${String(run.status)}: ${run.stderr}`);
  }
  return codesByFile(files, parseResults(JSON.parse(run.stdout)));
}

/** Lint in-memory documents, keyed by name. */
export function lintDocuments(docs: ReadonlyMap<string, JsonObject>): Map<string, Set<string>> {
  const dir = mkdtempSync(join(tmpdir(), "api-standards-"));
  try {
    const byFile = new Map<string, string>();
    let i = 0;
    for (const [name, doc] of docs) {
      const file = join(dir, `${String(i++)}.json`);
      writeFileSync(file, JSON.stringify(doc));
      byFile.set(file, name);
    }
    const results = lintFiles([...byFile.keys()]);
    return new Map([...results].map(([file, codes]) => [byFile.get(file) ?? file, codes]));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
