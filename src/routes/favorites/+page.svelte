<script lang="ts">
  import { Heart } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import ToolGrid from '$lib/components/shared/ToolGrid.svelte'

  const app = getAppState()
  const tools = $derived(app.visibleTools.filter((tool) => app.favoriteIds.has(tool.id)))
</script>

<section class="mx-auto max-w-6xl space-y-6">
  <div class="rounded-[28px] bg-surface px-6 py-8 shadow-sm ring-1 ring-border sm:px-10">
    <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Bookmarks</p>
    <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-text">Favorites</h2>
    <p class="mt-3 text-base leading-relaxed text-text-muted">Your saved tools and resources, all in one place.</p>
  </div>
  {#if tools.length}
    <ToolGrid {tools} />
  {:else}
    <div class="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted">
        <Heart class="h-6 w-6 text-text-soft" />
      </div>
      <h3 class="mt-4 text-lg font-extrabold text-text">No favorites yet</h3>
      <p class="mt-1 text-sm text-text-muted">Save frequently used resources from any tool detail page.</p>
    </div>
  {/if}
</section>
