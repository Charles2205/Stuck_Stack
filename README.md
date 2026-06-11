# Stuck Stack

**Networking based on pain, not profiles.** Stuck Stack turns a tech conference into a live problem-solving network: attendees post one specific blocker they're stuck on, others mark **"I'm stuck too"** or offer to help, helpers claim **5-minute help slots**, and organisers get a **live dashboard** that detects blocker clusters and suggests pop-up clinics ("12 people stuck on AI deployment, 3 helpers available → run a 20-minute clinic at Table 3").

Built for the **Progress x GitNation hackathon** with Next.js (App Router), Prisma, and **KendoReact**.

📄 Full system design: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Quick start

```bash
npm install
npx prisma migrate dev   # creates SQLite db + runs the seed automatically
npm run dev
```

> If the seed didn't run (or you want a clean demo state): `npx prisma db seed`

**Checks** (run on every PR via GitHub Actions — `.github/workflows/ci.yml`):

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit (strict)
npm test            # Vitest unit tests (session token signing, Zod schemas)
```

Open <http://localhost:3000>:

1. **Join** the seeded event ("GitNation Conf 2026") with just your name.
2. **Board** (`/event/gitnation-2026`): Kendo Cards full of seeded blockers. Filter by tag (MultiSelect), post your own blocker (Dialog), hit *"I'm stuck too"*, or *"I can help"* → *"Claim a 5-min slot"*.
3. **Organizer?** Click *"Sign in to your workspace"* on the landing page (or go to `/signin`) and sign in as **Demo Organizer** — name only, no password. Unknown names get a one-click *"create it?"* offer.
4. **Workspace** (`/workspace`): your events as Kendo Cards with live blocker/attendee counts — create (Kendo Dialog + DatePicker, auto-generated editable slug), edit, and delete (confirm Dialog; deletion cascades) events.
5. **Organiser dashboard** (`/event/gitnation-2026/organiser`, owner-only): copy/share the event join link as a QR code, view the Kendo Grid of all blockers, Kendo Chart of demand by category, and live **suggested pop-up clinics**.

**Demo script:** Sign in as *Demo Organizer* → workspace → open the *GitNation Conf 2026* dashboard. In a second (private) window, join as an attendee and click *"I'm stuck too"* on a blocker — the dashboard numbers move within ~5 seconds.

### Auth model (demo-grade on purpose)

Two fully independent sessions:

- **Attendees** — name-only join, attendee ID in an httpOnly cookie (unchanged).
- **Organizers** — name-only sign-up/sign-in (names unique, case-insensitive), session = httpOnly cookie holding an **HMAC-signed organizer ID** (`SESSION_SECRET`). Everything under `/workspace`, the workspace APIs, and each event's organiser dashboard verify ownership server-side via `getCurrentOrganizer()` — client-supplied IDs are never trusted. The production upgrade path (NextAuth magic links) is in [ARCHITECTURE.md §10](docs/ARCHITECTURE.md).

**Real-time feel:** open the board in two browser windows (one normal, one private so each has its own identity), click *"I'm stuck too"* in one — the badge count updates in the other within ~3 seconds (SWR polling; see the SSE/websocket scaling path in ARCHITECTURE.md §5).

## Environment variables

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite for local dev (see `.env.example`). For production use a Postgres URL. |
| `SESSION_SECRET` | dev fallback | Signs the organizer session cookie. Set a real random secret in production. |
| `TELERIK_LICENSE` / license file | – | Optional: activates the KendoReact trial/dev license (see below). |

## KendoReact components & licensing

KendoReact is used throughout (judging requirement):

| Component | Where |
|---|---|
| **Card** | blocker cards on the public board |
| **Badge** | "stuck too" + helper counts, status chips |
| **MultiSelect** | tag picker when posting, tag filter on the board |
| **Dialog** | "post a blocker" and "claim a help slot" flows |
| **Grid** (sortable, filterable) | organiser view of all blockers |
| **Chart** | demand vs. helpers by category on the dashboard |
| **DatePicker** | event date in the workspace create/edit dialog |
| **Buttons / Inputs / TextArea / NumericTextBox / Label** | all forms and actions |
| **Scheduler** | *not in MVP* — the help-slot picker is a simple form; the swap point is marked `TODO(kendo-scheduler)` in `components/board/ClaimSlotDialog.tsx` |

**Licensing:** free-tier components (Buttons, Inputs, …) need no license. Grid, Chart, Dialog & co. run under the **KendoReact trial license** — without an activated license they work fully but show a watermark/console notice. To remove it, sign up for the free trial at telerik.com, download your license key, and run `npx kendo-ui-license activate` (or set the `TELERIK_LICENSE` env var, including on Vercel).

## Deploy to Vercel

The schema is Postgres-compatible; only the datasource changes:

1. In `prisma/schema.prisma`, set `provider = "postgresql"`.
2. Create a Postgres database (e.g. Neon or Supabase via the Vercel Marketplace) and set `DATABASE_URL` in Vercel project settings (pooled connection string).
3. Regenerate migrations against Postgres once locally (`npx prisma migrate dev`), commit them.
4. Set the build command to `prisma generate && prisma migrate deploy && next build` (or add `"postinstall": "prisma generate"`).
5. `vercel deploy` (or connect the Git repo). Seed once with `npx prisma db seed` pointed at the production `DATABASE_URL`.

## Project tour

```
app/                  pages + REST route handlers (thin controllers)
components/board/     Kendo Cards, Badges, MultiSelect filter, Dialogs
components/organiser/ Kendo Grid, Kendo Chart, clinic suggestion panel
lib/services/         all business logic & Prisma access
lib/hooks/            SWR polling hooks (the realtime swap point)
prisma/               schema, migrations, demo seed
docs/ARCHITECTURE.md  design document
```

## What we'd build next

- **Real auth** — NextAuth magic links; QR codes on badges encoding a signed join token keep the zero-friction flow with real identity.
- **Push instead of polling** — SSE endpoint behind the existing SWR hooks; no component changes (ARCHITECTURE.md §5).
- **Multi-organizer events** — co-organizer invites on top of the existing workspace event CRUD.
- **Kendo Scheduler** — visual help-slot timeline per help-desk table.
- **Post-event recap** — "who helped me / who I helped" follow-up email so 5-minute slots become lasting connections.
- **Clinic lifecycle** — organisers accept a suggestion → attendees with matching blockers get notified, room/table gets booked.
