# Architecture Decision Records (ADRs)

Significant decisions for **<PROJECT>**, one file per decision, with the context and
consequences — so the *why* survives, not just the *what*.

The recognized practice is the **ADR** (Michael Nygard, 2011), commonly written with the
**MADR** (Markdown Any Decision Records) template. We use a MADR-lite form.

## Conventions

- Files: `NNNN-kebab-title.md`, zero-padded, monotonically increasing.
- **Two number ranges.** `0001`–`0999` are this project's own decisions. **`1000` and up ("1NNN")
  are inherited standards ADRs** from `cr-ci-cd-rust-typescript-template`
  ([ADR-1000](1000-template-standards-adrs-are-inherited.md)). The same number means the same
  decision in every project built from the template.
- Status values: `Proposed` · `Accepted` · `Superseded by ADR-XXXX` · `Deprecated`.

### One decision per file

An ADR records **one** decision. If your file has a numbered list of decisions in it, you have
written a policy document, not an ADR — split it.

The test: **if you can't supersede one part of it, it's too big.** A file bundling eleven
decisions can never be superseded, because a new ADR replacing it would throw out the ten that
were fine. So the only available move becomes editing it in place — which is how bloat quietly
destroys immutability. These are not two separate failures; the first causes the second.

`docs-hygiene` warns when an ADR crosses the size tripwire. Treat the warning as a prompt to
split, not a number to tune.

### Immutable in substance

To change a decision, write a **new** ADR that supersedes the old one, and flip the old one's
status to `Superseded by ADR-XXXX`. Don't rewrite history.

Precisely what that allows and forbids:

| Part of the file | Mutable? |
|---|---|
| The `- Status:` line | ✅ that's what it's for |
| The index table in this README | ✅ it's an index |
| Typo / broken-link fixes | ✅ |
| `## Context`, `## Decision`, `## Consequences` | ❌ **frozen once Accepted** |
| Adding a new decision to an existing ADR | ❌ **write a new ADR** |
| "Amended on <date>" blocks | ❌ that's an edit wearing a hat |

If you find yourself writing "amended" inside an accepted ADR, stop: what you have is a new
decision, and it deserves its own number and its own supersession link.

### Superseding

1. Write `NNNN-new-title.md` with the new decision. In its Context, say what it replaces and
   **why the old reasoning stopped holding** — that's the valuable part, and it's the thing
   an in-place edit destroys.
2. In the old ADR, change only the Status line to `Superseded by [ADR-NNNN](NNNN-new-title.md)`.
3. Update the index below.

A superseded ADR stays in the repo, unedited, forever. Someone reading the new one needs to see
what was believed before and what changed.

### Inherited standards ADRs (1NNN)

These belong to the template. In a project, **don't edit them and don't flip their Status**: only
the template supersedes a 1NNN, with a new 1NNN. When the template adds one, copy it in
unchanged. If this project deviates from one, record that in **your own** 0NNN ADR, citing the
1NNN it departs from, and say why. A recorded deviation is a decision. An unrecorded one is
drift.

## Template

Copy [`TEMPLATE.md`](TEMPLATE.md).

```markdown
# ADR-NNNN: <title>
- Status: Proposed | Accepted | Superseded by ADR-XXXX
- Date: YYYY-MM-DD
- Deciders: <names>

## Context
<forces at play, constraints, what makes this non-obvious>

## Decision
<what we chose, stated plainly — ONE decision>

## Consequences
<results, good and bad; what this commits us to>
```

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0000](0000-record-architecture-decisions.md) | Record architecture decisions (use ADRs) | Accepted |

### Inherited standards (from the template; don't edit here)

| ADR | Title | Status |
|-----|-------|--------|
| [1000](1000-template-standards-adrs-are-inherited.md) | Template standards ADRs are inherited, numbered 1000 and up | Accepted |
| [1001](1001-project-conventions-is-the-canonical-standard.md) | project-conventions is the canonical provable-code standard | Accepted |
| [1002](1002-provable-is-a-four-rung-ladder.md) | "Provable" means a four-rung ladder, and a project claims only the rungs CI enforces | Accepted |
| [1003](1003-provable-plus-tier-verus-for-named-invariants.md) | Opt-in provable+ tier: Verus for named invariants, with a human-reviewed spec | Accepted |
| [1004](1004-kani-job-fails-without-harnesses.md) | The Kani CI job fails when there are no proof harnesses | Accepted |
| [1005](1005-every-ci-job-has-a-timeout.md) | Every CI job has a timeout: 30 minutes for proofs, 15 for the rest | Accepted |
| [1006](1006-cargo-runs-locked-in-ci.md) | Cargo runs with `--locked` in CI | Accepted |
| [1007](1007-one-day-crate-cooldown-via-cargo-min-publish-age.md) | New crate versions wait one day, via Cargo's native `min-publish-age` | Accepted |
| [1008](1008-build-scripts-are-the-rust-attack-surface.md) | Build scripts and proc-macros are treated as the Rust attack surface | Accepted |
| [1009](1009-miri-runs-without-secrets-or-shared-target-cache.md) | Miri runs without secrets and without a shared `target/` cache | Accepted |
| [1010](1010-typescript-stays-on-6-until-the-lint-gate-supports-7.md) | TypeScript stays on 6.x until the type-aware lint gate supports 7 | Accepted |
| [1011](1011-typescript-strictness-bar.md) | The TypeScript strictness bar matches what the repos already run | Accepted |
| [1012](1012-strictness-extras-offered-at-project-start.md) | Engineering-Strategy's TS extras are offered as an opt-in at every project start | Accepted |
| [1013](1013-node-24-lts-in-ci.md) | CI runs Node 24 LTS | Accepted |
| [1014](1014-npm-trusted-publishing-hygiene.md) | npm trusted publishing: bind by repository ID, never from comment- or fork-triggered workflows | Accepted |
| [1015](1015-logic-beyond-provable-lite-moves-to-a-rust-core.md) | UI logic that needs more than provable-lite moves into a Rust core compiled to WASM | Accepted |
| [1016](1016-pnpm-supply-chain-settings-stay-explicit.md) | pnpm supply-chain settings stay explicit, and major pnpm bumps are evaluated first | Accepted |
| [1017](1017-state-is-managed-facts-managed-position-derived-values.md) | State is managed facts, managed position and derived values, and a screen's transitions go through one pure, property-tested reducer | Accepted |
