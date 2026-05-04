<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import Announcements from '$lib/components/Announcements.svelte'
  import QuickCard from '$lib/components/shared/QuickCard.svelte'
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
    <section class="border-b border-border pb-8">
      <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-link">{quickLabel}</p>
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {#each quickTools as tool, index}
          <QuickCard {tool} tone={index % 4} />
        {/each}
      </div>
    </section>
    <section class="border-b border-border pb-8">
      <RecentActivity />
    </section>
    <section>
      <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-link">All Resources</p>
      <ToolSections tools={app.visibleTools} />
    </section>
  </section>
{/if}
