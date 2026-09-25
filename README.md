# Campus Helpdesk — Student Support & Ticket Management System

Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/login`.

## Architecture notes

- **`schema.sql`** — the real PostgreSQL schema this app is modeled on
  (`users`, `categories`, `tickets`, `ticket_activity_history`), with 5 seed
  tickets, 5 seed users, and seed activity rows.
- **`lib/store.ts`** — a client-side data layer that mirrors the SQL schema
  1:1 and persists to `localStorage`, so the assessment runs without a live
  database/API. Swap its functions for real `fetch()` calls to REST
  endpoints backed by `schema.sql` to go to production — the shapes match.
- **`lib/auth.tsx`** — mock role-based auth (`student` / `staff` / `admin`)
  via React Context + `localStorage`, seeded from a demo user directory.
- **Pages**
  - `/login` — role toggle (Student / Staff), sets session context.
  - `/student/create-ticket` — ticket submission form with a live SLA
    deadline preview that reacts to the selected priority.
  - `/dashboard/tickets` — staff/admin queue: search, status/priority/
    category/SLA filters, SLA urgency badges, one-click status advance.
  - `/tickets/[id]` — full ticket detail: SLA countdown, status control,
    staff reassignment, internal notes, and a chronological activity
    timeline sourced from `ticket_activity_history`.

## SLA policy

| Priority | Response window |
|----------|------------------|
| Urgent   | 4 hours          |
| High     | 24 hours         |
| Medium   | 48 hours         |
| Low      | 72 hours         |

A ticket is **Due soon** inside the last 4 hours of its window, and
**Overdue** once the deadline passes (unless resolved/closed).

## Demo accounts

Selectable directly from the login screen — any password is accepted:

- **Students:** Ananya Rao, Rohan Mehta
- **Staff:** Priya Nair (Accounts), Suresh Kumar (Examination Cell)
- **Admin:** Dr. Meena Iyer (Student Affairs)
