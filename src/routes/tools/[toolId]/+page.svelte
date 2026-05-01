<script lang="ts">
  import { page } from '$app/stores'
  import { getAppState } from '$lib/app-state.svelte'
  import { Heart, ExternalLink, ArrowLeft } from 'lucide-svelte'
  import Button from '$lib/components/Button.svelte'
  import Badge from '$lib/components/Badge.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'

  const app = getAppState()
  const toolId = $derived($page.params.toolId)
  const tool = $derived(app.data?.tools.find((t) => t.id === toolId))
</script>

<div class="p-4 md:p-8">
  <a href="/search" class="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-link transition">
    <ArrowLeft class="h-4 w-4" />
    Back to Search
  </a>

  {#if tool}
    <div class="card p-6">
      <div class="mb-4 flex items-start justify-between">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-link/10 text-link">
            <ExternalLink class="h-7 w-7" />
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-text">{tool.name}</h1>
            <p class="text-sm text-text-muted">{app.categoryName(tool.categoryId)}</p>
          </div>
        </div>
        <button
          onclick={() => app.toggleFavorite(tool.id)}
          class="rounded-xl p-2 transition hover:bg-muted {app.isFavorite(tool.id) ? 'text-campus-gold' : 'text-text-soft hover:text-campus-gold'}"
        >
          <Heart class="h-6 w-6 {app.isFavorite(tool.id) ? 'fill-current' : ''}" />
        </button>
      </div>

      <p class="mb-4 text-sm text-text">{tool.description}</p>

      <div class="mb-4 flex flex-wrap gap-1">
        {#each tool.tags as tag}
          <Badge variant="secondary">{tag}</Badge>
        {/each}
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        {#each tool.audienceRoles as role}
          <Badge variant="outline" class="capitalize">{role.replace('_', ' ')}</Badge>
        {/each}
      </div>

      <div class="flex gap-2">
        <Button href={tool.url}>
          <ExternalLink class="h-4 w-4" />
          Launch Tool
        </Button>
        <Button variant="secondary" onclick={() => app.toggleFavorite(tool.id)}>
          <Heart class="h-4 w-4 {app.isFavorite(tool.id) ? 'fill-current' : ''}" />
          {app.isFavorite(tool.id) ? 'Favorited' : 'Favorite'}
        </Button>
      </div>
    </div>
  {:else}
    <EmptyState title="Tool not found" message="This tool doesn't exist or has been removed." />
  {/if}
</div>
