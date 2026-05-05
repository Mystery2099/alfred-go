<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import Announcements from '$lib/components/Announcements.svelte'
  import Icon from '$lib/components/shared/Icon.svelte'
  import RecentActivity from '$lib/components/RecentActivity.svelte'
  import SkeletonSection from '$lib/components/shared/SkeletonSection.svelte'
  import ToolSections from '$lib/components/ToolSections.svelte'

  const app = getAppState()

  const favoriteTools = $derived(app.visibleTools.filter((tool) => app.isFavorite(tool.id)))
  const featured = $derived(app.visibleTools.filter((tool) => tool.isFeatured))
  const quickTools = $derived((favoriteTools.length ? favoriteTools : featured).slice(0, 6))
  const quickLabel = $derived(favoriteTools.length ? 'Pinned' : 'Quick Access')
</script>

{#if !app.dataReady}
  <section class="mx-auto max-w-6xl space-y-8">
    <SkeletonSection count={3} title="What's Happening" />
    <SkeletonSection count={6} title="Quick Access" />
    <SkeletonSection count={3} title="Recent" />
    <SkeletonSection count={4} title="All Resources" />
  </section>
{:else}
  <section class="mx-auto max-w-6xl space-y-8">
    <Announcements {app} limit={3} />

    <!-- Quick Access / Pinned -->
    <section>
      <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-link">{quickLabel}</p>
      {#if quickTools.length > 0}
        <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
          {#each quickTools as tool}
            <a
              href="/tools/{tool.id}"
              class="group flex items-center gap-4 px-5 py-4 transition duration-200 ease-out hover:bg-muted active:scale-[0.995]"
            >
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-campus-blue text-white transition duration-200 group-hover:scale-105">
                <Icon name={tool.icon} />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-bold text-text">{tool.name}</span>
                <span class="block truncate text-sm text-text-muted">{tool.description}</span>
              </span>
              <span class="text-xs font-bold text-text-muted transition duration-200 group-hover:text-link">{app.categoryName(tool.categoryId)}</span>
            </a>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-text-muted">No tools available.</p>
      {/if}
    </section>

    <!-- Recent Activity -->
    <section>
      <RecentActivity />
    </section>

    <!-- All Resources -->
    <section>
      <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-link">All Resources</p>
      <ToolSections tools={app.visibleTools} />
    </section>
  </section>
{/if}
