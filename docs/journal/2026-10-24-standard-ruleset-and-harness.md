# 2026-10-24: Standard v0.1, the ruleset and the harness

No commit yet. Everything below is in the working tree, waiting on Ryan's local check.

## What got built

- `api-standards.md`, v0.1. It's a domain-neutral derivative of a private standard: the rules and
  their reasoning are kept, and the sections tied to one organization are dropped. Tenant replaces
  the original's organization-specific scoping unit, and "restricted records" generalizes its
  confidentiality rules. Decisions-register reasons that leaned on the original context were
  rewritten to stand alone (camelCase, path versioning, `X-Correlation-Id`).
- `spectral/api-standards.yaml`: 22 `as-` rules, built-ins only (ADR-0001).
- A harness that runs the real Spectral CLI over batches of generated documents.

## Surprises

- **The npm route to Spectral fails our own trust policy.** `@stoplight/spectral-ruleset-bundler`
  needs `rollup@^2.80.0`, and 2.80.0 has no trusted-publisher evidence, while earlier releases do.
  pnpm stopped the install with `ERR_PNPM_TRUST_DOWNGRADE`. Rather than carve an exception into a
  supply-chain gate just to run a linter, the standalone binary is pinned by SHA-256. The digest
  was cross-checked against GitHub's recorded asset digest (ADR-0002).
- **Spectral aliases can't take a filter suffix.** `"#Parameters[?(@.in == 'query')]"` silently
  matched nothing, and `as-parameter-camel-case` and `as-no-offset-pagination` never fired. The
  filters now live inside the alias definitions. This was caught by linting a deliberately bad
  spec before any test existed, which is why the rule tests now require every rule to fire.
- **`enumeration` on a missing field reports nothing**, so `as-datetime-format` needed a `truthy`
  check beside it. `schema` on a missing field *does* report ("must exist"), so the rules that use
  `schema` don't need one.
- **The first property-test run was all green**, which proves nothing on its own. Mutating the
  camelCase regex to allow `_` failed four tests (two rule tests, two property tests), so the
  properties are biting.

## Left open

Whether the GOV.UK and NLGov citations stay (PROGRESS, open questions), and the domain words in
the inherited template files.
