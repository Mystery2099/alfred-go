<script lang="ts">
  import { page } from '$app/stores'
  import { getAppState } from '$lib/app-state.svelte'
  import { ArrowLeft } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import ToolGrid from '$lib/components/ToolGrid.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'

  const app = getAppState()
  const categoryId = $derived($page.params.categoryId)
  const category = $derived(app.categories.find((c) => c.id === categoryId))
  const tools = $derived(() => {
    if (!app.data) return []
    return app.data.tools.filter((t) =>
      t.categoryId === categoryId &&
      t.isActive &&
      app.roleCanSeeTool(app.effectiveRole, t)
    )
  })
</script>

<div class="p-4 md:p-8">
  <a href="/" class="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-link transition">
    <ArrowLeft class="h-4 w-4" />
    Back to Dashboard
  </a>

  {#if category}
    <SectionTitle>{category.name}</SectionTitle>
    <p class="mb-6 text-sm text-text-muted">{category.description || 'Browse tools in this category.'}</p>
    <ToolGrid tools={tools()} />
  {:else}
    <EmptyState title="Category not found" message="This category doesn't exist or has been removed." />
  {/if}
</div>
