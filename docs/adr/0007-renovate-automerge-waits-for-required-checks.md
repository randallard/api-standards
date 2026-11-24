# ADR-0007: Renovate's automerge rules wait until `main` requires the CI checks
- Status: Accepted
- Date: 2026-11-24
- Deciders: Ryan

## Context
ADR-1021 gives every project the template's `renovate.json`, and ADR-1023 adds two rules that
automerge routine updates. ADR-1023 makes those rules conditional: they're enabled "only in a repo
whose `main` requires the CI checks". Otherwise Renovate can merge before CI has run.

`randallard/api-standards` has no branch protection or ruleset on `main` (`gh api
repos/randallard/api-standards/branches/main/protection`: "Branch not protected"; `rulesets`: `[]`).

## Decision
`renovate.json` is the template's, minus the two ADR-1023 `automerge` rules. Every other rule
stays, including the `typescript` 6.0.x hold and the `@types/node` 26.x hold. Renovate PRs are
merged by hand until `main` requires the CI jobs.

## Consequences
- Routine updates wait for a person, which ADR-1023 says is how a backlog builds up. In a repo this
  quiet, that's a few PRs a month.
- **Revisit** when `main` gets branch protection or a ruleset that lists the CI jobs as required.
  Then a new ADR supersedes this one and restores the template's two rules.
