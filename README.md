# cr-ci-cd-rust-typescript-template

An opinionated starting point for **provable** projects — Rust, TypeScript, or both — with the
documentation discipline, supply-chain posture, and continuous-review habit already wired in.

> **Use this template** on GitHub, or:
> ```bash
> gh repo create my-project --template randallard/cr-ci-cd-rust-typescript-template
> ```
> The template's name has no bearing on your project's name.

Then open the fresh clone in Claude Code and say what you're building. The `new-project` skill
in `.claude/` runs the interview, deliberates the architecture with you, and records the
decisions as ADRs. **The template is self-contained** — it doesn't depend on any personal
Claude config, so a brand-new machine with nothing but a clone works.

## What's opinionated here

**Provable at the strongest tier the language supports.** "Provable" is a four-rung ladder:
memory safety, illegal states unrepresentable, property tests, proofs. A project claims only the
rungs its CI enforces. Rust gets `#![forbid(unsafe_code)]`, `proptest`, and `kani` bounded proofs
in their own CI job, which fails if there's nothing to prove. Verus is opt-in for named
invariants. TypeScript gets the strict compiler and lint bar, and `fast-check` property tests on a
pure core. TS's type system is unsound and that's an accepted trade for ecosystem and speed, so
the rigor is *engineered in* rather than inherited, and logic that needs more moves to a Rust
core compiled to WASM.

**The standard's decisions are inherited ADRs.** `docs/adr/1000` and up record why each standard
is what it is, and every project gets them. Projects number their own ADRs from `0001`. When the
template changes a standard, it adds a new `1NNN`, and downstream projects pick it up through
their stance review.

**Functional core / imperative shell**, always. It's what makes the property tests and proofs
possible; without it there's nothing clean to test.

**Browser storage with export/import as the default persistence.** No database until you can
name why you need one. No schema migrations to get wrong, no server to secure, no distributed
state, and the user's data is genuinely theirs. The database question is a per-project
deliberation, not a default.

**Decisions get recorded, one per file, and never rewritten.** ADRs are immutable in substance;
changing your mind means a new ADR that supersedes the old one. The record of what you believed
and when is the valuable part.

**Your stance gets reviewed on a schedule.** Monthly, an issue opens asking whether the
standing decisions are still true. It never blocks a build.

## Why the review exists

A decision can stop being true without anything breaking:

> An ADR recorded "no tool exists for this yet — revisit later." The package manager shipped
> four native controls for exactly that, **ten days after** the ADR was written. CI was green
> the whole time; there was nothing to fail. It surfaced months later only because someone
> asked a passing question.

Tooling moves in weeks. `docs/reviews/` is the habit that catches it on purpose rather than by
luck, and every finding becomes a *new* ADR — which is what makes a review process compatible
with immutable records instead of in tension with them.

## Layout

```
.claude/skills/
  project-conventions/   house rules — loads automatically
  new-project/           first-run bootstrap (delete after use)
  stance-review/         the monthly review
.github/
  CODEOWNERS             review gates for instruction + CI + supply-chain paths
  workflows/
    ci.yml               both language paths, self-skipping; all actions SHA-pinned
    docs-hygiene.yml     mechanical checks — this one gates
    stance-review.yml    monthly nag — never gates
.cargo/config.toml       one-day crate cooldown (min-publish-age)
docs/
  adr/                   decisions, one per file, immutable (1NNN = inherited standards)
  journal/               dated narrative worklog
  reviews/               stance review records
  PROGRESS.md            status + next steps
scripts/
  docs-hygiene.py        stdlib-only, runs anywhere
```

## CI

One `ci.yml` with both language paths. A `detect` job looks for `Cargo.toml` / `package.json`
and the language jobs skip themselves when their manifest isn't there — a TS-only or Rust-only
project needs no edits, and neither does one that later grows a second language.

Rust gets fmt / clippy / test (all `--locked`) / cargo-deny, with **Kani proofs in their own
job** so a slow proof never delays fast-gate feedback and the check name says which tier failed.
The proofs job fails when no harness exists, because Kani otherwise passes with nothing proven.
`.cargo/config.toml` holds new crate versions back a day (native from Rust 1.100). Every job has
a `timeout-minutes`, and CI runs Node 24. TypeScript gets
lint / test / build plus audit, `audit signatures`, and the license allowlist. Pages deploy is
opt-in per project: set the `DEPLOY_PAGES` repository variable to `true`.

**Every action is pinned to a full commit SHA**, with the version in a trailing comment. Tags
are mutable — the tj-actions/changed-files compromise (CVE-2025-30066) worked by repointing
existing version tags — and GitHub's guidance calls a SHA the only immutable reference. Note
`dtolnay/rust-toolchain@stable` is a *branch*, which moves by design; the pin matters most
exactly where it feels least necessary. Renovate can maintain SHA pins and keep the comments in
sync.

## The two review tiers

| | Mechanical | Judgment |
|---|---|---|
| **Where** | `docs-hygiene.yml`, every push | `stance-review.yml`, monthly |
| **Checks** | index accuracy, valid statuses, resolvable supersession links, broken links, links that escape the repo, journal filenames, ADR bloat tripwire | is this decision still *correct*? |
| **Gates?** | yes — only fires on objectively wrong, cheap-to-fix things | never |

A review that blocks CI gets disabled the first busy week, and then you have neither the gate
nor the habit. So the judgment tier nags and records, and that's all.

Run the mechanical tier locally any time: `python3 scripts/docs-hygiene.py` (no dependencies,
no virtualenv — it has to work in a Rust-only project too).

One check is deliberately stricter than "does the file exist": **a relative link that resolves
outside the repo is an error even when the target is there on disk.** Sibling checkouts are a
property of one machine, not of the repository, so `../../other-repo/docs/…` passes locally and
breaks every CI run — and existence-first checking is silent exactly where the link is least
trustworthy. Link out of the repo with a URL. If the other repo has no remote you can link to,
say the path in prose or inline code rather than making it a link.

## Licence

Dual **MIT OR Apache-2.0** — a superset of MIT's permissiveness with a patent grant, matching
Rust ecosystem convention. Fill in `LICENSE-MIT`'s copyright line; both files ship as-is.
