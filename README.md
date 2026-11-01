# API Standards

A standard for HTTP APIs, and the [Spectral](https://github.com/stoplightio/spectral) ruleset that
enforces the parts a machine can check.

- **[The standard](api-standards.md):** what an API must do to be acceptable. It covers API-first
  with OpenAPI 3.1.2; paths, actions and versioning; camelCase naming; RFC 9457 errors; cursor
  pagination with no total count; lifecycle and deprecation; OAuth 2.0 with tenant scoping; how
  restricted records stay invisible; environments; and SLOs. Each rule cites its source (Zalando
  by rule number, NLGov, the RFCs), and every deliberate departure is recorded with its reason.
- **[The ruleset](spectral/api-standards.yaml):** 22 rules, each prefixed `as-` and naming the
  section it enforces. The full table is in Appendix B of the standard.

Status: **draft v0.1**. Suggested changes are welcome. Items marked **[Suggested]** are the ones
most expected to move.

## Use the ruleset

In your API's repository:

```yaml
# .spectral.yaml
extends:
  - https://raw.githubusercontent.com/randallard/api-standards/v0.1.0/spectral/api-standards.yaml
```

```bash
spectral lint openapi.yaml
```

Pin a tag, as above, rather than `main`. A deviation granted under §19 of the standard goes in
your `.spectral.yaml` as an `overrides` entry, with the reason in a comment.
[`examples/document-storage.yaml`](examples/document-storage.yaml) is a complete specification
that lints clean.

## Work on this repository

Requirements: Node 24 and pnpm 11. The Spectral CLI is fetched as a pinned, checksum-verified
binary rather than from npm ([ADR-0002](docs/adr/0002-spectral-runs-as-a-pinned-standalone-binary.md)).

```bash
pnpm install
./scripts/install-spectral.sh   # linux-x64; elsewhere set SPECTRAL_BIN to Spectral 6.17.0
pnpm lint                       # eslint + markdownlint
pnpm lint:examples              # the examples lint clean against the ruleset
pnpm test                       # every rule fires on its mutation; property tests on naming
pnpm build                      # typecheck
```

**Adding a rule:** add it to `spectral/api-standards.yaml` with an `as-` name and the section it
enforces, add a row to Appendix B, and add a mutation to `tests/rules.test.ts`. The suite fails if
a rule has no test case.

| Path | What |
|---|---|
| `api-standards.md` | The standard |
| `spectral/api-standards.yaml` | The ruleset |
| `examples/` | Specifications that must lint clean |
| `src/` | Test harness. `names.ts` holds the standard's naming definitions; `spectral.ts` runs the binary |
| `tests/` | Rule tests, property tests and example tests |
| `docs/` | ADRs, journal, progress and stance reviews |

## Licence

The standard and the other prose are licensed [CC BY 4.0](LICENSE-CC-BY-4.0). The ruleset,
examples, scripts and code are licensed [Apache-2.0](LICENSE-APACHE). See
[ADR-0003](docs/adr/0003-standard-cc-by-ruleset-and-code-apache.md).

Scaffolded from [cr-ci-cd-rust-typescript-template](https://github.com/randallard/cr-ci-cd-rust-typescript-template),
whose conventions live in `.claude/skills/project-conventions/` and `docs/adr/1NNN`.
