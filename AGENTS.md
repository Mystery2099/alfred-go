# AGENTS.md

## Purpose

Guidelines for contributors (human or AI) working on AlfredGO (SvelteKit version).

---

## Package Manager (IMPORTANT)

This project uses:

```txt
pnpm
```

- Always use `pnpm` for installing and running packages
- Do **not** use npm, yarn, or bun
- Do not mix lockfiles or package managers

---

## Core Principles

- Client-first UX
- Simplicity over complexity
- MVP focus
- Progress over perfection
- Follow existing patterns

---

## Tech Stack

- SvelteKit
- Svelte 5 (with runes: `$state`, `$derived`, `$effect`, `$inspect`)
- TypeScript
- Tailwind CSS
- Drizzle ORM + SQLite (better-sqlite3)
- @vite-pwa/sveltekit / vite-plugin-pwa
- Lucide icons (lucide-svelte)

---

## Architecture (IMPORTANT)

This is a SvelteKit app using the Node adapter. There is no separate Express API and no standalone SPA entrypoint.

- Routes live in `src/routes` using SvelteKit file-based routing (+page.svelte, +page.server.ts, +layout.svelte, etc.)
- Shared reactive app state lives in `src/lib/app-state.svelte.ts` using Svelte 5 runes
- Server-only modules live in `src/lib/server/` (auth, db, schema, seed)
- API endpoints live in `src/routes/api/` (+server.ts files)
- Server-side data loading uses +page.server.ts and +layout.server.ts load functions
- Form actions and API routes handle data mutations
- `src/hooks.server.ts` handles auth/session middleware
- Do not add a separate Express server or Vite proxy for API routes
- Do not add `src/main.ts` or another manual entrypoint; SvelteKit manages its own entry

### SvelteKit Conventions

- Use `$app/stores` for page/navigation stores
- Use `$lib/` imports for shared code
- Use `$lib/server/` imports for server-only code (never import server modules in client components)
- Use `+page.server.ts` for server-side data loading
- Use `+server.ts` for API routes (GET, POST, PUT, DELETE handlers)
- Use `export const ssr = true` (default) unless a route must be client-only
- Prerender only the `/offline` route; dynamic routes should not be prerendered

---

## Scope (MVP)

- Dashboard
- Search
- Favorites
- Tool listing
- Responsive layout
- PWA install/offline shell

---

## Roles

- applicant
- accepted_student
- student
- staff
- admin

---

## Workflow

1. Build UI with mock data
2. Add interactivity
3. Add persistence
4. Add PWA support
5. Polish

---

## Notes

- Prototype, not production
- Keep things simple
- Avoid overengineering
- Feel free to use Tanstack libraries.
- Use Sveltekit mcp to check stuff
- Use Context7 to check documentation
- Avoid Card Grids
- Take inspiration from material 3 design
- Take inspiration from the android settings app
- feel free to use bits-ui

DO NOT RUN THE DEV SERVER
