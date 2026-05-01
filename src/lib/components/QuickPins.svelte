<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import QuickCard from './shared/QuickCard.svelte'

  const app = getAppState()

  const quickTools = $derived(() => {
    if (!app.data) return []
    return app.data.tools
      .filter((tool) => tool.isFeatured && tool.isActive && app.roleCanSeeTool(app.effectiveRole, tool))
      .sort((a, b) => {
        const aFav = app.isFavorite(a.id) ? 1 : 0
        const bFav = app.isFavorite(b.id) ? 1 : 0
        return bFav - aFav || a.name.localeCompare(b.name)
      })
      .slice(0, 8)
  })
</script>

{#if quickTools().length > 0}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each quickTools() as tool, i}
      <QuickCard {tool} tone={i % 4} />
    {/each}
  </div>
{:else}
  <p class="text-sm text-text-muted">No quick access tools available.</p>
{/if}
