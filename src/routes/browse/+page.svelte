<script lang="ts">
  import { Search, SlidersHorizontal } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import ToolGrid from '$lib/components/shared/ToolGrid.svelte'

  const app = getAppState()
</script>

<section class="mx-auto max-w-6xl space-y-6">
  <!-- Search bar -->
  <div class="rounded-[28px] bg-surface p-4 shadow-sm ring-1 ring-border sm:p-6">
    <label class="flex items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-3.5 transition focus-within:border-campus-blue focus-within:ring-2 focus-within:ring-campus-blue/20">
      <Search class="h-5 w-5 text-text-muted" />
      <input
        value={app.query}
        oninput={(e) => app.setQuery(e.currentTarget.value)}
        class="w-full bg-transparent text-sm outline-none"
        placeholder="Search by name, tag, category..."
        maxlength="100"
      />
    </label>
    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="flex items-center gap-2 rounded-2xl border border-border bg-muted px-3 py-2.5">
        <SlidersHorizontal class="h-4 w-4 text-text-soft" />
        <select
          value={app.categoryFilter}
          onchange={(e) => app.setCategoryFilter(e.currentTarget.value)}
          class="w-full bg-transparent text-sm outline-none"
        >
          <option value="all">All categories</option>
          {#each app.categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex items-center gap-2 rounded-2xl border border-border bg-muted px-3 py-2.5">
        <SlidersHorizontal class="h-4 w-4 text-text-soft" />
        <select
          value={app.tagFilter}
          onchange={(e) => app.setTagFilter(e.currentTarget.value)}
          class="w-full bg-transparent text-sm outline-none"
        >
          <option value="all">All tags</option>
          {#each app.allTags as tag}
            <option value={tag}>{tag}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <!-- Search chips -->
  <div>
    <p class="mb-3 px-1 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Try Searching For</p>
    <div class="flex flex-wrap gap-2 px-1">
      {#each ['my courses', 'my bill', 'financial aid', 'housing', 'email', 'advisor'] as term}
        <button class="search-chip" onclick={() => app.setQuery(term)}>{term}</button>
      {/each}
    </div>
  </div>

  <ToolGrid tools={app.filteredTools} />
</section>
