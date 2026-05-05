<script lang="ts">
  import { getAppState, roleLabels } from '$lib/app-state.svelte'
  import { BookOpen, ChevronRight, Grid2X2, LogOut, Settings, Shield, Star } from 'lucide-svelte'

  const app = getAppState()

  const user = $derived(app.currentUser)
  const favoriteTools = $derived(app.visibleTools.filter((tool) => app.favoriteIds.has(tool.id)))
  const accessNotes = $derived([
    ['Signed in as', user?.email || 'No email on file'],
    ['Account role', roleLabels[app.currentRole]],
    ...(app.isAdmin ? [
      ['Viewing resources as', roleLabels[app.effectiveRole]],
      ['Visible resources', `${app.visibleTools.length} tools`],
    ] : []),
  ])

</script>

<section class="mx-auto max-w-5xl space-y-5">
  <div class="profile-hero flex-wrap">
    <span class="grid h-14 w-14 place-items-center rounded-full border-2 border-white/35 bg-surface/20 text-xl font-bold text-white">{app.displayName?.charAt(0) || 'A'}</span>
    <div class="min-w-0 flex-1">
      <h2 class="text-lg font-extrabold text-white">{app.displayName}</h2>
      <p class="text-sm text-white/80">{user?.email} · {roleLabels[app.currentRole]}</p>
    </div>
    <form method="POST" action="?/logout">
    <button class="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-white/25">
      <LogOut class="h-4 w-4" />
      Sign out
    </button>
    </form>
  </div>

  <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
    <section class="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div>
        <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Account</p>
        <h2 class="mt-1 text-2xl font-extrabold text-link">Profile overview</h2>
      </div>
      <div class="mt-5 divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
        {#each accessNotes as [label, value]}
          <div class="px-5 py-4">
            <p class="text-xs font-extrabold uppercase tracking-wider text-text-soft">{label}</p>
            <p class="mt-1 text-sm font-extrabold text-text">{value}</p>
          </div>
        {/each}
      </div>
    </section>

    <section class="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <p class="text-xs font-extrabold uppercase tracking-wider text-text-soft">Quick context</p>
      <div class="mt-4 space-y-3">
        {@render InfoRow(BookOpen, 'Dashboard source', favoriteTools.length ? 'Pinned resources are powering your quick access.' : 'Featured resources are shown until you pin favorites.')}
        {@render InfoRow(Star, 'Favorites', `${favoriteTools.length} saved for this account`)}
        {@render InfoRow(Shield, 'Session', 'Server-authenticated prototype session active')}
      </div>
    </section>
  </div>

  <a class="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:bg-muted hover:shadow-md" href="/settings">
    <span class="profile-icon tone-0"><Settings class="h-5 w-5" /></span>
    <span class="min-w-0 flex-1">
      <span class="block font-extrabold text-link">Settings</span>
      <span class="mt-1 block text-sm text-text-muted">Manage theme, role view, notifications, security, and support preferences.</span>
    </span>
    <ChevronRight class="h-5 w-5 text-text-soft" />
  </a>

  {#if app.isAdmin}
    <a class="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:bg-muted hover:shadow-md lg:hidden" href="/admin">
      <span class="profile-icon tone-2"><Grid2X2 class="h-5 w-5" /></span>
      <span class="min-w-0 flex-1">
        <span class="block font-extrabold text-link">Admin</span>
        <span class="mt-1 block text-sm text-text-muted">Manage tools and categories from the admin area.</span>
      </span>
      <ChevronRight class="h-5 w-5 text-text-soft" />
    </a>
  {/if}
</section>

{#snippet InfoRow(icon: any, title: string, body: string)}
  {@const RowIcon = icon}
  <div class="flex items-start gap-3">
    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-selected text-link"><RowIcon class="h-5 w-5" /></span>
    <span>
      <span class="block text-sm font-extrabold">{title}</span>
      <span class="mt-0.5 block text-sm text-text-muted">{body}</span>
    </span>
  </div>
{/snippet}
