# Stuck Stack — Planned Changes

> **Purpose:** Living log of changes requested in this thread. Each item is added as it is raised, with details filled in before implementation.
>
> **Related:** [`OVERVIEW.md`](./OVERVIEW.md) (codebase context) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) (system design)

---

## Status key

| Status | Meaning |
|---|---|
| `pending` | Raised, not yet started |
| `in progress` | Currently being implemented |
| `done` | Implemented and verified |
| `deferred` | Acknowledged but postponed |

---

## Change log

### Design decision #1 — Single active event vs multi-event membership

**Status:** `done` — **Option A confirmed** (one active event at a time; switch on join)

**Decision:** Keep one-at-a-time switching. No multi-event session or switcher for now.

---

### Change #2 — Fix landing page when database is not seeded

**Status:** `done`  
**Raised:** June 2026

#### Problem

When the demo event (`gitnation-2026`) is not in the database, `/` replaced the entire right column with *"No event seeded yet"* and a hardcoded `npx prisma db seed` command. Organizers had no visible path to sign in or create an account — the app looked broken on a fresh install.

#### Solution

- Keep the full hero + layout always visible
- **No demo event:** show a *Get started* panel explaining the two paths:
  - **Organizers** — prominent CTA to `/signin`, then create an event in workspace
  - **Attendees** — use the join link / QR from their organizer (not the landing page)
- **Demo event present:** unchanged join form for the seeded event
- Seed command demoted to a small dev-only footnote (`bun run db:seed`) instead of the only content

#### Files changed

- `app/page.tsx`

#### Acceptance

- Fresh DB (no seed): landing page loads, organizer can reach `/signin` and create events without running seed
- Seeded DB: attendee join flow unchanged

---

### Change #3 — Organizer viewing their own event board

**Status:** `done`  
**Raised:** June 2026

#### Problem

From workspace, **Open board** goes to `/event/[slug]` — the public attendee page. Organizers saw the same join prompt as attendees, even though they're managing the event, not participating on the board.

#### Decision

**Organizers don't join their own events.** The public board is an attendee preview for owners; management happens in the live dashboard and workspace. No join prompt, no opt-in to participate as attendee.

#### Solution

- `app/event/[slug]/page.tsx` resolves `getCurrentOrganizer()` and passes `eventOwner` when the signed-in organizer owns the event.
- `BlockerBoard` when `eventOwner` is set:
  - Header: *Managing as [name] · Live dashboard · Workspace*
  - **Attendee preview** panel instead of join form, with CTA to dashboard
  - Read-only board (no post / stuck-too / help actions)
  - No "+ I'm stuck on…" button
- Non-owners: unchanged attendee join flow.

#### Files changed

- `app/event/[slug]/page.tsx`
- `components/board/BlockerBoard.tsx`

#### Acceptance

- Organizer opens own event board → no join prompt; dashboard link visible
- Board is read-only preview for owners
- Regular attendees unchanged

---

### Change #4 — Board toast notifications with sound

**Status:** `done`  
**Raised:** June 2026

#### Requirements

- **Author:** toast + sound when someone marks "I'm stuck too" on their blocker
- **Subscribers** (author + anyone else stuck on the same blocker): toast + sound when someone offers to help
- Central notification management on the board (not per-card)
- No toasts on initial load or for the viewer's own actions

#### Solution

Polling diff layer (no new API):

| Layer | Role |
|---|---|
| `lib/notifications/diffBlockerNotifications.ts` | Pure diff between poll snapshots |
| `lib/hooks/useBoardNotifications.ts` | Baseline tracking, toast queue, sound trigger, `syncBaseline()` after own mutations |
| `components/board/BoardToastHost.tsx` | Brutalist toast stack (bottom-right, auto-dismiss, dismiss button) |
| `lib/notifications/playNotificationSound.ts` | Two-tone Web Audio chime |

**Subscription rules:**

- **Stuck too:** author always; fellow stuck-too users only if they were already subscribed before the count rose (avoids self-toast on toggle)
- **Help offer:** author + `viewerStuckToo`; skip when the new helper is the viewer

Tag filtering moved **client-side** so the notification feed always diffs the full board list (one SWR poll).

Notifications only run for **joined attendees** (not organizer preview mode).

#### Files changed

- `lib/notifications/*`, `lib/hooks/useBoardNotifications.ts`, `lib/hooks/useBlockers.ts`
- `components/board/BlockerBoard.tsx`, `components/board/BoardToastHost.tsx`
- `tests/diffBlockerNotifications.test.ts`

#### Acceptance

- Two browser windows: stuck-too / help actions in one → toast + sound in the other within ~3s
- Own actions do not toast the actor
- Organizer preview board: no notifications

---

### Change #5 — Mutually exclusive stuck-too vs help button states

**Status:** `done`  
**Raised:** June 2026

#### Problem

On a blocker card, **I'm stuck too** and **I can help** could both appear at once. Someone marked stuck could still offer help (and vice versa) — conflicting roles on the same issue.

#### Decision

**Mutually exclusive:** you're either stuck on a blocker or helping with it, not both. Toggle off stuck too before offering help.

#### Solution

**UI (`BlockerCard`)** — four viewer roles on a blocker:

| Role | Buttons shown |
|---|---|
| `neutral` | I'm stuck too · I can help |
| `stuck` | ✓ Stuck too (toggle off to switch) |
| `helper-offered` | ✓ Offering help · Claim a 5-min slot |
| `helper-active` | ✓ Helping (slot claimed) |

**API** — enforce the same rules:

- `toggleStuckToo`: reject adding stuck if a help offer exists
- `offerHelp`: reject if a stuck-too record exists

#### Files changed

- `components/board/BlockerCard.tsx`
- `lib/services/blockers.ts`, `lib/services/offers.ts`

---

### Change #6 — Kendo TaskBoard grouping on the blocker board

**Status:** `done`  
**Raised:** June 2026

#### Problem

The board was a long vertical scroll grouped only by OPEN / MATCHED / SOLVED. Hard to spot **your** blockers, ones you're **stuck on**, or ones you're **helping with**.

#### Solution

Replaced the vertical grid with **Kendo TaskBoard** horizontal lanes (`@progress/kendo-react-taskboard`):

**Joined attendees (personal view):**

| Column | Contents |
|---|---|
| My blockers | `viewerIsAuthor` |
| Stuck with me | `viewerStuckToo` |
| I'm helping | `viewerOffer` |
| Open / Matched / Solved | Everyone else's blockers by status |

**Organizer preview / not joined:** Open · Matched · Solved only.

Each lane scrolls vertically; the board scrolls horizontally. Custom brutal column headers, add/edit/drag disabled (columns are computed, not user-editable). Existing `BlockerCard` renders inside TaskBoard cards.

#### Files changed

- `@progress/kendo-react-taskboard` (dependency)
- `lib/board/taskboardColumns.ts`, `components/board/BlockerTaskBoard.tsx`, `BlockerTaskBoardParts.tsx`
- `components/board/BlockerBoard.tsx`, `app/globals.css`
- `tests/taskboardColumns.test.ts`

---

## Summary

| # | Change | Status |
|---|---|---|
| 1 | Single vs multi-event membership (design decision) | `done` |
| 2 | Landing page entry when DB not seeded | `done` |
| 3 | Organizer viewing own event board (owner-aware UI) | `done` |
| 4 | Board toast notifications with sound | `done` |
| 5 | Stuck-too vs help button states (mutually exclusive) | `done` |
| 6 | Kendo TaskBoard personal/status lanes | `done` |

---

*Last updated: June 2026*
