<script lang="ts">
  import { enhance } from '$app/forms'
  import { Heart, ExternalLink, ChevronRight } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import Badge from './Badge.svelte'
  import type { Tool } from '$lib/types'

  interface Props {
    tool: Tool
  }

  let { tool }: Props = $props()
  const app = getAppState()

  function handleLaunch(e: Event) {
    e.preventDefault()
    app.launchTool(tool)
  }
</script>

<a
  href={tool.url}
  target="_blank"
  rel="noopener noreferrer"
  class="group flex items-start gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:shadow-md hover:border-link/30"
>
  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-link/10 text-link">
    <ExternalLink class="h-5 w-5" />
  </div>
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-2">
      <b class="truncate text-sm font-extrabold text-text">{tool.name}</b>
      <form method="POST" action="?/toggleFavorite" use:enhance>
        <input type="hidden" name="toolId" value={tool.id} />
        <button class="shrink-0 transition-colors {app.isFavorite(tool.id) ? 'text-campus-gold' : 'text-text-soft hover:text-campus-gold'}">
          <Heart class="h-4 w-4 {app.isFavorite(tool.id) ? 'fill-current' : ''}" />
        </button>
      </form>
    </div>
    <p class="mt-0.5 line-clamp-2 text-xs text-text-muted">{tool.description}</p>
    <div class="mt-1.5 flex flex-wrap gap-1">
      {#each tool.tags.slice(0, 3) as tag}
        <Badge variant="secondary">{tag}</Badge>
      {/each}
    </div>
  </div>
  <ChevronRight class="h-5 w-5 shrink-0 text-text-soft group-hover:text-link transition-colors" />
</a>
