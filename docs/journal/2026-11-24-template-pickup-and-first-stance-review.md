# 2026-11-24: template picked up, first stance review

A compliance review found three gaps: ADRs 1019–1024 were missing (so 1013 still said Accepted),
CI and `engines` were on Node 24 instead of ADR-1022's 26, and there was no stance review yet.

- Copied ADRs 1013 and 1019–1024 from the template, and updated the index.
- Rebuilt `ci.yml` from the template's current file, then re-applied this repo's own steps:
  `install-spectral.sh` and `lint:examples` in `ts-gates`, and the `link-check` job. The template's
  `docs-hygiene.yml` and `stance-review.yml` replaced ours unchanged.
- Node 26 everywhere: CI, `engines.node >=26.0.0`, `@types/node 26.6.6`.
- `deny.toml` (ADR-1024) and `renovate.json` (ADR-1021). The two ADR-1023 automerge rules are left
  out because `main` has no branch protection: [ADR-0007](../adr/0007-renovate-automerge-waits-for-required-checks.md).
- Synced the `project-conventions` and `stance-review` skills. The old `project-conventions` had a
  domain word on line 90, and the private scrub check failed on it. With the template's newer text
  the scrub check is clean.
- The stance review found Spectral 6.17.1. Bumped it in `install-spectral.sh` and the `api-lint`
  job. Spectral's npm tree still fails `trustPolicy: no-downgrade` (`rollup@2.80.0`), so ADR-0002
  stands.
- Locally: lint, `lint:examples`, 30/30 tests, `tsc`, `pnpm audit` and docs hygiene all pass.
- Nothing is committed. It's waiting on Ryan's review.
