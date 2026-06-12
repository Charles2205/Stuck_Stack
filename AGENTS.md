<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Prefer `bun` over `npm` for install, dev, typecheck, and database scripts in this workspace.
- Log each requested change in `docs/CHANGES.md` with status and scope before implementation; user raises changes one at a time.
- Use `docs/OVERVIEW.md` as the codebase discovery reference for product intent and existing behavior.

## Learned Workspace Facts

- Stuck Stack is a Progress × GitNation hackathon app: attendee blocker board plus organizer live dashboard, built with Next.js, KendoReact, Prisma (SQLite), and name-only auth.
- Attendee and organizer sessions are independent httpOnly cookies; the same person can use both in separate tabs.
- Attendees have one active event at a time; joining another event replaces the session (switch, not multi-membership).
- Event owners viewing `/event/[slug]` get a read-only attendee preview—organizers do not join their own events on the board.
- Blocker interactions treat "I'm stuck too" and "I can help" as mutually exclusive on the same blocker.
- `docs/CHANGES.md` tracks design decisions and change log items for ongoing work in this project.
