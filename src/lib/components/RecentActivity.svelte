<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import { BookOpen, Heart, LogIn } from 'lucide-svelte'

  const app = getAppState()

  function activityIcon(type: string) {
    if (type === 'tool_launch') return BookOpen
    if (type === 'favorite') return Heart
    if (type === 'login') return LogIn
    return null
  }

  function activityLabel(type: string, toolName?: string): string {
    if (type === 'tool_launch') return toolName ? `Launched ${toolName}` : 'Launched a tool'
    if (type === 'favorite') return toolName ? `Favorited ${toolName}` : 'Favorited a tool'
    if (type === 'login') return 'Signed in'
    return 'Activity'
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

<section>
  <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-link">Recent</p>
  {#if app.recentActivities.length === 0}
    <p class="text-sm text-text-muted">No recent activity yet. Launch some tools to see them here.</p>
  {:else}
    <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
      {#each app.recentActivities as activity}
        {@const Icon = activityIcon(activity.type)}
        <div class="flex items-center gap-4 px-5 py-4">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-text-muted">
            {#if Icon}
              <Icon class="h-5 w-5" />
            {/if}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-bold text-text">{activityLabel(activity.type, activity.toolName)}</span>
            <span class="block text-xs text-text-muted">{relativeTime(activity.createdAt)}</span>
          </span>
        </div>
      {/each}
    </div>
  {/if}
</section>
