---
id: execution-model
title: Execution Model
---

Understanding where code runs is fundamental to building SvelteKit applications. This guide explains SvelteKit's execution model and how to control where your code executes.

## Core Principle: Server and Client Boundaries

SvelteKit runs code in two environments, and the boundary is determined by **where the file lives** and **what it exports**:

- **Server-only code**: Files in `$lib/server/`, `+page.server.ts`, `+layout.server.ts`, and `+server.ts`
- **Client + server code**: `+page.svelte`, `+layout.svelte`, `+page.ts` (shared load functions)
- **Client-only code**: Browser-specific code inside `$effect` or `{#if browser}` blocks, or `$app/environment` checks

```ts
// Server-only: src/lib/server/db.ts
// This file can NEVER be imported from a client component

import Database from 'better-sqlite3';

const db = new Database('alfredgo.sqlite');
export { db };
```

```svelte
<!-- Shared: src/routes/+page.svelte -->
<!-- This component renders on both server (SSR) and client -->

<script lang="ts">
	import { browser } from '$app/environment';
	let { data } = $props();

	// Client-only logic
	$effect(() => {
		if (browser) {
			console.log('Running in browser');
		}
	});
</script>

<h1>{data.tool.name}</h1>
```

## Server Load Functions

`+page.server.ts` and `+layout.server.ts` files export a `load` function that runs **only on the server**:

```ts
// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	// This code runs ONLY on the server
	const user = locals.user;
	const tools = db.select().from(toolsTable).all();
	return { tools, user };
};
```

Key points:

- Server load functions can access `$lib/server/` modules
- They can access the database directly
- They can read cookies and session data
- They can safely use `process.env` and Node.js APIs
- The return value is serialized and sent to the client

## Client-Side Considerations

### Browser-Only Code

Use `$app/environment` or `$app/stores` for client-specific logic:

```svelte
<script lang="ts">
	import { browser } from '$app/environment';

	// Only runs in the browser
	$effect(() => {
		if (browser) {
			localStorage.setItem('key', 'value');
		}
	});
</script>
```

### Server-Only Imports

Only import `$lib/server/*` from server files (`+page.server.ts`, `+layout.server.ts`, `+server.ts`, `hooks.server.ts`). SvelteKit will throw an error if you try to import server modules in client code.

### SSR vs CSR

By default, all pages use SSR. You can disable SSR for specific routes:

```ts
// src/routes/some-page/+page.ts
export const ssr = false; // Render only on the client
```

Or for the entire app in `svelte.config.js` (not recommended for this project).

## API Routes

`+server.ts` files create HTTP endpoints that run only on the server:

```ts
// src/routes/api/favorites/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { favorites } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { userId, toolId } = await request.json();
	const user = locals.user;

	if (!user || user.id !== userId) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
	}

	db.insert(favorites).values({ userId, toolId }).run();
	return new Response(JSON.stringify({ success: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const { userId, toolId } = await request.json();
	const user = locals.user;

	if (!user || user.id !== userId) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
	}

	db.delete(favorites)
		.where(and(eq(favorites.userId, userId), eq(favorites.toolId, toolId)))
		.run();
	return new Response(JSON.stringify({ success: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
```

## Form Actions

SvelteKit form actions are an alternative to API routes for data mutations:

```ts
// src/routes/settings/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
	updateTheme: async ({ request, locals }) => {
		const data = await request.formData();
		const theme = data.get('theme') as string;
		const user = locals.user;

		// Update preference in database
		db.update(preferences).set({ theme }).where(eq(preferences.userId, user.id)).run();

		return { success: true };
	}
};
```

## Environment Variables

### Server-Side

Access any environment variable on the server:

```ts
// In +page.server.ts, +server.ts, hooks.server.ts, or $lib/server/*
const secret = process.env.SECRET_KEY;
const dbUrl = process.env.DATABASE_URL;
```

### Client-Side

Only `PUBLIC_` prefixed variables are available in client code via `$env/static/public`:

```svelte
<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
</script>
```

For static public variables, use `$env/static/public`. For dynamic public variables at runtime, pass them from server load functions.

### Private Server Variables

Use `$env/static/private` for server-only variables:

```ts
import { SECRET_KEY } from '$env/static/private';
```

## Reactive State (Svelte 5 Runes)

AlfredGO uses Svelte 5 runes for reactive state in `src/lib/app-state.svelte.ts`:

```ts
// Svelte 5 runes for state management
let state = $state<AppState>({ ... })
let currentUser = $derived(state.data?.users.find(u => u.id === state.userId) || null)
let isAuthenticated = $derived(!!state.userId && !!state.data)
```

### Key Rune Patterns

| Rune         | Purpose         | Example                                 |
| ------------ | --------------- | --------------------------------------- |
| `$state()`   | Reactive state  | `let count = $state(0)`                 |
| `$derived()` | Computed values | `let double = $derived(count * 2)`      |
| `$effect()`  | Side effects    | `$effect(() => { console.log(count) })` |
| `$inspect()` | Debug           | `$inspect(count)`                       |

### .svelte.ts Files

Svelte 5 runes can be used in `.svelte.ts` files (like `app-state.svelte.ts`) to create reactive stores outside of components. These are imported and used in components:

```svelte
<script lang="ts">
	import { getAppState } from '$lib/app-state.svelte';
	const app = getAppState();
</script>

<p>Hello, {app.displayName}!</p>
```

## Common Anti-Patterns

### Importing Server Modules in Client Code

```ts
// ❌ This will crash - can't import $lib/server/ in a component
import { db } from '$lib/server/db';

// ✅ Fetch data from server load or API route instead
let { data } = $props(); // data comes from +page.server.ts
```

### Using `localStorage` During SSR

```svelte
<!-- ❌ localStorage doesn't exist on the server -->
<script lang="ts">
  const value = localStorage.getItem('key')
</script>

<!-- ✅ Guard with browser check -->
<script lang="ts">
  import { browser } from '$app/environment'
  let value = $state<string | null>(null)

  $effect(() => {
    if (browser) {
      value = localStorage.getItem('key')
    }
  })
</script>
```

### Hydration Mismatches

```svelte
<!-- ✅ Use $effect for client-only values -->
<script lang="ts">
	let time = $state<string>('Loading...');
	$effect(() => {
		time = new Date().toLocaleString();
	});
</script>

<!-- ❌ Different content on server vs client --><p>{new Date().toLocaleString()}</p><p>{time}</p>
```

## Architecture Decision Framework

**Choose Server Load (`+page.server.ts`) when:**

- Accessing the database
- Reading authenticated user session data
- Performing secret operations (API keys, etc.)
- SEO-critical data that must be in initial HTML

**Choose API Routes (`+server.ts`) when:**

- Handling POST/PUT/DELETE mutations from client-side fetch calls
- Creating REST endpoints

**Choose Form Actions when:**

- Progressive enhancement is important
- Simple CRUD operations from forms

**Choose Client-Side State (`$state`) when:**

- UI state (filters, search, modals)
- Transient state that doesn't need server persistence
- Optimistic updates before server confirmation
