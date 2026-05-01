---
id: code-execution-patterns
title: Code Execution Patterns
---

This guide covers patterns for controlling where code runs in your SvelteKit application - server-only, client-only, or shared (both environments).

## Quick Start

Set up execution boundaries in your SvelteKit application:

```ts
// Server-only: files in src/lib/server/
// src/lib/server/db.ts
import Database from 'better-sqlite3';
export const db = new Database('alfredgo.sqlite');

// Server-only: +page.server.ts load functions
// src/routes/+page.server.ts
import { db } from '$lib/server/db';
export const load = async () => {
	const tools = db.select().from(toolsTable).all();
	return { tools };
};

// Server-only: API routes
// src/routes/api/favorites/+server.ts
export const POST = async ({ request, locals }) => {
	const { userId, toolId } = await request.json();
	const user = locals.user;
	if (!user) return new Response('Unauthorized', { status: 401 });
	// ...
};

// Client-only: browser checks
import { browser } from '$app/environment';
$effect(() => {
	if (browser) {
		localStorage.setItem('key', 'value');
	}
});
```

## Implementation Patterns

### Server-Only Data Loading

```ts
// src/routes/favorites/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { favorites, tools } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) return { favorites: [], tools: [] };

	const userFavorites = db.select().from(favorites).where(eq(favorites.userId, user.id)).all();

	return { favorites: userFavorites };
};
```

### Client-Only Interactivity

```svelte
<script lang="ts">
	import { browser } from '$app/environment';

	let isOnline = $state(browser ? navigator.onLine : true);

	$effect(() => {
		if (browser) {
			const handleOnline = () => {
				isOnline = true;
			};
			const handleOffline = () => {
				isOnline = false;
			};
			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);
			return () => {
				window.removeEventListener('online', handleOnline);
				window.removeEventListener('offline', handleOffline);
			};
		}
	});
</script>

{#if !isOnline}
	<div class="offline-banner">You are offline</div>
{/if}
```

### Progressive Enhancement with Form Actions

```svelte
<!-- src/routes/settings/+page.svelte -->
<script lang="ts">
	let { data, form } = $props();
</script>

<form method="POST" action="?/updateTheme">
	<select name="theme">
		<option value="system">System</option>
		<option value="light">Light</option>
		<option value="dark">Dark</option>
	</select>
	<button type="submit">Save</button>
</form>

{#if form?.success}
	<p>Theme updated!</p>
{/if}
```

```ts
// src/routes/settings/+page.server.ts
import type { Actions } from './$types';
import { db } from '$lib/server/db';

export const actions: Actions = {
	updateTheme: async ({ request, locals }) => {
		const data = await request.formData();
		const theme = data.get('theme') as string;
		const user = locals.user;
		// Update in database
		return { success: true };
	}
};
```

### API Route for Client-Side Mutations

When progressive enhancement isn't needed, use API routes called from client state:

```ts
// src/lib/app-state.svelte.ts
async toggleFavorite(toolId: string) {
  if (!state.userId) return
  const isFav = favoriteIds().has(toolId)
  if (isFav) {
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.userId, toolId }),
    })
  } else {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.userId, toolId }),
    })
  }
}
```

## Common Problems

### Importing Server Code in Client

```ts
// ❌ This will fail at build time
import { db } from '$lib/server/db'; // In a .svelte file

// ✅ Use server load functions or API routes instead
// In +page.server.ts:
export const load = async () => {
	const data = db.select().from(table).all();
	return { data };
};

// Then in +page.svelte:
let { data } = $props();
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

### Auth Check in Client Component

```ts
// ❌ Don't rely on client-only auth checks
// Anyone can modify client state

// ✅ Always verify auth on the server
// In hooks.server.ts:
export const handle = async ({ event, resolve }) => {
	const session = event.cookies.get('alfredgo_session');
	event.locals.user = null;
	if (session) {
		// Verify session and set user
	}
	return resolve(event);
};

// In +page.server.ts:
export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(307, '/login');
	}
	// ...
};
```

## Production Checklist

- [ ] **Import boundaries**: No `$lib/server/` imports in client components
- [ ] **Secret safety**: Secrets only in `$env/static/private` or `$lib/server/`
- [ ] **Server auth**: All mutations verify auth server-side (locals.user)
- [ ] **Browser guards**: `localStorage`, `window`, etc. wrapped in `browser` checks
- [ ] **SSR consistency**: Hydration-safe rendering (no random/time values during SSR)
- [ ] **Error handling**: Proper error boundaries via `+error.svelte`

## Related Resources

- [Execution Model](./execution-model.md) - Core concepts and architectural patterns
- [Environment Variables](./environment-variables.md) - Secure environment variable handling
- [Routing](./routing.md) - File-based routing in SvelteKit
