# Epics feature — notes & deferred work

Tracking decisions and follow-ups for the custom Epics / Backlog / Gantt feature.

## Deferred: generalize the comment component (cards + epics share one)

**Status:** deferred (2026-06-16). Decide later.

**Context.** Epic comments currently use a **separate** component
(`client/src/components/epics/EpicModal/Comment.jsx` + `Comment.module.scss`)
instead of reusing the existing card-comment UI
(`client/src/components/comments/Comments/` — `Comments.jsx`, `Item.jsx`, `Add.jsx`, `Edit.jsx`).

**Why a separate one was written (not a mistake, but a trade-off).** The existing
card-comment components can't be dropped in for epics because they are hard-wired to cards:
1. **Data model** — `Item.jsx` uses `makeSelectCommentById()` (the `Comment` ORM model = card
   comments). Epics use a separate `EpicComment` model.
2. **Actions** — it dispatches `deleteComment` / `updateComment` / `createCommentInCurrentCard`.
   Epics need the `*EpicComment` equivalents.
3. **Implicit "current card" context** — `Comments.jsx` / `Item.jsx` read `selectCurrentCard`
   from the store (for the comment list and archive/trash permission checks). There is no
   "current epic" in the router; the epic modal opens from local state.

**Downsides of the current (separate) approach:**
- The comment **bubble SCSS is duplicated** (copied from `comments/Comments/Item.module.scss`).
  If card-comment styling changes, epics won't follow automatically.
- The epic version is **simpler** than the card one: **no @mentions** support, and a
  plain-textarea edit instead of the card's mentions-aware `Edit`.

**Better long-term option:** refactor `comments/Comments/` into a **generic** component
parameterized over the entity (selectors/actions/membership), then have both cards and epics
use it. This is the proper DRY fix and gives epics @mentions + a single source of styling for
free — but it **modifies working card code**, so it carries more risk and is a larger change.

**Decision needed:** generic refactor (touch card code, full parity) vs. keep separate (contained,
just de-duplicate the SCSS).

## Other possible follow-ups (not requested yet)

- **Gantt:** shade the weekend area inside the bars/body too (currently only the header day
  cells are shaded); add week/month zoom presets; drag an *unscheduled* epic onto the timeline
  to schedule it.
- **Create-card-in-epic:** new cards land in the board's **first kanban list**. Could be made
  configurable (e.g. choose a target list).
- **i18n:** user-facing epic strings use `t(key, { defaultValue })` fallbacks (English works
  immediately). Proper locale entries (`en-US`, `de-DE`, …) not yet added.
