---
id: getting-started
title: Getting Started
---

## Start a new project

### Use the Svelte CLI

The easiest way to create a new SvelteKit project:

```bash
npx sv create my-app
cd my-app
pnpm install
pnpm dev
```

You'll be prompted to choose options like TypeScript, Tailwind CSS, and other add-ons.

### Start from this project

This project is already set up with SvelteKit, Tailwind CSS, Drizzle ORM, and PWA support. To get started:

```bash
pnpm install
pnpm dev
```

### Build for production

```bash
pnpm build
node build
```

Or use the preview command:

```bash
pnpm build
pnpm preview
```

---

## Next Steps

Once you've created or cloned a project, continue to the [Routing](./routing.md) guide.
