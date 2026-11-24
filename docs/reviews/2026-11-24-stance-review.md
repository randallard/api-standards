# Stance review — 2026-11-24

- Reviewer: Ryan (drafted by Claude)
- Previous: first

## Checked

1. **Promotion conditions and revisit points**
   - [ADR-0001](../adr/0001-ruleset-uses-built-in-spectral-functions-only.md) (built-ins only):
     unchanged. No rule on the worklist needs a custom function yet.
   - [ADR-0002](../adr/0002-spectral-runs-as-a-pinned-standalone-binary.md) (the binary, not npm):
     still holds. `pnpm add @stoplight/spectral-cli@6.17.1` under pnpm 11.5.3 with
     `trustPolicy: no-downgrade` fails with `ERR_PNPM_TRUST_DOWNGRADE` on `rollup@2.80.0`, the
     same as at adoption.
   - [ADR-0004](../adr/0004-doc-lint-markdownlint-and-lychee.md) (dead link on a quiet repo):
     no case yet. The last CI link check passed (2026-11-01).
   - [ADR-0005](../adr/0005-provable-lite-typescript-no-rust-core.md) (promote if a custom,
     security-relevant function appears): not met, because there's no custom function.
   - [ADR-0006](../adr/0006-strictness-extras-declined.md) (revisit with a rendered site): not
     met. The Pages deploy is gated on `vars.DEPLOY_PAGES`, and the repo sets no variables.
2. **"Not available yet" claims:** none in the project ADRs besides ADR-0002's, checked above.
3. **Supply chain**
   - Spectral 6.17.1 was released 2026-11-06 (`gh release list -R stoplightio/spectral`).
   - pnpm 12 has been out since before 2026-11-01. The latest is 12.23.0, and the repo is on
     11.5.3.
   - `pnpm audit --audit-level=high`: no known vulnerabilities.
   - Node: the repo was on 24, and ADR-1022 moves everything to 26.
4. **Rigor tier:** unchanged. The core is still `src/names.ts` plus the ruleset, and the
   property tests cover the naming rules.
5. **The template:** it had moved on. ADRs 1019–1024 were missing, as were newer action pins, the
   `api-lint` job, the cargo-deny v2.1.3 and `deny.toml` pair, `renovate.json`, and
   `project-conventions` and `stance-review` skill text (the old `project-conventions` text tripped
   the scrub check).
6. **Deferred from the last review:** first review.

## Findings

- The template drift in item 5.
- Spectral 6.17.0 → 6.17.1 is available.
- pnpm 12 hasn't been evaluated here, although ADR-1016 asks for an evaluation before a major
  bump.

## Actions

- **Picked up the template:** ADRs 1019–1024 (with 1013 flipped to superseded), Node 26 in CI,
  `engines` and `@types/node 26.6.6` (ADR-1022), `deny.toml` and cargo-deny v2.1.3 (ADR-1024),
  `renovate.json` (ADR-1021), the template's current workflows (keeping this repo's Spectral
  steps and link check), and both skills.
- **[ADR-0007](../adr/0007-renovate-automerge-waits-for-required-checks.md):** ADR-1023's
  automerge rules are left out because `main` isn't protected.
- **Spectral bumped to 6.17.1** in `scripts/install-spectral.sh` and in the `api-lint` job. The
  template's `api-lint` job is still on 6.17.0, and the template is where that bump belongs.
- **Deferred:** pnpm 12. Next look: at the next stance review, or sooner if a pnpm 11 advisory
  lands.
