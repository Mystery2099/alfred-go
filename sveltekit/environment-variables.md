---
id: environment-variables
title: Environment Variables
---

Learn how to securely configure and use environment variables in your SvelteKit application across different contexts.

## Quick Start

SvelteKit provides built-in support for environment variables through `$env/static/private`, `$env/static/public`, and `$env/dynamic/private`, `$env/dynamic/public`.

```bash
# .env
DATABASE_URL=sqlite://./alfredgo.sqlite
PUBLIC_APP_NAME=AlfredGO
SECRET_KEY=your-secret-key
```

```ts
// Server-only: import from $env/static/private
import { DATABASE_URL, SECRET_KEY } from '$env/static/private';

// Client-accessible: import from $env/static/public
```

```svelte
<!-- In a component -->
<script lang="ts">
	import { PUBLIC_APP_NAME } from '$env/static/public';
</script>

<h1>{PUBLIC_APP_NAME}</h1>
```

## Environment Variable Modules

### `$env/static/private`

Server-only variables, available in `+page.server.ts`, `+layout.server.ts`, `+server.ts`, `hooks.server.ts`, and `$lib/server/*`:

```ts
// src/lib/server/db.ts
import { DATABASE_URL } from '$env/static/private';
import Database from 'better-sqlite3';

export const db = new Database(DATABASE_URL.replace('sqlite://', ''));
```

These variables are **never** included in client bundles.

### `$env/static/public`

Variables prefixed with `PUBLIC_` that are safe to expose to the client. Available in both server and client code:

```svelte
<script lang="ts">
	import { PUBLIC_APP_NAME } from '$env/static/public';
</script>

<title>{PUBLIC_APP_NAME}</title>
```

### `$env/dynamic/private` and `$env/dynamic/public`

For variables that may change at runtime (e.g., in serverless environments). These are accessed asynchronously:

```ts
// src/routes/api/health/+server.ts
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({ status: 'ok', node: env.NODE_ENV }));
};
```

## Environment File Setup

### File Hierarchy (Loaded in Order)

SvelteKit automatically loads environment files:

```
.env                # Default variables (commit to git)
.env.local          # Local overrides (add to .gitignore)
.env.development    # Development-specific
.env.production     # Production-specific
```

### Example Setup

**.env** (committed to repository):

```bash
# Public configuration
PUBLIC_APP_NAME=AlfredGO
PUBLIC_API_URL=https://api.example.com

# Server configuration
DATABASE_URL=sqlite://./alfredgo.sqlite
```

**.env.local** (add to .gitignore):

```bash
# Override for local development
DATABASE_URL=sqlite://./alfredgo_local.sqlite
SECRET_KEY=local-dev-secret
```

## Security Best Practices

### 1. Never Expose Secrets to Client

```ts
// ❌ WRONG - This import will fail at build time
import { SECRET_KEY } from '$env/static/private';
// Using this in a +page.svelte will cause a build error

// ✅ CORRECT - Access secrets only in server files
// src/lib/server/auth.ts
import { SECRET_KEY } from '$env/static/private';
export function verifyToken(token: string) {
	return jwt.verify(token, SECRET_KEY);
}
```

### 2. Use Appropriate Prefixes

```bash
# ✅ Server-only (no prefix, or non-PUBLIC_)
DATABASE_URL=sqlite://./alfredgo.sqlite
SECRET_KEY=my-secret-key

# ✅ Client-safe (PUBLIC_ prefix)
PUBLIC_APP_NAME=AlfredGO
PUBLIC_API_URL=https://api.example.com
```

### 3. Pass Server Data to Client Through Load Functions

```ts
// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Pass safe data to client; never pass secrets
	return {
		user: locals.user
		// Do NOT return: process.env.SECRET_KEY
	};
};
```

## SvelteKit Configuration

### Prerendering

In `svelte.config.js`, configure prerendering for static pages:

```js
const config = {
	kit: {
		prerender: {
			entries: ['/offline'],
			concurrency: 1
		}
	}
};
```

### SSR Control

For specific routes that should only render on the client:

```ts
// src/routes/some-page/+page.ts
export const ssr = false;
```

For most pages, keep SSR enabled (the default) for better SEO and performance.

## Type Safety

### TypeScript Declarations

SvelteKit generates types for your environment variables in `.svelte-kit/tsconfig`. No manual `env.d.ts` file is needed.

For custom types, create `src/app.d.ts`:

```typescript
// src/app.d.ts
declare global {
	namespace App {
		interface Locals {
			user: User | null;
		}
		interface PageData {
			user?: User | null;
		}
	}
}

export {};
```

## Common Problems

### Environment Variable is Undefined

**Problem**: `$env/static/public` variable returns `undefined`

**Solutions**:

1. **Add PUBLIC\_ prefix**: Variables must start with `PUBLIC_` to be available on the client
2. **Restart dev server**: Changes to `.env` files require a server restart
3. **Check file location**: `.env` must be in project root

### Server Variable Leaked to Client

**Problem**: Build error about importing `$env/static/private` in client code

**Solutions**:

1. Move the import to a `+page.server.ts` or `$lib/server/` file
2. Pass the data through a load function return value instead
3. Use `$env/static/public` with `PUBLIC_` prefix if the value is safe for clients

### Variable Not Updating

**Problem**: Environment variable changes aren't reflected

**Solutions**:

1. Restart the development server
2. Check if you're modifying the correct `.env` file
3. Verify file hierarchy (`.env.local` overrides `.env`)

## Production Checklist

- [ ] All sensitive variables have no `PUBLIC_` prefix
- [ ] Client variables use `PUBLIC_` prefix
- [ ] `.env.local` is in `.gitignore`
- [ ] Production environment variables are configured on hosting platform
- [ ] No hardcoded secrets in source code
- [ ] Database path is configured for production environment
- [ ] `$lib/server/` modules are never imported in client components

## Related Resources

- [Execution Model](./execution-model.md) - Learn about server vs client code execution
- [Routing](./routing.md) - SvelteKit routing patterns
- [SvelteKit Environment Variables Docs](https://svelte.dev/docs/kit/modules#$env)
