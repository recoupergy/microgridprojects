# Additive project research

Files in this directory add current, source-backed findings to the recovered historical records and the hand-curated baseline in `research/overrides.json`. The build script loads every `.json` file in lexical order and merges records by project slug.

Each fragment is a JSON object keyed by an exact slug from `app/data/projects.ts`. Supported fields are:

- `researchedAt`: ISO date of the most recent review.
- `summary`: concise description of what the project is and what public evidence establishes.
- `status`: current operating, construction, proposal, cancellation, replacement, or unknown state—with dates when available.
- `organizations`: `{ name, role, sourceIds[] }` records.
- `specifications`: `{ label, value, sourceIds[] }` records, including generation and storage ratings and energy mix.
- `equipment`: `{ category, manufacturer?, model?, detail, sourceIds[] }` records.
- `technicalDetails`: `{ category, detail, sourceIds[] }` records, including controls, architecture, performance, milestones, and later updates.
- `sources`: `{ id, title, url, publisher, kind }` records, where `kind` is `primary`, `secondary`, or `archive`.

Prefer owner/operator, government, regulator, utility, university, and equipment-supplier sources. Use secondary reporting to fill genuine gaps or document subsequent outcomes. Do not infer a vendor, model, rating, status, or relationship that the cited source does not establish. When sources conflict, preserve the phase/date context in the labels and notes rather than silently choosing one value.
