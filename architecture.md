# AlfredGO Architecture

## 1. Purpose

AlfredGO is a clientside-first Progressive Web App designed to provide Alfred State users with a cleaner, faster, and more mobile-friendly interface for finding and accessing campus software resources.

The application should prioritize:

- Fast navigation
- Mobile and desktop usability
- Search-first access to tools
- Favorites/bookmarks
- Role-aware dashboards
- Offline-friendly PWA behavior
- A realistic path toward future Alfred State SSO integration

---

## 2. Chosen Stack

### Primary Stack

| Area                     | Decision                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| App framework            | SvelteKit                                                             |
| Language                 | TypeScript                                                            |
| UI framework             | Svelte 5                                                              |
| Styling                  | Tailwind CSS                                                          |
| Routing                  | SvelteKit file-based routing                                          |
| Data loading             | SvelteKit load functions (+page.server.ts, +layout.server.ts)         |
| ORM                      | Drizzle ORM                                                           |
| Database                 | SQLite for prototype                                                  |
| PWA support              | @vite-pwa/sveltekit                                                   |
| Icons                    | Lucide icons                                                          |
| Accessible UI primitives | Bits UI / shadcn-svelte                                               |
| Auth model               | Mock authentication with role selector                                |
| Hosting                  | SvelteKit Node adapter in Docker behind Traefik and Cloudflare Tunnel |

### Fallback Stack Options

The application should be designed so that the core product decisions are not tightly coupled to one framework where avoidable.

---

## 3. Architecture Style

AlfredGO will use a **clientside-first, server-capable architecture**.

This means the UI should feel like a fast SPA/PWA, while still using SvelteKit server load functions where persistence, protected operations, or database access are needed.

### Client Responsibilities

- Render the dashboard UI
- Manage search/filter state
- Manage responsive layouts
- Cache commonly used data
- Provide offline shell behavior
- Store short-lived UI state
- Support PWA installability

### Server Responsibilities

- Provide tool/resource data via +page.server.ts load functions
- Persist favorites and preferences via server actions and API routes
- Support role-aware data loading
- Provide admin CRUD operations for tools/categories
- Eventually integrate with institutional SSO

### Implementation Boundaries

AlfredGO uses a single SvelteKit architecture:

- `src/routes` contains file-based routes (+page.svelte, +page.server.ts, etc.)
- `src/lib/app-state.svelte.ts` contains shared Svelte 5 reactive state using runes ($state, $derived)
- `src/lib/server/` contains all server-only modules (auth, db, schema, seed)
- `src/routes/api/` contains SvelteKit API routes for data mutations
- There is no separate Express server and no standalone SPA entrypoint
- Do not add a manual Vite proxy or Express middleware unless intentionally adopting that pattern

---

## 4. User Roles

The prototype should support the following roles:

| Role             | Purpose                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| Applicant        | Prospective student who has applied but is not yet accepted                          |
| Accepted Student | Accepted student who may need onboarding, enrollment, housing, and orientation tools |
| Student          | Current student accessing academic, dining, housing, and campus systems              |
| Staff            | Staff user accessing staff-relevant services                                         |
| Admin            | Administrative user who can manage tools, categories, and dashboard defaults         |

For the prototype, roles will be selected through mock authentication. In production, roles would come from Alfred State SSO and institutional identity data.

---

## 5. Core Product Features

### MVP Features

- Role-based dashboard views
- Search-first tool discovery
- Category and tag filtering
- Favorites/bookmarks
- Tool detail pages
- External tool launch links
- Mobile bottom navigation
- Desktop sidebar navigation
- User settings/preferences
- PWA install support
- Offline application shell

### Stretch Features

- Admin tool editor
- Custom card sizing
- Custom card colors
- User-defined dashboard sections
- Recently used tools
- Usage analytics
- Announcements or alerts
- Import/export preferences
- More advanced offline caching

---

## 6. Routing Plan

Suggested routes:

```txt
/                         Landing or redirect to dashboard
/login                    Mock login / role selector
/                         Main dashboard (+page.svelte)
/search                   Dedicated search view
/favorites                Saved tools
/tools/[toolId]           Tool detail page
/categories/[categoryId]  Category-specific tool list
/settings                 User preferences
/admin                    Admin dashboard
/admin/tools              Manage tools
/admin/categories         Manage categories
/offline                  Offline fallback page
```

Mobile navigation should focus on the most important areas:

```txt
Dashboard | Search | Favorites | Settings
```

Desktop navigation should use a sidebar with expanded sections.

---

## 7. Data Model Draft

### User

```ts
type User = {
	id: string;
	name: string;
	email?: string;
	role: 'applicant' | 'accepted_student' | 'student' | 'staff' | 'admin';
	createdAt: Date;
	updatedAt: Date;
};
```

### Tool

```ts
type Tool = {
	id: string;
	name: string;
	description: string;
	url: string;
	categoryId: string;
	icon?: string;
	tags: string[];
	audienceRoles: User['role'][];
	isFeatured: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};
```

### Category

```ts
type Category = {
	id: string;
	name: string;
	description?: string;
	parentCategoryId?: string;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
};
```

### Favorite

```ts
type Favorite = {
	id: string;
	userId: string;
	toolId: string;
	createdAt: Date;
};
```

### UserPreference

```ts
type UserPreference = {
	id: string;
	userId: string;
	dashboardLayout?: string;
	theme?: 'system' | 'light' | 'dark';
	preferredRoleView?: User['role'];
	createdAt: Date;
	updatedAt: Date;
};
```

---

## 8. Database Plan

Use SQLite for the prototype because it is simple to run locally and easy to mount as persistent storage in Docker.

Use Drizzle ORM for:

- Type-safe schema definitions
- Migrations
- Seed scripts
- Lightweight database access

Initial seed data should include:

- Common Alfred State tools
- Categories
- Tags
- Default role visibility
- One mock user for each role

---

## 9. PWA Plan

AlfredGO should be installable as a PWA on mobile and desktop.

Required PWA pieces:

- Web app manifest
- App name and short name
- App icons
- Theme color
- Service worker
- Offline fallback page
- Cached application shell

Offline behavior for prototype:

- The app shell should load offline after first visit
- Previously loaded tool data may be cached
- Favorites should remain visible if cached locally
- Mutating actions while offline can either be disabled or queued as a stretch goal

---

## 10. Hosting Plan

The prototype will likely be self-hosted on a personal server.

Expected deployment environment:

```txt
Docker container
↓
Traefik reverse proxy
↓
Cloudflare Tunnel
↓
Public HTTPS URL
```

Deployment goals:

- Containerized app build
- Environment variables for production config
- Persistent SQLite database volume
- HTTPS handled through Traefik / Cloudflare
- Simple update process through rebuilding/redeploying container

---

## 11. Authentication Plan

### Prototype Authentication

Use mock authentication with role selection.

The login screen should allow selecting:

- Applicant
- Accepted Student
- Student
- Staff
- Admin

This allows the prototype to demonstrate role-aware dashboards without requiring real SSO.

### Future Authentication

Future production versions should integrate Alfred State SSO.

Expected future behavior:

- User logs in with Alfred State credentials
- Role is determined by institutional identity data
- Session is securely managed server-side
- Users only see tools appropriate for their role

---

## 12. Security Considerations

Prototype security requirements:

- Validate search input
- Sanitize user-editable fields
- Avoid storing sensitive academic data
- Use HTTPS in hosted deployment
- Keep role-based UI restrictions separate from future backend authorization checks

Future security requirements:

- Real SSO integration
- Server-side authorization checks
- Rate limiting
- Audit logging
- Dependency auditing
- Strong session management
- FERPA-conscious data handling

AlfredGO should not store protected academic data such as grades, schedules, or financial details. It should link to official systems rather than replicate sensitive institutional records.

---

## 13. Development Phases

### Phase 1: Project Foundation

- Create SvelteKit project
- Add TypeScript configuration
- Add Tailwind CSS
- Set up base layout
- Add mock data

### Phase 2: Core UI

- Build dashboard layout
- Build responsive card grid
- Add mobile bottom navigation
- Add desktop sidebar
- Add tool detail page

### Phase 3: Search and Discovery

- Implement keyword search
- Add category filtering
- Add tag filtering
- Add role-based visibility

### Phase 4: Persistence

- Add Drizzle ORM
- Add SQLite database
- Add seed script
- Persist tools, categories, users, favorites, and preferences

### Phase 5: PWA Support

- Add manifest
- Add service worker
- Add offline fallback
- Cache app shell
- Test installability on mobile and desktop

### Phase 6: Admin and Polish

- Add admin tool management
- Add settings page
- Improve empty states
- Improve loading states
- Add error boundaries
- Final responsive polish

---

## 14. Open Decisions

These still need to be decided before or during early implementation:

- Exact SQLite runtime/adapter
- Whether to use SvelteKit form actions or API routes for data mutations
- Whether favorites should be optimistic by default
- Whether offline mutations should be disabled or queued
- Final tool/category seed list
- Final visual style direction
- Final Docker base image and deployment process

---

## Demo Preview

A preview of the planned UI can be found here:

[https://alfredgo-preview.space.z.ai/](https://alfredgo-preview.space.z.ai/)
