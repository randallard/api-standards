// Property tests: the ruleset's naming rules agree with the standard's definitions (src/names.ts)
// across generated names, both conforming and not.
//
// Spectral runs as one process per batch, so instead of fc.assert (one lint per run, no batching)
// each property draws a fixed-seed sample, lints the whole batch once, and reports every
// disagreement. The seed is fixed so a failure reproduces exactly; change it to explore further.

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { isCamelCase, isKebabSegment, isVersionedPath, isWellFormedPath } from "../src/names.ts";
import { baseline, withExtraPath, withParameter, withThingProperty, type JsonObject } from "../src/spec.ts";
import { lintDocuments } from "../src/spectral.ts";

const SEED = 20261024;
const RUNS = 150;

const charRange = (from: string, to: string): fc.Arbitrary<string> =>
  fc.integer({ min: from.charCodeAt(0), max: to.charCodeAt(0) }).map((n) => String.fromCharCode(n));
const lower = charRange("a", "z");
const upper = charRange("A", "Z");
const digit = charRange("0", "9");
const noise = fc.constantFrom("_", "-", ".", "$", "A", "Z", "0");

const word = fc.array(fc.oneof(lower, digit), { minLength: 1, maxLength: 6 }).map((cs) => cs.join(""));
const kebab = fc.array(word, { minLength: 1, maxLength: 3 }).map((ws) => ws.join("-"));
const camel = fc
  .tuple(lower, fc.array(fc.oneof(lower, upper, digit), { maxLength: 10 }))
  .map(([h, t]) => h + t.join(""));

/** Conforming names plus near misses: one character swapped for something outside the rule. */
function withNearMisses(good: fc.Arbitrary<string>): fc.Arbitrary<string> {
  const broken = fc
    .tuple(good, fc.nat(), noise)
    .map(([s, i, c]) => {
      const at = i % s.length;
      return s.slice(0, at) + c + s.slice(at + 1);
    });
  return fc.oneof(good, broken, good.map((s) => s.toUpperCase()), good.map((s) => `${s}_x`));
}

/** Lint one document per sample and return the samples where the rule's verdict is wrong. */
function disagreements(
  samples: readonly string[],
  build: (name: string) => JsonObject,
  rule: string,
  conforms: (name: string) => boolean,
): string[] {
  const unique = [...new Set(samples)];
  const results = lintDocuments(new Map(unique.map((s) => [s, build(s)])));
  return unique.filter((s) => (results.get(s)?.has(rule) ?? false) === conforms(s));
}

const base = baseline();

describe("naming rules agree with the standard's definitions", () => {
  it("as-property-camel-case accepts exactly camelCase property names (§9)", () => {
    const samples = fc.sample(withNearMisses(camel), { seed: SEED, numRuns: RUNS });
    const wrong = disagreements(
      samples,
      (n) => withThingProperty(base, n, { type: "string", description: "x" }),
      "as-property-camel-case",
      isCamelCase,
    );
    expect(wrong).toEqual([]);
  });

  it("as-parameter-camel-case accepts exactly camelCase query keys (§8)", () => {
    const samples = fc.sample(withNearMisses(camel), { seed: SEED + 1, numRuns: RUNS });
    const wrong = disagreements(
      samples,
      (n) => withParameter(base, { name: n, in: "query", description: "q", schema: { type: "string" } }),
      "as-parameter-camel-case",
      isCamelCase,
    );
    expect(wrong).toEqual([]);
  });

  it("as-path-kebab-case accepts exactly kebab-case literal segments (§8)", () => {
    // Plural so the plural heuristic stays quiet; the segment under test is the second one.
    const samples = fc.sample(withNearMisses(kebab), { seed: SEED + 2, numRuns: RUNS });
    const wrong = disagreements(
      samples,
      (seg) => withExtraPath(base, `/v1/things/${seg}`),
      "as-path-kebab-case",
      (seg) => isWellFormedPath(`/v1/things/${seg}`) && isKebabSegment(seg),
    );
    expect(wrong).toEqual([]);
  });

  it("as-path-versioned accepts exactly paths that start with a major version (§12)", () => {
    const version = fc.oneof(
      fc.integer({ min: 1, max: 99 }).map((n) => `v${String(n)}`),
      fc.constantFrom("v0", "v01", "V1", "version1", "v", "things", "1"),
    );
    const samples = fc.sample(
      version.map((v) => `/${v}/things`),
      { seed: SEED + 3, numRuns: RUNS },
    );
    const wrong = disagreements(samples, (p) => withExtraPath(base, p), "as-path-versioned", isVersionedPath);
    expect(wrong).toEqual([]);
  });
});
