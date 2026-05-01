---
id: routing
title: Routing
---

SvelteKit uses file-based routing based on the directory structure in `src/routes`.

## Directory Structure

Routes are defined by `+page.svelte` files inside `src/routes`. SvelteKit maps the directory path to the URL path.

```
src/
├── routes/
│   ├── +layout.svelte         # Root layout (wraps all pages)
│   ├── +layout.server.ts      # Root layout server load
│   ├── +page.svelte           # Home page (/)
│   ├── +page.server.ts        # Home page server load
│   ├── login/
│   │   └── +page.svelte       # /login
│   ├── search/
│   │   └── +page.svelte       # /search
│   ├── favorites/
│   │   └── +page.svelte       # /favorites
│   ├── profile/
│   │   └── +page.svelte       # /profile
│   ├── settings/
│   │   └── +page.svelte       # /settings
│   ├── offline/
│   │   ├── +page.svelte       # /offline
│   │   └── +page.ts           # /offline (client load, prerender)
│   ├── categories/
│   │   └── [categoryId]/
│   │       └── +page.svelte   # /categories/:categoryId
│   ├── tools/
│   │   └── [toolId]/
│   │       └── +page.svelte   # /tools/:toolId
│   ├── admin/
│   │   ├── +page.svelte       # /admin
│   │   ├── +page.server.ts    # /admin (server load)
│   │   ├── categories/
│   │   │   ├── +page.svelte   # /admin/categories
│   │   │   └── +page.server.ts
│   │   └── tools/
│   │       ├── +page.svelte   # /admin/tools
│   │       └── +page.server.ts
│   └── api/
│       ├── login/+server.ts   # POST /api/login
│       ├── logout/+server.ts  # POST /api/logout
│       ├── data/+server.ts    # GET /api/data
│       ├── favorites/+server.ts
│       ├── categories/+server.ts
│       ├── tools/+server.ts
│       └── preferences/+server.ts
```

## Layouts

### Root Layout (`+layout.svelte`)

The root layout wraps every page. It's where you place shared UI like navigation, headers, and footers.

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	let { children } = $props();
</script>

<div class="app-shell">
	<nav><!-- shared navigation --></nav>
	<main>
		{@render children()}
	</main>
</div>
```

### Layout Server Load (`+layout.server.ts`)

Use `+layout.server.ts` to load data that should be available to every page, such as the current user session:

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user;
	return { user };
};
```

## Dynamic Routes

Use `[param]` brackets for dynamic route segments:

```
src/routes/tools/[toolId]/+page.svelte   → /tools/:toolId
src/routes/categories/[categoryId]/+page.svelte → /categories/:categoryId
```

Access the parameter in the page component:

```svelte
<!-- src/routes/tools/[toolId]/+page.svelte -->
<script lang="ts">
	let { data } = $props();
</script>

<h1>Tool: {data.tool.name}</h1>
```

And in the server load function:

```ts
// src/routes/tools/[toolId]/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const tool = await getTool(params.toolId);
	return { tool };
};
```

## API Routes

SvelteKit uses `+server.ts` files to create API endpoints:

```ts
// src/routes/api/data/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	const data = await getAppData(user?.id);
	return new Response(JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json' }
	});
};
```

## Prerendering

For static pages like the offline fallback, add a `+page.ts` with prerender config:

```ts
// src/routes/offline/+page.ts
export const prerender = true;
```

Or configure it globally in `svelte.config.js`:

```js
// svelte.config.js
const config = {
	kit: {
		prerender: {
			entries: ['/offline'],
			concurrency: 1
		}
	}
};
```

---

This covers the core SvelteKit routing patterns used in AlfredGO. For more details, see the [SvelteKit Routing Docs](https://svelte.dev/docs/kit/routing).
