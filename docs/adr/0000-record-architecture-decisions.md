# ADR-0000: Record architecture decisions (use ADRs)
- Status: Accepted
- Date: <YYYY-MM-DD>
- Deciders: <names>

## Context
Decisions with long-lived consequences — language, architecture, storage model, rigor tier,
supply-chain posture — get made once and lived with for years. Without a record, the *why*
evaporates: six months on, the code shows what was chosen but not what was rejected or what
constraint forced it. The predictable failure is re-litigating a settled question, or worse,
quietly reversing it without noticing the original reason.

Commit messages are per-commit and too granular. A changelog is per-release and aimed at
users. Neither carries reasoning.

## Decision
Record significant decisions as **ADRs** (Michael Nygard's Architecture Decision Records, in a
MADR-lite form) under `docs/adr/`, one decision per file, following the conventions in
[`README.md`](README.md).

Pair them with a dated narrative worklog in [`docs/journal/`](../journal/README.md): ADRs are
per-decision, the journal is the story over time.

## Consequences
- The *why* survives contributor turnover, long gaps, and a cleared context window.
- Superseded decisions stay readable, so "we already tried that, here's what happened" is
  answerable from the repo.
- Costs discipline: a decision made in chat and never written down is invisible to every
  future reader. The `docs-hygiene` CI job enforces the mechanical parts (index accuracy,
  valid statuses, resolvable supersession links); the judgment part is on us.
- One decision per file means more files. That's the point — it's what keeps supersession
  possible.
