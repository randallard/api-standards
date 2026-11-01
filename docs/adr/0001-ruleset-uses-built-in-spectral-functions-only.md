# ADR-0001: The ruleset uses built-in Spectral functions only
- Status: Accepted
- Date: 2026-10-24
- Deciders: Ryan

## Context
The point of shipping a ruleset is that an API team adopts it with one `extends:` line, pinned to
a tag. Spectral can load custom JavaScript functions from a `functionsDir` next to the ruleset,
but a ruleset fetched by URL then needs every function file served beside it. The functions
become code that runs inside every adopter's pipeline, and adopters would have to review that
code as well as the rules.

Every rule the standard can check from a contract turned out to be expressible with the
built-ins: `pattern`, `truthy`, `enumeration` and `schema`, using JSONPath filters on keys
(`@property.match(...)`).

## Decision
`spectral/api-standards.yaml` uses only Spectral's built-in functions and rulesets. It's one
self-contained YAML file with no `functionsDir`.

## Alternatives considered
- **Custom functions for the heuristic rules** (plural nouns, verb detection), for example by
  stemming words. Rejected for now: a word list and a trailing-`s` heuristic are crude but
  readable, and the plural check is only a warning.
- **Extending the Baloise Zalando ruleset** (the original plan). Rejected: it pulls in Zalando's
  snake_case rules, which this standard departs from (§19), and every adopter would fetch a
  second ruleset at an unpinned URL.

## Consequences
- An adopter's `extends:` is the whole integration.
- Some rules are heuristics (`as-path-plural-resource`, `as-path-no-action-verbs`), with word
  lists that will need additions. A false positive is handled with an `overrides` entry.
- **Revisit** if a rule the standard needs can't be written with the built-ins. That rule then
  needs a new ADR, because it changes how adopters consume the ruleset.
