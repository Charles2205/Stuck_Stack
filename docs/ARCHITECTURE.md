# Stuck Stack — Architecture

> **One-line pitch:** Stuck Stack turns a tech conference into a live problem-solving network. Attendees post one specific blocker they're stuck on, others mark "I'm stuck too" or offer to help, helpers claim 5-minute help slots, and organisers get a live dashboard that detects blocker clusters and suggests pop-up clinics.

Built for the Progress x GitNation hackathon. KendoReact is a first-class citizen of the UI (judging requirement).

---

## 1. System overview

```
┌────────────────────────────────────────────────────────────────┐
│                         Next.js (App Router)                   │
│                                                                │
│  Pages (React Server Components + Client Components)           │
│  ├── /                      landing + "join event" flow        │
│  ├── /event/[slug]          public blocker board (KendoReact)  │
│  └── /event/[slug]/organiser  live dashboard (KendoReact)      │
│                                                                │
│  Client data layer: SWR hooks (lib/hooks/*) — 3–5 s polling    │
│            │                                                   │
│  API: REST route handlers (app/api/**) — thin controllers      │
│            │  Zod validation (lib/validation.ts)               │
│  Services: lib/services/* — all business logic & data access   │
│            │                                                   │
│  Prisma ORM (lib/db.ts singleton)                              │
│            │                                                   │
│  SQLite (dev) ──→ swap provider ──→ Postgres (Neon/Supabase)   │
└────────────────────────────────────────────────────────────────┘
```

Three layers, strictly separated:

1. **Route handlers** (`app/api/**/route.ts`) — parse/validate input with Zod, resolve the session attendee, call a service, shape the HTTP response. No Prisma calls here.
2. **Services** (`lib/services/*`) — all queries, mutations and business rules (toggle semantics, status transitions, clinic-cluster detection). Pure functions over the Prisma client; trivially unit-testable and reusable if we later add tRPC/GraphQL/websocket push.
3. **UI** (`app/**`, `components/**`) — server components for static shells; client components for everything interactive (all KendoReact widgets are client components).

## 2. File structure

```
docs/ARCHITECTURE.md        ← this document
prisma/
  schema.prisma             SQLite for dev, Postgres-compatible
  seed.ts                   "GitNation Conf 2026" demo data
lib/
  db.ts                     Prisma client singleton
  constants.ts              status/role string-union constants
  api.ts                    JSON response + error helpers
  session.ts                attendee cookie helpers
  validation.ts             Zod schemas (shared by API + forms)
  types.ts                  DTO types shared between API and UI
  services/
    events.ts               event lookup, join
    blockers.ts             list/create/stuck-too/solve
    offers.ts               offer help, claim slot
    dashboard.ts            aggregates + clinic suggestion engine
  hooks/
    useSession.ts           who am I (from /api/me)
    useBlockers.ts          board data, 3 s polling
    useDashboard.ts         dashboard data, 5 s polling
app/
  page.tsx                  landing + join
  event/[slug]/page.tsx     public board
  event/[slug]/organiser/page.tsx  organiser dashboard
  api/...                   REST endpoints (see §4)
components/
  JoinEventForm.tsx
  board/                    BlockerBoard, BlockerCard, TagFilter,
                            PostBlockerDialog, ClaimSlotDialog
  organiser/                BlockerGrid, CategoryChart, ClinicSuggestions
```

## 3. Data model

```
Event 1──* Attendee
Event 1──* Blocker *──* Tag
Blocker 1──* StuckToo *──1 Attendee     (unique per attendee per blocker)
Blocker 1──* HelpOffer *──1 Attendee    (unique per helper per blocker)
HelpOffer 1──1 HelpSlot
```

| Model | Purpose | Notes |
|---|---|---|
| `Event` | multi-event ready; demo seeds one | unique `slug` used in URLs |
| `Attendee` | lightweight identity | `role`: `ATTENDEE` \| `ORGANISER` |
| `Blocker` | the unit of the product | `status`: `OPEN` → `MATCHED` → `SOLVED` |
| `Tag` | shared vocabulary, m:n with Blocker | `connectOrCreate` on post |
| `StuckToo` | "me too" signal | `@@unique([blockerId, attendeeId])` — toggle |
| `HelpOffer` | "I can help" | `status`: `OFFERED` → `CLAIMED` → `COMPLETED` |
| `HelpSlot` | concrete 5-minute meeting | startTime, location, duration (default 5) |
| `ClinicSuggestion` | **computed, not stored** | see §6 |

**Why string columns instead of Prisma enums:** Prisma does not support `enum` on SQLite. We use `String` columns whose values are constrained by TypeScript const unions in `lib/constants.ts` and validated by Zod at the API boundary. The same schema works unchanged on Postgres; promoting the strings to native enums later is a single additive migration.

**Switching to Postgres for production (Vercel + Neon/Supabase):**
1. In `prisma/schema.prisma`: `provider = "postgresql"`.
2. Set `DATABASE_URL` to the pooled Postgres connection string.
3. `npx prisma migrate dev` once locally against a Postgres branch to regenerate migrations (SQLite migration SQL is dialect-specific), then `prisma migrate deploy` in CI.
No model or application code changes are required.

## 4. API surface (REST, Next.js route handlers)

| Method & path | Purpose |
|---|---|
| `POST /api/events/[slug]/join` | create attendee, set `attendeeId` cookie |
| `GET  /api/me` | current attendee (for session hydration) |
| `GET  /api/events/[slug]/blockers?tags=a,b&sort=stuck\|recent` | board list with tags, counts, viewer flags |
| `POST /api/events/[slug]/blockers` | create blocker (title, description, tags) |
| `POST /api/blockers/[id]/stuck-too` | toggle "I'm stuck too" |
| `POST /api/blockers/[id]/offer-help` | create help offer (idempotent per helper) |
| `POST /api/offers/[id]/claim` | claim 5-minute slot → blocker `MATCHED` |
| `POST /api/blockers/[id]/solve` | author or organiser → `SOLVED` |
| `GET  /api/events/[slug]/dashboard` | aggregates + clinic suggestions |

Conventions:
- Every mutating endpoint validates its body with a Zod schema from `lib/validation.ts`.
- Success: `200/201` with the resource or `{ ok: true, ... }`.
- Errors: consistent shape `{ "error": { "code": "NOT_FOUND" | "VALIDATION" | "UNAUTHORIZED" | "CONFLICT" | "INTERNAL", "message": string, "details"?: unknown } }` produced by `lib/api.ts`, so the client can handle every failure the same way.

## 5. Real-time strategy: polling now, push later

The demo requirement is "another tab sees my action within a few seconds". We use **SWR with `refreshInterval`** — 3 s on the board, 5 s on the dashboard — plus optimistic `mutate()` after the viewer's own actions so their tab updates instantly.

**Why polling for the hackathon:** zero infrastructure, works on Vercel serverless out of the box, no connection-state bugs during a live demo. At conference scale (a few hundred attendees, payloads of a few KB) polling every 3 s is well within both serverless and DB budgets.

**The swap point is deliberately narrow.** All reads flow through `lib/hooks/useBlockers.ts` and `useDashboard.ts`. Components only consume `{ data, mutate }`. The scaling path:

1. **SSE (next step):** add `GET /api/events/[slug]/stream` (route handler returning a `ReadableStream`), services emit invalidation events after each mutation, the hooks replace `refreshInterval` with an `EventSource` subscription that calls `mutate()`. **No component changes.**
2. **Websockets/managed realtime (later):** same hook-level swap to Pusher/Ably/Supabase Realtime if we need bi-directional messaging (e.g. live chat in a help slot).

## 6. Clinic suggestion engine (computed clusters)

`lib/services/dashboard.ts` derives suggestions at read time — no stored state, no background jobs, always consistent with the data:

```
for each tag:
  openBlockers = blockers with status OPEN carrying this tag
  demand       = openBlockers.length + Σ stuckToo counts on them
  helpers      = distinct attendees with OFFERED/CLAIMED offers on them
  if openBlockers.length ≥ CLINIC_MIN_BLOCKERS (3) and helpers ≥ 1:
    suggest clinic {
      title: "<Tag> Help Desk",
      demand, helperCount,
      location: deterministic table assignment ("Table 3", …),
      durationMinutes: 20
    }
ranked by demand desc
```

The threshold lives in one constant so organisers could tune it. Because it's computed, marking blockers solved instantly dissolves the cluster on the next poll.

## 7. Auth: frictionless by design (and its production path)

For a conference demo, sign-up friction kills adoption. Joining = typing your name:

1. `POST /api/events/[slug]/join` creates an `Attendee` row.
2. The attendee id is set as an **httpOnly, sameSite=lax cookie** (`attendeeId`) — not localStorage, so every API route can resolve the caller server-side with zero client plumbing.
3. `GET /api/me` hydrates the client session; the organiser dashboard is gated by `role === "ORGANISER"` (demo: a "join as organiser" toggle).

**Production replacement (documented path):** swap `lib/session.ts` for NextAuth (Auth.js) with an email-magic-link or conference-SSO provider. `Attendee` gains a `userId` link to NextAuth's `User`; `getSessionAttendee()` keeps its signature, so services and routes are untouched. QR codes on badges encoding a signed join token would preserve the zero-friction flow with real identity.

## 8. KendoReact component map (judging checklist)

| Component | Where | Role |
|---|---|---|
| **Card** | `components/board/BlockerCard.tsx` | every blocker on the public board |
| **Badge** | `BlockerCard` | "stuck too" count + helper count |
| **MultiSelect** | `TagFilter`, `PostBlockerDialog` | tag filtering + tag picking |
| **Dialog** | `PostBlockerDialog`, `ClaimSlotDialog` | post-a-blocker and claim-a-slot flows |
| **Grid** | `organiser/BlockerGrid.tsx` | sortable, filterable view of all blockers |
| **Chart** | `organiser/CategoryChart.tsx` | column chart of top blocker categories |
| **Buttons/Inputs/Labels** | throughout | forms and actions |
| **Scheduler** | *not in MVP* | help-slot timeline is a simple list; swap point marked with `TODO(kendo-scheduler)` in `ClaimSlotDialog.tsx` |

Grid and Chart are licensed components running under the KendoReact **trial** license for the hackathon (see README).

## 9. Engineering standards

- TypeScript `strict`; DTO types in `lib/types.ts` shared by services and UI — no `any`.
- Server components render page shells; KendoReact widgets live in `"use client"` components.
- Route handlers contain no business logic; services contain no HTTP concerns.
- Zod schemas are the single source of truth for input shapes, reused by client forms for parity.
- Seed data (`prisma/seed.ts`) makes the full demo script reproducible from a clean clone: `npm install && npx prisma migrate dev && npm run dev`.

## 10. What we'd build next

- **Real auth** — NextAuth magic links + badge QR join codes (§7).
- **Push updates** — SSE/websocket swap behind the existing hooks (§5).
- **Multi-event admin** — event CRUD, per-event organiser invites; schema is already multi-event.
- **Kendo Scheduler** — visual help-slot timeline per table/room.
- **Post-event recap** — "who helped me / who I helped" follow-up emails, turning 5-minute slots into lasting connections.
- **Clinic lifecycle** — organisers accept a suggestion → it becomes a scheduled clinic, attendees get notified, attached blockers auto-link.
