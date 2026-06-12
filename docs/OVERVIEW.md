# Stuck Stack — Codebase Overview

> **Purpose of this document:** A discovery-oriented guide to what this project is trying to accomplish, who it serves, and what exists today. For layer-by-layer technical design, see [`ARCHITECTURE.md`](./ARCHITECTURE.md). For setup and demo scripts, see the root [`README.md`](../README.md).

---

## What problem is this solving?

Tech conferences are full of people with overlapping problems and complementary expertise, but traditional networking (badges, LinkedIn, hallway chat) optimizes for **who you are**, not **what you're stuck on**.

**Stuck Stack** reframes conference networking around a single unit of value: a **blocker** — one specific thing an attendee is stuck on. Others can signal **"I'm stuck too"**, offer **"I can help"**, and claim **5-minute help slots**. Organisers get a **live dashboard** that surfaces demand clusters and suggests **pop-up clinics** (e.g. "12 people stuck on AI deployment, 3 helpers available → run a 20-minute clinic at Table 3").

The pitch: **networking based on pain, not profiles.**

---

## Origin and constraints

| Context | Detail |
|---|---|
| **Built for** | Progress × GitNation hackathon |
| **UI requirement** | KendoReact is a first-class citizen (judging checklist) |
| **Demo philosophy** | Zero-friction join — name only, no passwords, no email verification |
| **Real-time feel** | SWR polling (3s board / 5s dashboard), not websockets — deliberate for serverless simplicity |
| **Database** | SQLite locally; schema is Postgres-compatible for Vercel deployment |

The codebase is intentionally **demo-grade** in auth and realtime, with documented upgrade paths to production patterns (NextAuth, SSE, soft-delete, etc.) in `ARCHITECTURE.md`.

---

## Personas and user journeys

### Attendee (conference participant)

1. Lands on `/` or scans a QR code → `/event/[slug]`
2. Joins the event by typing their name (creates an `Attendee`, sets httpOnly cookie)
3. Browses the **blocker board** — cards grouped by status (Open / Matched / Solved)
4. Can **post a blocker** (title, description, tags), **toggle "I'm stuck too"**, **offer help**, or **claim a 5-minute slot** on someone else's blocker
5. When a slot is claimed, the blocker moves to **MATCHED**; author or organiser can mark it **SOLVED**

### Helper (also an attendee)

Same identity model as attendee. A helper offers help on a blocker → claims a slot with start time + location → creates a `HelpSlot` linked to their `HelpOffer`.

### Organizer (event owner)

1. Signs in at `/signin` with name only (separate session from attendees)
2. Manages events in `/workspace` — create, edit, delete (with confirm dialog)
3. Opens the **live dashboard** at `/event/[slug]/organiser` (owner-gated server-side)
4. Shares the event via **QR code + join link** from the dashboard
5. Monitors stats, category demand chart, all blockers grid, and **computed clinic suggestions**

**Important:** Attendee and organizer sessions are **fully independent**. The same person can be signed in as an organizer in one tab and join as an attendee in another (private window).

---

## Core concepts

| Concept | What it is | Stored? |
|---|---|---|
| **Blocker** | A specific problem posted by an attendee | Yes — `Blocker` model |
| **Tag** | Shared vocabulary (AI/LLMs, RAG, DevOps, …) | Yes — m:n with Blocker |
| **Stuck too** | "Me too" signal on a blocker | Yes — toggle per attendee |
| **Help offer** | "I can help" from a helper | Yes — idempotent per helper per blocker |
| **Help slot** | Concrete 5-minute meeting (time + location) | Yes — 1:1 with claimed offer |
| **Clinic suggestion** | Pop-up help desk recommendation when a tag has ≥3 open blockers and ≥1 helper | **No** — computed at read time in `lib/services/dashboard.ts` |

### Blocker lifecycle

```
OPEN  →  MATCHED  →  SOLVED
         (slot claimed)
```

### Clinic suggestion logic (simplified)

For each tag with open blockers:
- **Demand** = open blockers + sum of "stuck too" counts
- **Helpers** = distinct attendees with offers on those blockers
- If open blockers ≥ 3 **and** helpers ≥ 1 → suggest a clinic, ranked by demand

Clinics are **read-only suggestions** today — organisers cannot accept them, schedule them, or notify attendees yet.

---

## What's built today

### Pages (6 routes)

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing + join form for the seeded demo event |
| `/event/[slug]` | Public | Live blocker board (main attendee experience) |
| `/event/[slug]/organiser` | Organizer (owner) | Live dashboard with stats, chart, grid, clinics, QR share |
| `/signin` | Public | Organizer sign-in / sign-up (name only) |
| `/workspace` | Organizer | Event CRUD home with live aggregate counts |

### API surface (14 endpoints)

Grouped by concern:

- **Attendee session:** `POST .../join`, `GET /api/me`
- **Blockers:** list, create, stuck-too toggle, offer-help, solve
- **Help slots:** claim offer → create slot
- **Dashboard:** aggregates + clinic suggestions
- **Organizer auth:** signup, signin, signout, me
- **Workspace:** list/create/update/delete events (ownership-checked)

All mutating routes validate with **Zod** (`lib/validation.ts`). Business logic lives in **`lib/services/*`** — route handlers are thin controllers.

### UI components (KendoReact)

| Area | Components | Kendo widgets used |
|---|---|---|
| Board | `BlockerBoard`, `BlockerCard`, `TagFilter`, `PostBlockerDialog`, `ClaimSlotDialog` | Card, Badge, MultiSelect, Dialog, Buttons |
| Organiser | `OrganiserDashboard`, `BlockerGrid`, `CategoryChart`, `ClinicSuggestions`, `EventSharePanel` | Grid, Chart, Buttons + QR via `qrcode.react` |
| Workspace | `WorkspaceHome`, `SignInForm`, `EventFormDialog`, `DeleteEventDialog` | Card, Dialog, DatePicker, Input, Button |
| Shared | `JoinEventForm` | Input, Button |

**Not in MVP:** Kendo Scheduler (help-slot picker is a simple form; swap point marked in `ClaimSlotDialog.tsx`).

### Data and demo

- **Prisma schema:** Organizer → Event → Attendee / Blocker, with StuckToo, HelpOffer, HelpSlot, Tag
- **Seed:** `prisma/seed.ts` creates "GitNation Conf 2026" with realistic blockers shaped for the demo script (hero RAG card, clinic-triggering clusters, mixed statuses)
- **Demo organizer:** seeded as "Demo Organizer" for instant workspace access

### Engineering quality

- TypeScript strict, shared DTOs in `lib/types.ts`
- CI on PRs: lint, typecheck, Vitest (`tests/signedToken.test.ts`, `tests/validation.test.ts`)
- Brutalist UI theme (Tailwind + Kendo default theme)

---

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────┐
│  Pages (RSC shells + client components with KendoReact) │
│       ↓ SWR hooks (lib/hooks/*) — polling swap point    │
│  API routes (app/api/**) — Zod validate, call services  │
│       ↓                                                 │
│  Services (lib/services/*) — business logic + Prisma    │
│       ↓                                                 │
│  SQLite (dev) / Postgres (prod)                         │
└─────────────────────────────────────────────────────────┘
```

**Two auth systems, never mixed:**

| Session | Cookie | Identity | Used by |
|---|---|---|---|
| Attendee | `attendeeId` | Plain attendee ID | Board actions, `/api/me` |
| Organizer | `organizer_session` | HMAC-signed organizer ID | Workspace, organiser dashboard |

Server-side gates (`getCurrentOrganizer()`, `requireOrganizer()`) never trust client-supplied IDs.

---

## Recent development trajectory

From git history, the project evolved in roughly this order:

1. **Core MVP** — blocker board, stuck-too, help offers, slot claiming, organiser dashboard with clinic engine
2. **QR sharing** — organisers can share/copy/download a join QR from the dashboard
3. **Organizer workspace** — first-class `Organizer` model, name-only auth, event CRUD, owner-gated dashboard (replacing legacy attendee-role gate)
4. **CI + hardening** — GitHub Actions, `SESSION_SECRET` required in production, brutalist UI polish

The schema was **multi-event from day one**; the workspace UI makes that usable for organisers creating their own events beyond the seeded demo.

---

## Intentional limitations (demo vs production)

These are **by design** for the hackathon demo, not oversights:

| Area | Demo behavior | Documented upgrade path |
|---|---|---|
| Attendee auth | Name → cookie, no verification | NextAuth + badge QR with signed join token |
| Organizer auth | Name-only, HMAC cookie | NextAuth magic links |
| Realtime | SWR polling every 3–5s | SSE behind existing hooks (no component changes) |
| Clinics | Computed suggestions only | Accept → schedule → notify lifecycle |
| Event delete | Hard cascade delete | Soft-delete with `archivedAt` |
| Help slots | Simple datetime + location form | Kendo Scheduler timeline |
| Post-event | None | Recap emails ("who helped me") |

---

## What's not built yet

From README and ARCHITECTURE "what we'd build next":

- **Real auth** (NextAuth, email magic links, verified identity)
- **Push instead of poll** (SSE endpoint, same hook swap point)
- **Multi-organizer events** (co-organizer invites)
- **Kendo Scheduler** for visual slot booking
- **Clinic lifecycle** (accept suggestion → notify matching attendees → book room/table)
- **Post-event recap** (follow-up connections after 5-minute slots)

---

## Key files to know before changing things

| If you're working on… | Start here |
|---|---|
| Blocker board UX | `components/board/BlockerBoard.tsx`, `lib/services/blockers.ts` |
| Help offers / slots | `lib/services/offers.ts`, `components/board/ClaimSlotDialog.tsx` |
| Organiser dashboard | `components/organiser/OrganiserDashboard.tsx`, `lib/services/dashboard.ts` |
| Clinic suggestions | `lib/services/dashboard.ts` (`CLINIC_MIN_BLOCKERS`, `CLINIC_DURATION_MINUTES` in `lib/constants.ts`) |
| Organizer auth | `lib/organizerSession.ts`, `lib/services/organizers.ts` |
| Workspace / event CRUD | `lib/services/workspaceEvents.ts`, `components/workspace/*` |
| Attendee session | `lib/session.ts`, `lib/services/events.ts` |
| API validation | `lib/validation.ts` |
| Realtime strategy | `lib/hooks/useBlockers.ts`, `lib/hooks/useDashboard.ts` |
| Demo data | `prisma/seed.ts`, `lib/constants.ts` (`DEMO_EVENT_SLUG`) |

---

## Demo script (quick validation)

1. `bun install` (or `npm install`) → `npx prisma migrate dev` → `bun run dev` (port **3082**)
2. Open `/` → join as any attendee name → land on board
3. Click **"I'm stuck too"** on a seeded blocker
4. In a private window: sign in as **Demo Organizer** → `/workspace` → open GitNation dashboard
5. Repeat the stuck-too click in the first window → dashboard counts update within ~5 seconds

---

## Related documentation

| Document | Focus |
|---|---|
| [`README.md`](../README.md) | Quick start, env vars, Kendo licensing, deploy steps |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Deep system design — data model, API conventions, auth paths, realtime swap, engineering standards |

---

*Last updated from codebase discovery — June 2026.*
