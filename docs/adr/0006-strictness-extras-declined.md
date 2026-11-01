# ADR-0006: The any-registry and accessibility-lint extras are declined
- Status: Accepted
- Date: 2026-10-24
- Deciders: Ryan

## Context
ADR-1012 offers two opt-in TypeScript extras at project start, an `any` registry and
accessibility lint, and asks for a recorded yes or no.

## Decision
Both are declined. There's no UI, so accessibility lint has nothing to check. The harness is
small, and `strictTypeChecked` already rejects `any` (`no-explicit-any`, `no-unsafe-*`). Spectral's
JSON output is narrowed by a runtime check in `parseResults` rather than cast.

## Consequences
- **Revisit** if the repo grows a rendered site (for example a docs site for the standard). That
  would have a UI, and a11y lint would then apply.
