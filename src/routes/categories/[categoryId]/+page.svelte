<script lang="ts">
  import { page } from '$app/stores'
  import { getAppState } from '$lib/app-state.svelte'
  import ToolGrid from '$lib/components/shared/ToolGrid.svelte'

  const app = getAppState()
  const categoryId = $derived($page.params.categoryId)
  const category = $derived(app.categories.find((item) => item.id === categoryId))
  const tools = $derived(app.visibleTools.filter((tool) => tool.categoryId === categoryId))
</script>

<section class="space-y-5">
  <div>
    <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Category</p>
    <h2 class="mt-1 text-2xl font-extrabold text-link">{category?.name || 'Category'}</h2>
  </div>
  <p class="text-text-muted">{category?.description}</p>
  <ToolGrid {tools} />
</section>
