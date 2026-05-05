# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.15.2 create --template minimal --types ts --install pnpm final-prototype-sveltekit
```

## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```sh
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

## Building

To create a production version of your app:

```sh
SESSION_SECRET="replace-with-a-long-random-secret" pnpm build
```

You can preview the production build with `pnpm preview`.

## Environment

- `SESSION_SECRET` is required in production. Use a long random value and rotate it if session cookies may have been exposed.
- `DATABASE_URL` can point at a SQLite file. If omitted, the app uses `alfredgo.sqlite`.
- `VAPID_PRIVATE_KEY` enables push notifications. If omitted, push subscriptions fail closed and announcement broadcasts are skipped.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
