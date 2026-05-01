# AlfredGO Debugging Guide

## Where Logs Appear

AlfredGO logs structured events with the prefix `[AlfredGO]`.

- Browser console: client-side errors, unhandled browser errors, stale service worker cleanup, route errors.
- Dev server / production server console: server load function errors, auth events, permission failures, favorites, preferences, and admin saves.

## Error Page

SvelteKit provides built-in error handling through `+error.svelte`. The app should show:

- Error message
- Current path
- Error type (404, 500, etc.)
- Stack trace (in development mode)

This is intentional for the prototype so issues are diagnosable during grading and demos.

## Common Events

| Event                       | Meaning                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| Client hydration error      | Svelte hydration mismatch. Check for stale PWA caches or server/client content differences. |
| Unhandled browser error     | A browser runtime error was not caught by app code.                                         |
| Unhandled promise rejection | A promise rejected without a handler.                                                       |
| Route load error            | A +page.server.ts load function failed.                                                     |
| `server.get_data_failed`    | The main data-loading API route failed.                                                     |
| `auth.login_failed`         | Email/password authentication failed. Passwords are redacted.                               |
| `auth.permission_denied`    | A signed-in user tried a role-restricted action.                                            |

## PWA Cache Gotcha

The prototype uses `@vite-pwa/sveltekit`. If a service worker from a production build controls `localhost:5173`, it can serve stale HTML or JavaScript during development.

In dev mode, clear service workers and caches from the browser DevTools if the page looks wrong. If a stale worker was controlling the page, unregister it and hard refresh.

## Reset Local Data

```bash
pnpm db:seed
```

This reseeds users, resource data, credentials, preferences, and favorites.

## Test Accounts

See `test-accounts.md` for seeded prototype credentials.
