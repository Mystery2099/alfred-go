# AlfredGO

A prototype campus tools dashboard for Alfred State College, built with SvelteKit.

AlfredGO provides a single place for students, applicants, staff, and admins to discover, launch, and manage campus tools and resources. It supports role-based access, favorites, announcements, offline support via PWA, and push notifications.

## Features

- **Dashboard** — personalized landing with announcements, pinned/favorite tools, and recent activity
- **Browse & Search** — explore tools by category or search across names, descriptions, and tags
- **Favorites** — pin frequently used tools for quick access from the dashboard
- **Announcements** — active notices with urgency filtering (updates, deadlines, reminders)
- **Role-based Access** — tools visibility adapts to the user's role
- **Admin Panel** — manage tools, categories, and announcements
- **PWA / Offline** — installable app shell with an offline fallback page
- **Push Notifications** — optional web push subscriptions for announcements
- **Activity Tracking** — logs tool launches, favorites, and logins
- **Accessibility** — theme switching, reduced motion, high contrast, and compact density modes
- **Command Bar** — keyboard-driven navigation and actions via TanStack Hotkeys

## Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) 2
- **UI:** Svelte 5 (runes), Tailwind CSS 3, Lucide icons
- **Database:** SQLite via `better-sqlite3` with Drizzle ORM
- **Auth:** cookie-based sessions with bcrypt-hashed passwords
- **PWA:** `vite-plugin-pwa` with a custom service worker
- **Push:** `web-push` for server-side notification delivery
- **Hotkeys:** `@tanstack/svelte-hotkeys`

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/)

## Getting Started

```sh
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Or start and open in the browser
pnpm dev -- --open
```

The dev server starts on `http://localhost:5173` by default.

## Building

```sh
# Production build
pnpm build

# Preview the production build locally
pnpm preview
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Path to the SQLite database file | `alfredgo.sqlite` |
| `VAPID_PRIVATE_KEY` | VAPID private key for push notifications | *(none — push subscriptions fail closed)* |
| `ALLOW_DEMO_SEED` | Set to `true` to allow demo account seeding in production | *(unset)* |

## Demo Accounts

The project seeds demo accounts on first run for local prototyping:

| Role | Email | Password |
|------|-------|----------|
| Applicant | `applicant@alfredgo.local` | `ApplicantGo2026!` |
| Accepted Student | `accepted.student@alfredgo.local` | `AcceptedGo2026!` |
| Student | `student@alfredgo.local` | `StudentGo2026!` |
| Staff | `staff@alfredgo.local` | `StaffGo2026!` |
| Admin | `admin@alfredgo.local` | `AdminGo2026!` |

## Project Structure

```
src/
├── routes/               # SvelteKit routes (+page.svelte, +page.server.ts, +server.ts)
│   ├── (app)/            # Main app pages (dashboard, browse, favorites, settings, etc.)
│   ├── admin/            # Admin management pages
│   ├── api/              # API endpoints (auth, favorites, push, activity, etc.)
│   ├── login/            # Login page
│   └── offline/          # Offline fallback page (prerendered)
├── lib/
│   ├── components/       # Shared Svelte components
│   ├── server/           # Server-only modules (db, schema, auth, seed, push)
│   ├── app-state.svelte.ts  # Global reactive state (Svelte 5 runes)
│   └── types.ts          # TypeScript type definitions
├── app.html              # HTML template
├── app.css               # Global styles / Tailwind directives
├── hooks.server.ts       # Auth/session middleware
└── service-worker.ts     # PWA service worker
```

## Roles

- `applicant`
- `accepted_student`
- `student`
- `staff`
- `admin`

Admins can create, edit, and deactivate tools, categories, and announcements. All other roles see a filtered view of tools based on `audienceRoles`.

## Notes

- This is a **prototype / MVP**, not a production system.
- Keep the stack simple; avoid overengineering.
- Use `pnpm` exclusively — do not mix with npm, yarn, or bun.
