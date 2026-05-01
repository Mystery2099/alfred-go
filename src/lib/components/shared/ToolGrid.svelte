<script lang="ts">
  import { Heart } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import Icon from './Icon.svelte'
  import type { Tool } from '$lib/types'

  interface Props {
    tools: Tool[]
    admin?: boolean
  }

  let { tools, admin = false }: Props = $props()
  const app = getAppState()
</script>

{#if tools.length === 0}
  <div class="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
    <h3 class="text-xl font-extrabold">No tools found</h3>
    <p class="mt-2 text-text-muted">Try a different search, category, or role view.</p>
  </div>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {#each tools as tool}
      <article class="rounded-xl border border-border bg-surface p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-campus-blue/20 sm:p-4">
        <div class="flex items-start gap-3">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-campus-blue text-white">
            <Icon name={tool.icon} />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="text-base font-extrabold text-link">{tool.name}</h3>
            <p class="mt-1 line-clamp-2 text-sm text-text-muted opacity-80">{tool.description}</p>
          </div>
          <button title="Favorite" onclick={() => app.toggleFavorite(tool.id)}>
            <Heart class="h-5 w-5 {app.isFavorite(tool.id) ? 'fill-campus-gold text-campus-gold' : 'text-text-soft'}" />
          </button>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <span class="text-xs font-bold text-text-muted">{app.categoryName(tool.categoryId)}</span>
          <a href="/tools/{tool.id}" class="text-sm font-bold text-link">Open</a>
        </div>
      </article>
    {/each}
  </div>
{/if}
