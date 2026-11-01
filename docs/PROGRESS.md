# Progress & Status

_Last updated: 2026-11-01_

## Status / next

**Status:** v0.1 is committed, after Ryan's review on 2026-11-01. The NLGov and GOV.UK
citations stay as references, the template's ADR-1018 (OSV-Scanner v2.7.0) is adopted, and the
private scrub check is clean. Local checks: `pnpm lint` (eslint + markdownlint),
`pnpm lint:examples`, `pnpm test` (30 tests) and `pnpm build` all pass.

**Next:**

1. Watch the first CI run, especially `link-check` and `ts supply chain` (licence allowlist,
   audit signatures), which haven't run in CI yet.
2. Tag `v0.1.0`, so the `extends:` URL in the README resolves, then make the repo public.
3. The template picks the standard up (ADR-1019 there, an `api-lint` job), in the private
   `api-standards-in-template` effort.

## Architecture

Three artifacts: the standard (`api-standards.md`), the ruleset (`spectral/api-standards.yaml`),
and a TypeScript test harness that runs the real Spectral CLI against generated documents.

- Ruleset: built-in Spectral functions only ([ADR-0001](adr/0001-ruleset-uses-built-in-spectral-functions-only.md))
- Spectral: pinned standalone binary, not npm ([ADR-0002](adr/0002-spectral-runs-as-a-pinned-standalone-binary.md))
- Licences: CC BY 4.0 prose, Apache-2.0 code ([ADR-0003](adr/0003-standard-cc-by-ruleset-and-code-apache.md))
- Doc lint: markdownlint + lychee ([ADR-0004](adr/0004-doc-lint-markdownlint-and-lychee.md))
- Rigor tier: provable-lite, no Rust core ([ADR-0005](adr/0005-provable-lite-typescript-no-rust-core.md))
- TS extras declined ([ADR-0006](adr/0006-strictness-extras-declined.md))

## Provability

- **Every rule fires.** `tests/rules.test.ts` holds one mutation per `as-` rule, run against a
  baseline that lints with zero results. The test also fails if the ruleset and the test cases
  list different rules.
- **The naming rules match the standard's definitions.** `tests/naming.property.test.ts` draws
  fixed-seed samples (conforming names plus near misses) and checks that `as-property-camel-case`,
  `as-parameter-camel-case`, `as-path-kebab-case` and `as-path-versioned` agree with
  `src/names.ts` on every sample. This was verified by mutating the camelCase regex to allow `_`,
  which failed four tests.
- **The examples are clean.** `tests/examples.test.ts` requires zero results, including
  `spectral:oas`.
- **Not verified:** the heuristic rules (plurals, action verbs) are checked only by example,
  because there's no reference definition of "a verb". Anything that can't be checked from a
  contract (tenant scoping in queries, cursor binding) is left to review.

## Worklist

1. A stance review after the first CI run, which clears the hygiene warning.
2. Possible rules not written yet: `X-Correlation-Id` declared on responses (§8), `Location` on
   `201` (§8), `202` + `Location` for long actions, and a `servers` URL without a path that
   repeats the version.

## Open questions

- **Inherited template files contain domain words.** The scrub check in the private effort skips
  files that are byte-identical to the template, which is already public. It found domain terms
  in five inherited files. That's a template fix, tracked in the
  `api-standards-in-template` effort.

---

_History accretes below, oldest first. See [`journal/`](journal/README.md) for the narrative and
[`reviews/`](reviews/README.md) for stance reviews._

- 2026-10-24: scaffolded from the template; standard v0.1, ruleset (22 rules) and harness
  written; uncommitted, waiting on local review.
- 2026-11-01: reviewed; the NLGov and GOV.UK citations stay. ADR-1018 adopted from the template.
  Committed; homed on `data`; pushed to GitHub.
