<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import Announcements from '$lib/components/Announcements.svelte'
  import DashboardSection from '$lib/components/DashboardSection.svelte'
  import GettingStarted from '$lib/components/GettingStarted.svelte'
  import Icon from '$lib/components/shared/Icon.svelte'
  import RecentActivity from '$lib/components/RecentActivity.svelte'
  import SkeletonSection from '$lib/components/shared/SkeletonSection.svelte'
  import ToolSections from '$lib/components/ToolSections.svelte'
  import { ChevronRight } from 'lucide-svelte'

  const app = getAppState()

  const favoriteTools = $derived(app.visibleTools.filter((tool) => app.isFavorite(tool.id)))
  const quickTools = $derived(favoriteTools.slice(0, 3))
</script>

{#if !app.dataReady}
  <section class="mx-auto max-w-6xl space-y-8">
    <SkeletonSection count={3} title="What's Happening" />
    <SkeletonSection count={3} title="Favorites" />
    <SkeletonSection count={3} title="Recent" />
    <SkeletonSection count={4} title="All Resources" />
  </section>
{:else}
  <section class="mx-auto max-w-6xl space-y-8">
    <!-- Getting Started -->
    {#if app.isAuthenticated}
      <GettingStarted {app} />
    {/if}

    <!-- Announcements -->
    <DashboardSection title="What's Happening" sectionKey="announcements" count={app.announcements.length}>
      <Announcements {app} limit={3} />
    </DashboardSection>

    <!-- Favorites -->
    {#if quickTools.length > 0}
      <DashboardSection title="Favorites" sectionKey="favorites" count={favoriteTools.length}>
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
        {#if favoriteTools.length > 3}
          <a href="/favorites" class="group mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-muted px-5 py-3.5 text-sm font-semibold text-link outline-none transition-all duration-200 hover:bg-link hover:text-white hover:shadow-md hover:shadow-link/20 focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.995]">
            <span>View all {favoriteTools.length} favorites</span>
            <ChevronRight class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        {/if}
      </DashboardSection>
    {/if}

    <!-- Recent Activity -->
    <DashboardSection title="Recent" sectionKey="recent">
      <RecentActivity />
    </DashboardSection>

    <!-- All Resources -->
    <DashboardSection title="All Resources" sectionKey="resources" count={app.visibleTools.length}>
      <ToolSections tools={app.visibleTools} />
    </DashboardSection>
  </section>
{/if}
