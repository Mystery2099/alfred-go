<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import { Bell, ClipboardList, Grid2X2, ChevronRight } from 'lucide-svelte'

  const app = getAppState()

  const links = [
    { href: '/admin/tools', icon: Grid2X2, label: 'Tools', count: app.data?.tools.length || 0, subtitle: 'resources' },
    { href: '/admin/categories', icon: ClipboardList, label: 'Categories', count: app.categories.length, subtitle: 'groups' },
    { href: '/admin/announcements', icon: Bell, label: 'Announcements', count: app.data?.announcements.length || 0, subtitle: 'notices' },
  ]
</script>

{#if app.currentRole !== 'admin'}
  <div class="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
    <h3 class="text-xl font-extrabold">Admin access required</h3>
    <p class="mt-2 text-text-muted">Sign in with an admin account to manage AlfredGO resources.</p>
  </div>
{:else}
  <section class="space-y-5">
    <div>
      <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Administration</p>
      <h2 class="mt-1 text-2xl font-extrabold text-link">Manage AlfredGO</h2>
    </div>
    <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
      {#each links as link}
        <a href={link.href} class="group flex items-center gap-4 px-5 py-5 transition hover:bg-muted">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-campus-blue text-white">
            <link.icon class="h-5 w-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-bold text-text">{link.label}</span>
            <span class="block text-sm text-text-muted">{link.count} {link.subtitle}</span>
          </span>
          <ChevronRight class="h-5 w-5 text-text-soft" />
        </a>
      {/each}
    </div>
  </section>
{/if}
