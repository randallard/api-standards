// Interpreting Spectral's JSON output. Pure: takes parsed values, returns values.

export interface LintResult {
  readonly code: string;
  readonly message: string;
  readonly severity: number;
  readonly source: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Narrow Spectral's `-f json` output to the fields the tests use, rejecting anything else. */
export function parseResults(raw: unknown): LintResult[] {
  if (!Array.isArray(raw)) throw new Error("spectral output is not an array");
  return raw.map((item: unknown) => {
    if (
      !isRecord(item) ||
      typeof item["code"] !== "string" ||
      typeof item["message"] !== "string" ||
      typeof item["severity"] !== "number" ||
      typeof item["source"] !== "string"
    ) {
      throw new Error(`unexpected spectral result: ${JSON.stringify(item)}`);
    }
    return {
      code: item["code"],
      message: item["message"],
      severity: item["severity"],
      source: item["source"],
    };
  });
}

/** Rule codes reported against each file. A file with no results maps to an empty set. */
export function codesByFile(files: readonly string[], results: readonly LintResult[]): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>(files.map((f) => [f, new Set<string>()]));
  for (const r of results) {
    const set = out.get(r.source);
    if (set === undefined) throw new Error(`result for a file that wasn't linted: ${r.source}`);
    set.add(r.code);
  }
  return out;
}

/** Rule names defined in a ruleset file's text: top-level keys under `rules:` that start `as-`. */
export function ruleNames(rulesetText: string): string[] {
  return [...rulesetText.matchAll(/^ {2}(as-[a-z0-9-]+):\s*$/gm)].map((m) => m[1] ?? "");
}
