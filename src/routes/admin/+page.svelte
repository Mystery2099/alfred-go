<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import { Bell, ClipboardList, Grid2X2 } from 'lucide-svelte'

  const app = getAppState()
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
    <div class="grid gap-4 md:grid-cols-3">
      <a class="admin-card" href="/admin/tools">
        <Grid2X2 />
        <span><b>Tools</b><small>{app.data?.tools.length || 0} resources</small></span>
      </a>
      <a class="admin-card" href="/admin/categories">
        <ClipboardList />
        <span><b>Categories</b><small>{app.categories.length} groups</small></span>
      </a>
      <a class="admin-card" href="/admin/announcements">
        <Bell />
        <span><b>Announcements</b><small>{app.data?.announcements.length || 0} notices</small></span>
      </a>
    </div>
  </section>
{/if}
