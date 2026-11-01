# ADR-0002: Spectral runs as a pinned, checksum-verified standalone binary, not from npm
- Status: Accepted
- Date: 2026-10-24
- Deciders: Ryan

## Context
The tests need to run the ruleset exactly as adopters will, through the Spectral CLI. Installing
`@stoplight/spectral-cli` (or `@stoplight/spectral-ruleset-bundler`, which it depends on) fails
the repo's `trustPolicy: no-downgrade` gate (ADR-1016). The bundler depends on `rollup@^2.80.0`.
rollup 2.80.0 was published by a maintainer without the trusted-publisher evidence that earlier
releases carry, and pnpm reports it as `ERR_PNPM_TRUST_DOWNGRADE`, a possible package takeover.

It may well be a legitimate maintenance release. But the policy exists so that this call is made
by a person, on purpose, not waved through so that a lint tool will install.

Spectral publishes standalone binaries on every GitHub release, with a SHA-256 digest that GitHub
records on the release asset.

## Decision
`scripts/install-spectral.sh` downloads `spectral-linux-x64` at a pinned version, verifies it
against a pinned SHA-256 before running it, and installs it to `.tools/` (gitignored). CI and the
tests use that binary, and no Spectral package enters `package.json` or the lockfile. Version and
digest are bumped together, which is the same pattern `ci.yml` uses for gitleaks.

## Alternatives considered
- **`trustPolicyExclude` for rollup 2.80.0.** That would be reasonable after a review of the
  release, but it's an exception to a supply-chain gate, taken only to run a linter, when an
  alternative exists that needs no exception.
- **`@stoplight/spectral-core` with a hand-written YAML loader.** Rejected: it would re-implement
  part of the CLI's ruleset loading, and the tests would no longer prove the ruleset works the way
  adopters run it.

## Consequences
- The tests exercise the real CLI that adopters run.
- Only linux-x64 is pinned. Other platforms set `SPECTRAL_BIN` to their own binary of the same
  version.
- One process per lint call, so the property tests batch their samples instead of using
  `fc.assert` (see `tests/naming.property.test.ts`).
- **Revisit** when a Spectral release's npm tree passes the trust policy, or when the stance review
  finds a newer binary.
