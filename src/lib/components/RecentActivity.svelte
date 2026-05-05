<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import { ExternalLink } from 'lucide-svelte'
  import Icon from './shared/Icon.svelte'

  const app = getAppState()

  // Only tool launches, deduplicated by toolId, most recent first
  const recentLaunches = $derived(() => {
    if (!app.data || !app.userId) return []
    const seen = new Set<string>()
    const result = []
    for (const activity of app.data.activities) {
      if (activity.userId !== app.userId) continue
      if (activity.type !== 'tool_launch') continue
      if (!activity.toolId) continue
      if (seen.has(activity.toolId)) continue
      seen.add(activity.toolId)
      result.push(activity)
    }
    return result.slice(0, 5)
  })

  function findTool(toolId?: string) {
    if (!toolId || !app.data) return null
    return app.data.tools.find((t) => t.id === toolId) || null
  }

  function relativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin} min ago`
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }
</script>

{#if recentLaunches().length === 0}
  <p class="text-sm text-text-muted">No recent tools yet. Launch some tools to see them here.</p>
{:else}
  <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
    {#each recentLaunches() as activity}
      {@const tool = findTool(activity.toolId)}
      <button
        type="button"
        class="group flex w-full items-center gap-4 px-5 py-4 text-left transition duration-200 ease-out hover:bg-muted active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!tool || !tool.url}
        onclick={() => tool && app.launchTool(tool)}
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-campus-blue text-white transition duration-200 group-hover:scale-105">
          {#if tool?.icon}
            <Icon name={tool.icon} class="h-5 w-5" />
          {:else}
            <ExternalLink class="h-5 w-5" />
          {/if}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-bold text-text">{activity.toolName || 'Unknown tool'}</span>
          <span class="block text-xs text-text-muted">{relativeTime(activity.createdAt)}</span>
        </span>
        {#if tool?.url}
          <ExternalLink class="h-4 w-4 shrink-0 text-text-soft opacity-0 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
        {/if}
      </button>
    {/each}
  </div>
{/if}
