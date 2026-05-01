<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import ToolGrid from '$lib/components/ToolGrid.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import { Heart } from 'lucide-svelte'

  const app = getAppState()

  const favTools = $derived(() => {
    if (!app.data || !app.userId) return []
    return app.data.tools.filter((tool) =>
      app.isFavorite(tool.id) &&
      tool.isActive &&
      app.roleCanSeeTool(app.effectiveRole, tool)
    )
  })
</script>

<div class="p-4 md:p-8">
  <SectionTitle>Favorites</SectionTitle>
  <p class="mb-4 text-sm text-text-muted">Your saved tools and resources.</p>

  {#if favTools().length > 0}
    <ToolGrid tools={favTools()} />
  {:else}
    <EmptyState
      title="No favorites yet"
      message="Heart tools you use often and they'll appear here."
      icon={Heart}
    />
  {/if}
</div>
