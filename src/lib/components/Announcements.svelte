<script lang="ts">
  import { Bell, Calendar, Clock, Megaphone, TriangleAlert } from 'lucide-svelte'
  import type { Announcement, AppState } from '../types'

  let { app, limit = 0 }: { app: AppState; limit?: number } = $props()

  const isPreview = $derived(limit > 0)

  const filters = ['All', 'Reminders', 'Deadlines', 'Updates'] as const
  let activeFilter = $state('All')

  function filteredAnnouncements() {
    let list = app?.announcements ?? []
    if (activeFilter !== 'All') {
      list = list.filter(
        (a) => a.filter?.toLowerCase() === activeFilter.toLowerCase()
      )
    }
    if (isPreview) {
      list = list.slice(0, limit)
    }
    return list
  }

  const toneIcons: Record<string, any> = {
    urgent: TriangleAlert,
    deadline: Clock,
    reminder: Bell,
    default: Megaphone,
  }

  const toneColors: Record<string, string> = {
    urgent: 'text-amber-600 dark:text-amber-400',
    deadline: 'text-rose-600 dark:text-rose-400',
    reminder: 'text-sky-600 dark:text-sky-400',
    default: 'text-cyan-600 dark:text-cyan-400',
  }

  const borderColors: Record<string, string> = {
    urgent: 'border-l-amber-500',
    deadline: 'border-l-rose-500',
    reminder: 'border-l-sky-500',
    default: 'border-l-cyan-500',
  }
</script>

<section class="space-y-3" aria-label="Announcements">
  <!-- Header and filters -->
  <div>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">What&apos;s Happening</h2>
      {#if !isPreview}
        <a href="/announcements" class="text-xs font-medium text-campus-blue-700 dark:text-campus-blue-400 hover:underline hidden sm:inline-flex items-center gap-1">
          View all
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </a>
      {/if}
    </div>
    {#if !isPreview}
      <div class="flex flex-wrap gap-1.5 sm:gap-2">
        {#each filters as f}
          <button
            onclick={() => { activeFilter = f }}
            class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors border {activeFilter === f ? 'bg-campus-blue-600 text-white border-campus-blue-600 dark:bg-campus-blue-500 dark:border-campus-blue-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}"
            aria-pressed={activeFilter === f}
          >
            {f}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Compact list (no scroll on dashboard) -->
  <div class="space-y-2 {isPreview ? '' : 'max-h-[280px] overflow-y-auto visible-scrollbar scroll-fade pr-1'}">
    {#each filteredAnnouncements() as a (a.id)}
      <a
        href={a.toolId ? `/tools/${a.toolId}` : (a.url || '#')}
        class="group block bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/40 border-l-4 {borderColors[a.tone ?? 'default']} hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors p-2.5 sm:p-3"
        aria-label="{a.title} — {a.body}"
      >
        <div class="flex items-start gap-2.5">
          {#if a.tone}
            {@const Icon = toneIcons[a.tone] || Megaphone}
            <div class="mt-0.5 shrink-0 {toneColors[a.tone ?? 'default']}">
              <Icon size={16} />
            </div>
          {/if}
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{a.title}</p>
              {#if a.actionLabel}
                <span class="shrink-0 hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-campus-blue-700 dark:text-campus-blue-400 group-hover:underline">
                  {a.actionLabel}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              {/if}
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{a.body}</p>
          </div>
        </div>
      </a>
    {/each}
    {#if filteredAnnouncements().length === 0}
      <div class="text-center py-6 text-sm text-slate-500 dark:text-slate-400">No announcements for this filter.</div>
    {/if}
  </div>

  {#if isPreview && (app?.announcements?.length ?? 0) > limit}
    <a href="/announcements" class="block w-full text-center py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-campus-blue-300 dark:hover:border-campus-blue-700 transition-colors">
      View all {app?.announcements?.length ?? 0} announcements
    </a>
  {/if}
</section>
