# Stuck Stack — Demo Video Script

**Target Audience:** Hackathon Judges (Progress × GitNation)
**Estimated Length:** ~3 minutes
**Setup required:** 
- Two browser windows (Window 1: Organizer, Window 2: Attendee)
- Seeded database (`bun run db:seed`) to populate realistic blockers

---

## 🎬 Scene 1: Introduction & The Problem (0:00 - 0:30)

**[Visual: Title Card / Screen recording starts. Show the landing page with no event seeded initially, demonstrating the clean entry paths for Organizers vs Attendees, then switch to a seeded DB state.]**
**Speaker:** "Hello judges, and welcome to Stuck Stack, our submission for the Progress and GitNation hackathon! At events and tech conferences, we usually network based on *who we are*—looking at badges and LinkedIn. But what if we networked based on *what we're stuck on*? Stuck Stack is a live blocker board that connects attendees who need help with people who can help, instantly.

We've built this to be completely frictionless. Attendees just need a name to join, and organizers can set up an event in seconds. Let's see it in action."

---

## 🎬 Scene 2: The Organizer Workspace (0:30 - 1:00)

**[Visual: Window 1 (Private/Incognito) - Sign in as 'Demo Organizer', go to `/workspace`]**
**Speaker:** "I'm signing in as an Organizer. Here in my workspace, I can manage all my events. We'll open up the 'GitNation Conf 2026' event."

**[Visual: Open the Live Dashboard (`/event/gitnation-2026/organiser`)]**
**Speaker:** "This is the live dashboard. Organizers get a bird's-eye view of demand—what are people stuck on right now? We're using KendoReact Charts to visualize the categories, and our system even automatically suggests 'Pop-up Clinics' when enough people are stuck on the same topic and a helper is available. 

From here, I can generate a QR code and share the join link with the audience."

---

## 🎬 Scene 3: The Attendee Experience & Kendo TaskBoard (1:00 - 1:45)

**[Visual: Window 2 - Normal browser window. Navigate to `/` and join as 'Alice'.]**
**Speaker:** "Now, let's switch to an attendee. I scan the QR code and join just by typing my name—no passwords, no email verification."

**[Visual: Land on the Blocker Board (`/event/gitnation-2026`). Slowly scroll horizontally and vertically.]**
**Speaker:** "Welcome to the Blocker Board. To make this easy to navigate, we recently migrated the layout to use a **KendoReact TaskBoard**. 

This isn't your standard Kanban. We've customized the lanes to be deeply personal:
- **My blockers** (Things I've posted)
- **Stuck with me** (Things I'm also stuck on)
- **I'm helping** (Blockers where I've offered to help)
- Plus the global columns: Open, Matched, and Solved.

It's a brutalist, horizontal scrolling layout that keeps your priorities front and center."

---

## 🎬 Scene 4: Mutually Exclusive Actions & Real-Time Toasts (1:45 - 2:30)

**[Visual: Click on a Blocker Card in the 'Open' column. Show the "I'm stuck too" and "I can help" buttons.]**
**Speaker:** "Let's interact with a blocker. Notice the buttons: 'I'm stuck too' and 'I can help'. We've built these to be mutually exclusive—you're either stuck, or you're helping."

**[Visual: Click "I'm stuck too". The button state changes. The "I can help" button disappears.]**
**Speaker:** "When I click 'I'm stuck too', I get added to the demand count, and I can no longer offer help on this specific issue unless I toggle it off."

**[Visual: Bring Window 1 (Organizer/Another Attendee) and Window 2 side-by-side. In Window 1 (joined as another attendee 'Bob'), click "I can help" on the SAME blocker Alice just marked as stuck.]**
**Speaker:** "Now for the real-time magic. We're using SWR polling to keep things live without the overhead of websockets. If someone else offers help on a blocker I'm stuck on..."

**[Visual: Window 2 (Alice) immediately receives a Toast Notification in the bottom right, and a chime sound plays 🔔.]**
**Speaker:** "There it is! A live toast notification with a chime sound alerts me that help has arrived. This works via a smart diffing layer that checks our SWR snapshots."

---

## 🎬 Scene 5: Organizer Board Preview & Wrap Up (2:30 - 3:00)

**[Visual: Go back to Window 1 (Organizer). Navigate to the public board URL `/event/gitnation-2026`]**
**Speaker:** "Finally, if an Organizer wants to see what the attendees see, they can visit the board. But because we've hardened our auth and roles, the Organizer sees a **Read-Only Preview**. They aren't prompted to join as an attendee, and they can't accidentally interfere with the data."

**[Visual: Show the Read-Only banner at the top. Fade to black or closing title card.]**
**Speaker:** "Stuck Stack turns idle conference attendees into a dynamic, helpful community, powered by Next.js and KendoReact. Networking based on pain, not profiles. Thank you!"
