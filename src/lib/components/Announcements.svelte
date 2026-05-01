<script lang="ts">
  import { AlertTriangle, Clock3, ClipboardList, ChevronRight } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import Icon from './shared/Icon.svelte'
  import { page } from '$app/stores'

  const app = getAppState()

  const notices = [
    { title: 'Banner and DegreeWorks Maintenance', body: 'Banner and DegreeWorks may be unavailable during scheduled overnight maintenance windows.', time: 'Campus update', tone: 'urgent' as const, filter: 'updates' as const, action: 'View DegreeWorks', tool: 'degreeworks' },
    { title: 'Academic Calendar Deadlines', body: 'Review withdrawal dates, final exam schedules, and registration deadlines for the current term.', time: 'Academic reminder', tone: 'deadline' as const, filter: 'deadlines' as const, action: 'Academic Calendar', tool: 'academic-calendar' },
    { title: 'Registration Tasks Available', body: 'Review DegreeWorks, schedule planning, advisor verification, and SSB registration.', time: 'Registration reminder', tone: 'reminder' as const, filter: 'reminders' as const, action: 'Register for Classes', tool: 'register-for-classes' }
  ]

  type FilterType = 'all' | 'deadlines' | 'reminders' | 'updates'
  const filters: [FilterType, string][] = [['all', 'All'], ['deadlines', 'Deadlines'], ['reminders', 'Reminders'], ['updates', 'Updates']]

  let filterContainerRef: HTMLDivElement | undefined = $state()
  let pillStyle = $state({ left: '0px', width: '0px', opacity: 0 })

  $effect(() => {
    const _ = app.noticeFilter
    if (!filterContainerRef) return
    requestAnimationFrame(() => {
      const activeEl = filterContainerRef!.querySelector('.pill.active') as HTMLElement | null
      if (activeEl) {
        pillStyle = {
          left: `${activeEl.offsetLeft}px`,
          width: `${activeEl.offsetWidth}px`,
          opacity: 1,
        }
      } else {
        pillStyle = { ...pillStyle, opacity: 0 }
      }
    })
  })

  const filtered = $derived(() => notices.filter((notice) => app.noticeFilter === 'all' || notice.filter === app.noticeFilter))
</script>

<section>
  <div class="mb-2 flex items-center justify-between gap-3">
    <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-link">What's Happening</p>
    <div class="no-scrollbar -mr-4 relative flex max-w-full gap-2 overflow-x-auto pb-1 pr-4" bind:this={filterContainerRef}>
      <div
        class="pointer-events-none absolute bottom-1 top-0 z-0 rounded-full bg-campus-blue transition-all duration-300 ease-out"
        style="left: {pillStyle.left}; width: {pillStyle.width}; opacity: {pillStyle.opacity};"
      ></div>
      {#each filters as [value, label]}
        <button
          class="pill relative z-10 {app.noticeFilter === value ? 'active' : ''}"
          onclick={() => app.setNoticeFilter(value)}
        >
          {label}
        </button>
      {/each}
    </div>
  </div>
  <div class="space-y-3">
    {#each filtered() as notice}
      <article class="flex items-center gap-4 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-border transition hover:bg-muted hover:shadow-md hover:ring-campus-blue/20 sm:p-4">
        <span class="notice-icon {notice.tone}">
          {#if notice.tone === 'urgent'}
            <AlertTriangle class="h-5 w-5" />
          {:else if notice.tone === 'deadline'}
            <Clock3 class="h-5 w-5" />
          {:else}
            <ClipboardList class="h-5 w-5" />
          {/if}
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-extrabold text-link">
            {notice.title}
            {#if notice.tone === 'urgent'}
              <span class="ml-2 inline-flex items-center gap-1 rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Urgent</span>
            {/if}
          </h3>
          <p class="mt-1 text-sm text-text-muted opacity-90">{notice.body}</p>
          <p class="mt-3 flex items-center gap-1 text-xs font-medium text-text-muted"><Clock3 class="h-3 w-3" /> {notice.time}</p>
        </div>
        {#if notice.action && notice.tool}
          <a href="/tools/{notice.tool}" class="action-chip">
            {notice.action} <ChevronRight class="h-4 w-4" />
          </a>
        {/if}
      </article>
    {/each}
  </div>
</section>
