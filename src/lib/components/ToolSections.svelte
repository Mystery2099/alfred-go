<script lang="ts">
  import { ChevronRight } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import Icon from './shared/Icon.svelte'
  import type { Tool } from '$lib/types'

  interface Props {
    tools: Tool[]
  }

  let { tools }: Props = $props()
  const app = getAppState()

  function toggleCategory(id: string) {
    app.toggleCategoryOpen(id)
  }
</script>

<div class="space-y-2">
  {#each app.categories.filter((category) => tools.some((tool) => tool.categoryId === category.id)) as category}
    {@const isOpen = app.openCategoryIds.has(category.id)}
    <section class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      <button
        class="group flex w-full items-center gap-3 px-4 py-4 text-left transition duration-200 ease-out hover:bg-muted active:scale-[0.995]"
        onclick={() => toggleCategory(category.id)}
        aria-expanded={isOpen}
      >
        <span class="grid h-8 w-8 place-items-center rounded-xl bg-muted text-sm text-link transition duration-200 group-hover:scale-105">{app.categoryGlyph(category.id)}</span>
        <span class="flex-1 font-extrabold">{category.name}</span>
        <span class="rounded-full bg-selected px-2.5 py-1 text-xs font-extrabold text-link">{tools.filter((tool) => tool.categoryId === category.id).length}</span>
        <ChevronRight class="h-4 w-4 text-text-soft transition duration-200 {isOpen ? 'rotate-90' : 'group-hover:translate-x-0.5'}" />
      </button>
      {#if isOpen}
        <div class="px-4 pb-4">
          {#each tools.filter((tool) => tool.categoryId === category.id) as tool}
            <a href="/tools/{tool.id}" class="group flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition duration-200 ease-out hover:bg-muted active:scale-[0.995]">
               <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted text-link transition duration-200 group-hover:scale-105">
                <Icon name={tool.icon} class="h-5 w-5" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-bold">{tool.name}</span>
                <span class="block truncate text-sm text-text-muted">{tool.description}</span>
              </span>
              <ChevronRight class="h-5 w-5 text-text-soft transition duration-200 group-hover:translate-x-0.5" />
            </a>
          {/each}
        </div>
      {/if}
    </section>
  {/each}
</div>
