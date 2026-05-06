<script lang="ts">
  import { resolve } from '$app/paths'
  import { getAppState } from '$lib/app-state.svelte'
  import ListGroup from '$lib/components/ListGroup.svelte'
  import Icon from './shared/Icon.svelte'

  const app = getAppState()

  const quickTools = $derived.by(() => {
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

{#if quickTools.length > 0}
  <ListGroup>
    {#each quickTools as tool (tool.id)}
      <a
        href={resolve(`/tools/${tool.id}`)}
        class="group flex items-center gap-4 px-5 py-4 transition hover:bg-muted"
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-campus-blue text-white">
          <Icon name={tool.icon} />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-bold text-text">{tool.name}</span>
          <span class="block truncate text-sm text-text-muted">{tool.description}</span>
        </span>
        <span class="text-xs font-bold text-text-muted">{app.categoryName(tool.categoryId)}</span>
      </a>
    {/each}
  </ListGroup>
{:else}
  <p class="text-sm text-text-muted">No quick access tools available.</p>
{/if}
