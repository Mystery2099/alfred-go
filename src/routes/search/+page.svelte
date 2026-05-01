<script lang="ts">
  import { Search } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import ToolGrid from '$lib/components/shared/ToolGrid.svelte'

  const app = getAppState()
</script>

<section class="mx-auto max-w-6xl space-y-5">
  <div class="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
    <label class="flex items-center gap-3 rounded-3xl border border-border bg-muted px-4 py-3 shadow-sm transition focus-within:border-campus-blue focus-within:ring-2 focus-within:ring-campus-blue/20">
      <Search class="h-5 w-5 text-text-muted" />
      <input value={app.query} oninput={(e) => app.setQuery(e.currentTarget.value)} class="w-full bg-transparent outline-none" placeholder="Search by name, tag, category..." />
    </label>
    <select value={app.categoryFilter} onchange={(e) => app.setCategoryFilter(e.currentTarget.value)} class="control">
      <option value="all">All categories</option>
      {#each app.categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
    <select value={app.tagFilter} onchange={(e) => app.setTagFilter(e.currentTarget.value)} class="control">
      <option value="all">All tags</option>
      {#each app.allTags as tag}
        <option value={tag}>{tag}</option>
      {/each}
    </select>
  </div>
  <div>
    <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-link">Try Searching For</p>
    <div class="flex flex-wrap gap-2">
      {#each ['my learning', 'degreeworks', 'financial aid', 'dining', 'email', 'printing'] as term}
        <button class="search-chip" onclick={() => app.setQuery(term)}>{term}</button>
      {/each}
    </div>
  </div>
  <ToolGrid tools={app.filteredTools} />
</section>
