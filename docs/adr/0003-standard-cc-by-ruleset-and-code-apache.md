# ADR-0003: The standard is CC BY 4.0; the ruleset and code are Apache-2.0
- Status: Accepted
- Date: 2026-10-24
- Deciders: Ryan

## Context
The template ships dual MIT / Apache-2.0 for code. This repo is mostly prose: a standard meant
to be adopted, adapted and quoted by other organizations. A software licence fits prose badly.
Several of the standard's sources are CC BY 4.0 (Zalando, NLGov), and adapting from them under
the same licence keeps attribution simple.

## Decision
`api-standards.md` and the other prose are licensed **CC BY 4.0** (`LICENSE-CC-BY-4.0`). The
Spectral ruleset, the examples, the scripts and the TypeScript are licensed **Apache-2.0**
(`LICENSE-APACHE`). `LICENSE-MIT` is removed.

## Alternatives considered
- **Keep the template's dual MIT / Apache-2.0 for everything.** Rejected: a code licence on the
  standard leaves adopters unsure how to quote it.
- **CC BY-SA.** Rejected: share-alike makes adapting the standard awkward for an organization
  that wants an internal variant. That's the same reason the standard cites OWASP rather than
  adapting it.

## Consequences
- Adopters can copy the ruleset into their own repositories under Apache-2.0, and can adapt the
  standard with attribution.
- The README states which licence covers which files.
