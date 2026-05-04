<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import Icon from './shared/Icon.svelte'
  import { BookOpen, Heart, LogIn } from 'lucide-svelte'

  const app = getAppState()

  function activityIcon(type: string): string {
    if (type === 'tool_launch') return 'BookOpen'
    if (type === 'favorite') return 'Heart'
    if (type === 'login') return 'LogIn'
    return 'Clock'
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
    <div class="grid gap-3 md:grid-cols-3">
      {#each app.recentActivities as activity}
        <div class="recent-card">
          <span class="quick-icon tone-0">
            {#if activity.type === 'tool_launch'}
              <BookOpen class="h-5 w-5" />
            {:else if activity.type === 'favorite'}
              <Heart class="h-5 w-5" />
            {:else if activity.type === 'login'}
              <LogIn class="h-5 w-5" />
            {:else}
              <Icon name="Clock" />
            {/if}
          </span>
          <span class="min-w-0 flex-1 text-left">
            <b>{activityLabel(activity.type, activity.toolName)}</b>
            <small>{relativeTime(activity.createdAt)}</small>
          </span>
        </div>
      {/each}
    </div>
  {/if}
</section>
