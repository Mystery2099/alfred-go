<script lang="ts">
  import { enhance } from '$app/forms'
  import { Heart, Pencil, Trash2, ExternalLink, ChevronRight } from 'lucide-svelte'
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
  <div class="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
    <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted">
      <ExternalLink class="h-6 w-6 text-text-soft" />
    </div>
    <h3 class="mt-4 text-lg font-extrabold text-text">No tools found</h3>
    <p class="mt-1 text-sm text-text-muted">Try a different search, category, or role view.</p>
  </div>
{:else}
  <div class="grid gap-3">
    {#each tools as tool}
      <div         class="group relative flex items-center gap-4 rounded-2xl bg-surface px-5 py-4 shadow-sm ring-1 ring-border/60 transition duration-200 ease-out hover:bg-muted/60 active:scale-[0.995]">
        <!-- Tonal icon container -->
        <a
          href="/tools/{tool.id}"
          class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted text-link transition duration-200 group-hover:scale-105"
        >
          <Icon name={tool.icon} class="h-6 w-6" />
        </a>

        <!-- Content -->
        <a href="/tools/{tool.id}" class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="block text-[15px] font-extrabold text-text">{tool.name}</span>
            {#if tool.status === 'maintenance'}
              <span class="inline-flex h-2 w-2 rounded-full bg-amber-500" title="Maintenance"></span>
            {:else if tool.status === 'degraded'}
              <span class="inline-flex h-2 w-2 rounded-full bg-orange-500" title="Degraded"></span>
            {:else if tool.status === 'offline'}
              <span class="inline-flex h-2 w-2 rounded-full bg-rose-500" title="Offline"></span>
            {/if}
          </div>
          <span class="mt-0.5 block truncate text-sm text-text-muted">{tool.description}</span>
        </a>

        <!-- Category chip -->
        {#if !admin}
          <span class="hidden shrink-0 rounded-full bg-muted px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-text-soft sm:block">
            {app.categoryName(tool.categoryId)}
          </span>
        {/if}

        <!-- Actions -->
        {#if admin}
          <div class="flex items-center gap-1 shrink-0">
            <button
              aria-label="Edit {tool.name}"
              onclick={() => onEdit?.(tool)}
              class="grid h-9 w-9 place-items-center rounded-xl text-text-muted transition duration-150 hover:scale-110 hover:bg-muted hover:text-link active:scale-90"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <form method="POST" action="?/deleteTool" use:enhance>
              <input type="hidden" name="toolId" value={tool.id} />
              <button
                aria-label="Delete {tool.name}"
                type="submit"
                class="grid h-9 w-9 place-items-center rounded-xl text-text-muted transition duration-150 hover:scale-110 hover:bg-rose-50 hover:text-rose-600 active:scale-90"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </form>
          </div>
        {:else}
          <div class="flex items-center gap-1 shrink-0">
            <form method="POST" action="?/toggleFavorite" use:enhance>
              <input type="hidden" name="toolId" value={tool.id} />
              <button
                aria-label={app.isFavorite(tool.id) ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
                class="grid h-9 w-9 place-items-center rounded-xl text-text-muted transition duration-150 hover:scale-110 hover:bg-muted active:scale-90"
              >
                <Heart class="h-5 w-5 {app.isFavorite(tool.id) ? 'fill-campus-gold text-campus-gold' : 'text-text-soft'}" />
              </button>
            </form>
            <a
              href="/tools/{tool.id}"
              class="grid h-9 w-9 place-items-center rounded-xl text-text-soft transition duration-150 hover:bg-muted hover:text-link active:scale-90"
              aria-label="View {tool.name}"
            >
              <ChevronRight class="h-5 w-5 transition duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
