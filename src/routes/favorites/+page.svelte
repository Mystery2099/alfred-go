<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import ToolGrid from '$lib/components/shared/ToolGrid.svelte'

  const app = getAppState()
  const tools = $derived(app.visibleTools.filter((tool) => app.favoriteIds.has(tool.id)))
</script>

<section class="space-y-5">
  <div>
    <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Bookmarks</p>
    <h2 class="mt-1 text-2xl font-extrabold text-link">Favorites</h2>
  </div>
  {#if tools.length}
    <ToolGrid {tools} />
  {:else}
    <div class="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <h3 class="text-xl font-extrabold">No favorites yet</h3>
      <p class="mt-2 text-text-muted">Save frequently used resources from any tool detail page.</p>
    </div>
  {/if}
</section>
