# ADR-0005: provable-lite TypeScript, with no Rust core
- Status: Accepted
- Date: 2026-10-24
- Deciders: Ryan

## Context
ADR-1015 asks every TypeScript project whether any of its logic needs a Rust/WASM core, and
ADR-1002 says a project claims only the rungs its CI enforces. The only code here is the test
harness. Its pure core is `src/names.ts` (reference definitions of the naming rules),
`src/spec.ts` (document builders) and `src/results.ts` (interpreting output). Its shell is
`src/spectral.ts`, which runs the binary. Nothing it does is safety-critical. The thing being
verified is the ruleset, a YAML file.

## Decision
The repo is **provable-lite** (rungs 1–3): strict TypeScript, and `fast-check` property tests
asserting that the ruleset's naming rules agree with the standard's definitions over generated
names. No Rust core and no proofs. There's no storage question: the repo has no application.

## Consequences
- The invariant the property tests assert is real: "the lint rule accepts exactly the names the
  standard defines as camelCase / kebab-case / versioned." A regex that drifts from the wording
  fails a test. This was checked by mutating the camelCase regex, which failed four tests.
- **Promotion condition:** if the repo grows a custom Spectral function (ADR-0001 revisited) that
  encodes a security-relevant rule, such as tenant scoping, revisit this ADR.
