---
name: new-project
description: Bootstrap a project scaffolded from cr-ci-cd-rust-typescript-template — interview about what's being built, deliberate the architecture choices, record them as ADRs, and strip the template scaffolding. Use on the first session in a fresh clone.
---

# Bootstrap a new project

Someone has cloned the template and said roughly "I want an application that does X." Your job
is to get from there to a project with its architecture *decided and recorded*, not to start
writing code.

**Deliberate, don't assume.** The defaults below are opinions with reasons, and stating the
reason lets the user disagree productively. Present the default *and* what would change it.
Never silently pick.

## Step 1 — Understand what's being built

Interview until you can state, in one sentence, what the thing does and who uses it. Do not
invent content. If they gave a rich description, mine it first and confirm your understanding
rather than re-asking what they already told you.

You need enough to answer: does this have a UI? a backend? does data outlive a session? does
more than one person or device touch the same data?

## Step 2 — Deliberate the architecture

Four questions. Each becomes an ADR. Use `AskUserQuestion` where the options are discrete.

### Storage — ask this one first, it constrains the rest

**Default: browser storage (IndexedDB) with export/import backup files.** Lead with it.

This isn't a limitation, it's an architectural position with real advantages: no schema
migrations to get wrong, no server to run or secure, no distributed-state correctness problem,
no hosting cost, and the user's data is genuinely theirs. An append-only event log plus a
union-merge import handles multi-device sync manually and deterministically.

Move off it when the user can name why — data shared between *people* (not just devices),
data that must survive the user clearing site data, server-side computation, or auth. "It
might need a backend later" is not a reason; the event log exports cleanly.

If they do need a backend, the database is a **per-project deliberation** — ask, don't assume,
and record the answer.

### Shell language

- **TypeScript** (default for anything with a UI): the strictness bar in `project-conventions`
  (ADR-1011), with `typescript` pinned to 6.0.x for now (ADR-1010). Chosen for ecosystem, speed
  and smoothness, with provability engineered in via a pure core and property tests rather
  than inherited from the type system.
- **Rust** — for CLIs, daemons, and backends. `#![forbid(unsafe_code)]` everywhere.
- **Both** — TS frontend, Rust backend, only when there's genuinely a backend.

Note honestly if asked: TS's type system is unsound, and Elm/PureScript are sounder. They also
don't give you *proofs*, and cost ecosystem — so the trade is deliberate, not ignorant.

### Rigor tier

- **provable-lite** (TS) — pure core, `fast-check` property tests, strict compiler. The
  default for TS projects.
- **provable** (Rust): pure core crate, `proptest`, plus `kani` bounded proofs as their own
  CI job. Default for Rust. The proofs job **fails until the first harness exists** (ADR-1004),
  so either write one for the core this session or record that this project opts out of Kani.
- **provable+**: adds Verus for a **named** invariant (ADR-1003). Only offer it when the user
  names something whose violation is a legal or safety harm.

**Always ask these two, whatever the language** (each answer becomes an ADR, yes or no):

- **Logic that needs more than provable-lite?** (ADR-1015) If a TS app holds logic worth
  *proving* (selection math, eligibility, permission rules), it goes in a Rust crate compiled to
  WASM under the TS shell, not into TS with extra tooling.
- **TS strictness extras** (ADR-1012, for any TS project): an **`any` registry**, and
  **accessibility lint** (jsx-a11y, or axe checks for non-JSX UIs). Present both with their
  costs. Strongly suggest a11y for anything public- or court-facing.

Record the **promotion condition** in the ADR: what would make you want the stronger tier
later. The monthly stance review reads those.

### Hosting and licence

- **GitHub Pages** if it's a static site — it usually is, under the storage default. Remember
  `base` must match the repo name, or the deploy 404s on every asset.
- **Licence: dual `MIT OR Apache-2.0`.** Superset of MIT's permissiveness, adds a patent
  grant, matches Rust ecosystem convention. Both licence files ship in the template.

## Step 3 — Record the decisions

Write one ADR per decision, from `docs/adr/TEMPLATE.md`. **One decision per file** — resist
writing a single "architecture" ADR; that's the bloat this template exists to prevent.

Typically: `0001` rigor tier and language, `0002` storage model, `0003` supply-chain posture,
`0004` hosting, then the two always-asked answers (WASM core, TS extras). Update the index. Keep
`0000` as-is.

**Leave the `1NNN` ADRs alone.** They're the template's inherited standards (ADR-1000), already
indexed. Read them: they're the reasoning behind `project-conventions`. If this project deviates
from one, that's a project ADR in the `0NNN` range citing it.

Record what was *rejected* and why. That's the part that pays off later.

## Step 4 — Make it the user's project

- `README.md`, `docs/PROGRESS.md` — replace template content with the real thing.
- Replace `<PROJECT>` placeholders throughout (`grep -rn '<PROJECT>'`).
- `.github/CODEOWNERS` — defaults to `@randallard`. If this project belongs to someone else,
  replace every handle or delete the file: a CODEOWNERS pointing at someone without access
  looks like a control and silently isn't. Mention that it only becomes a gate with branch
  protection on `main`.
- Wire the template remote so drift is checkable later:
  `git remote add template <template-url>`
- Delete `.claude/skills/new-project/` — it has done its job and shouldn't linger.
- First journal entry: what's being built and why these choices.
- Run `python3 scripts/docs-hygiene.py` and make it clean.

## Step 5 — Then, and only then

Confirm what you created and what's still undecided. Ask before writing application code —
the user may want to review the architecture first, and the scaffolding is the deliverable
for this session.
