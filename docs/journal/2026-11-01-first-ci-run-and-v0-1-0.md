# 2026-11-01: First CI run, and v0.1.0 public

Documents `8db7742` (v0.1 committed) and `cc6949e` (advisory overrides), tagged `v0.1.0`.

## What happened

- Ryan reviewed the draft. The NLGov and GOV.UK citations stay as references, which closes the
  last open question from 10-24.
- The template had gained ADR-1018 (OSV-Scanner v2.7.0) since this repo was scaffolded, so it was
  adopted before the first commit: the ADR, its index row, the `ci.yml` pin and the
  `project-conventions` command.
- Committed, homed, and pushed. **The first CI run failed in two jobs:**
  - `ts supply chain`: `pnpm audit --audit-level=high` caught re2js GHSA-gg6h-894w-4m9c (high,
    markdownlint pins re2js 2.8.6 exactly), with glob and minimatch (both 2026-10-30) and a katex
    low next to it. None of these had been published when the 10-24 local run was clean.
  - `OSV scan`: the same four advisories, plus the SARIF upload, which GitHub refuses on a private
    repo ("Code scanning is not enabled").
- `cc6949e` overrides all four, each within the line that fixes it, with no ignores. There is no
  minimatch 3 in this tree, so minimatch 10 → 11 is a plain override here. pnpm audit is clean,
  and every local gate passes again.
- On the second run everything passed except the code-scanning upload. The scan read **363
  packages**, which matches `pnpm audit signatures` (ADR-1018's check). Tagged `v0.1.0`, made the
  repo public, and re-ran the failed job: **all green.** The README's raw `extends:` URL resolves
  (HTTP 200).

## Takeaways

- A clean local run goes stale within days: the advisories here appeared between the local check
  and the push. That's what the scheduled stance review and CI are for.
- A private repo can't pass the OSV job's upload step. Expect that on any private scaffold until
  it goes public, or until code scanning is available.
