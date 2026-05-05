<script lang="ts">
  import { enhance } from '$app/forms'
  import { Heart, Pencil, Trash2 } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import Icon from './Icon.svelte'
  import type { Tool } from '$lib/types'

  interface Props {
    tools: Tool[]
    admin?: boolean
    onEdit?: (tool: Tool) => void
  }

  let { tools, admin = false, onEdit }: Props = $props()
  const app = getAppState()
</script>

{#if tools.length === 0}
  <div class="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
    <h3 class="text-xl font-extrabold">No tools found</h3>
    <p class="mt-2 text-text-muted">Try a different search, category, or role view.</p>
  </div>
{:else}
  <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
    {#each tools as tool}
      <div class="group flex items-center gap-4 px-5 py-4 transition hover:bg-muted">
        <a href="/tools/{tool.id}" class="flex flex-1 items-center gap-4 min-w-0">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-campus-blue text-white">
            <Icon name={tool.icon} />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-bold text-text">{tool.name}</span>
            <span class="block truncate text-sm text-text-muted">{tool.description}</span>
          </span>
          <span class="text-xs font-bold text-text-muted shrink-0">{app.categoryName(tool.categoryId)}</span>
        </a>
        {#if admin}
          <div class="flex items-center gap-1 shrink-0">
            <button aria-label="Edit {tool.name}" onclick={() => onEdit?.(tool)} class="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition hover:bg-muted hover:text-link">
              <Pencil class="h-4 w-4" />
            </button>
            <form method="POST" action="?/deleteTool" use:enhance>
              <input type="hidden" name="toolId" value={tool.id} />
              <button aria-label="Delete {tool.name}" type="submit" class="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition hover:bg-rose-100 hover:text-rose-600">
                <Trash2 class="h-4 w-4" />
              </button>
            </form>
          </div>
        {:else}
          <form method="POST" action="?/toggleFavorite" use:enhance class="shrink-0">
            <input type="hidden" name="toolId" value={tool.id} />
            <button aria-label={app.isFavorite(tool.id) ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}>
              <Heart class="h-5 w-5 {app.isFavorite(tool.id) ? 'fill-campus-gold text-campus-gold' : 'text-text-soft'}" />
            </button>
          </form>
        {/if}
      </div>
    {/each}
  </div>
{/if}
