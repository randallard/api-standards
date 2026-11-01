# ADR-0004: The standard's prose is linted by markdownlint and its links by lychee
- Status: Accepted
- Date: 2026-10-24
- Deciders: Ryan

## Context
The standard is the product, so a broken table or a dead citation is a defect in the product.
The standard cites rules by number with links (Zalando, NLGov, RFCs), and those links rot.

## Decision
- **markdownlint-cli2** (pinned in `package.json`) runs as part of `pnpm lint` over the root
  Markdown and `docs/`, except the files inherited from the template. Rules are in
  `.markdownlint.jsonc`: line length off, the house `|---|` table style allowed, and ADRs keep
  the template's tight heading layout (`docs/adr/.markdownlint.jsonc`).
- **lychee** checks external links in CI (`link-check` job, `lychee.toml`), with retries, and it
  gates. `example.com` hosts and the not-yet-tagged raw ruleset URL are excluded.

## Alternatives considered
- **A link check that only warns.** Rejected: a standard whose citations 404 is wrong in a way
  readers notice. Retries and accepting `429`/`403` deal with flakiness instead.
- **Vale or another prose linter.** Not now. It would need a style guide written for it first.

## Consequences
- A citation that moves fails CI on the next change after the move. Weekly runs aren't scheduled,
  so a quiet repo can carry a dead link until someone touches it. **Revisit** if that happens.
- Inherited template docs aren't linted here. Their format belongs to the template.
