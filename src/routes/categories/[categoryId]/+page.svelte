<script lang="ts">
  import { page } from '$app/stores'
  import { getAppState } from '$lib/app-state.svelte'
  import ToolGrid from '$lib/components/shared/ToolGrid.svelte'

  const app = getAppState()
  const categoryId = $derived($page.params.categoryId)
  const category = $derived(app.categories.find((item) => item.id === categoryId))
  const tools = $derived(app.visibleTools.filter((tool) => tool.categoryId === categoryId))
</script>

<section class="mx-auto max-w-6xl space-y-6">
  <div class="rounded-[28px] bg-surface px-6 py-8 shadow-sm ring-1 ring-border sm:px-10">
    <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Category</p>
    <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-text">{category?.name || 'Category'}</h2>
    {#if category?.description}
      <p class="mt-3 text-base leading-relaxed text-text-muted">{category.description}</p>
    {/if}
  </div>
  <ToolGrid {tools} />
</section>
