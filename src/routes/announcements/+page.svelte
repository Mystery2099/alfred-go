<script lang="ts">
  import { page } from '$app/stores'
  import { AlertTriangle, Bell, ChevronRight, Clock3, ClipboardList, Search, X } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import type { Announcement } from '$lib/types'

  let { data } = $props()
  const app = getAppState()

  let searchQuery = $state('')
  let activeFilter = $state<'all' | 'deadlines' | 'reminders' | 'updates'>('all')
  let activeTone = $state<'all' | 'urgent' | 'deadline' | 'reminder'>('all')

  const filters: ['all' | 'deadlines' | 'reminders' | 'updates', string][] = [
    ['all', 'All'],
    ['deadlines', 'Deadlines'],
    ['reminders', 'Reminders'],
    ['updates', 'Updates'],
  ]

  const tones: ['all' | 'urgent' | 'deadline' | 'reminder', string, string][] = [
    ['all', 'All tones', ''],
    ['urgent', 'Urgent', 'bg-rose-100 text-rose-600'],
    ['deadline', 'Deadline', 'bg-amber-100 text-amber-600'],
    ['reminder', 'Reminder', 'bg-muted text-link'],
  ]

  const filtered = $derived(() => {
    return data.announcements.filter((a: Announcement) => {
      const matchesFilter = activeFilter === 'all' || a.filter === activeFilter
      const matchesTone = activeTone === 'all' || a.tone === activeTone
      const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.body.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesTone && matchesSearch
    })
  })

  function toneBg(tone: string) {
    if (tone === 'urgent') return 'bg-rose-100 text-rose-600'
    if (tone === 'deadline') return 'bg-amber-100 text-amber-600'
    return 'bg-muted text-link'
  }
</script>

<div class="mx-auto max-w-6xl">
  <!-- Search -->
  <div class="mb-5">
    <label class="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm ring-2 ring-transparent transition focus-within:border-campus-blue focus-within:ring-campus-blue/20">
      <Search class="h-5 w-5 text-text-muted" />
      <input
        type="text"
        class="w-full bg-transparent text-sm outline-none"
        placeholder="Search announcements..."
        bind:value={searchQuery}
        maxlength="100"
      />
      {#if searchQuery}
        <button onclick={() => searchQuery = ''} class="rounded-lg p-1 text-text-muted hover:bg-muted">
          <X class="h-4 w-4" />
        </button>
      {/if}
    </label>
  </div>

  <!-- Filters -->
  <div class="mb-3 flex flex-wrap items-center gap-2">
    {#each filters as [value, label]}
      <button
        class="rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors {activeFilter === value ? 'bg-campus-blue text-white' : 'bg-surface text-text-muted ring-1 ring-border hover:text-link'}"
        onclick={() => activeFilter = value}
      >
        {label}
      </button>
    {/each}
  </div>

  <!-- Tone filters -->
  <div class="mb-5 flex flex-wrap items-center gap-2">
    {#each tones as [value, label, colorClass]}
      <button
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors {activeTone === value ? 'bg-campus-blue text-white' : 'bg-surface text-text-muted ring-1 ring-border hover:text-link'}"
        onclick={() => activeTone = value}
      >
        {#if value !== 'all'}
          <span class="h-2 w-2 rounded-full {colorClass.replace('text-', 'bg-').replace('/10', '')}"></span>
        {/if}
        {label}
      </button>
    {/each}
  </div>

  <!-- Count -->
  <p class="mb-3 text-xs font-medium text-text-muted">
    {filtered().length} announcement{filtered().length === 1 ? '' : 's'}
  </p>

  <!-- List -->
  <div class="space-y-3">
    {#each filtered() as notice (notice.id)}
      <article class="rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:bg-muted hover:shadow-md sm:p-5">
        <div class="flex items-start gap-4">
          <span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {toneBg(notice.tone)}">
            {#if notice.tone === 'urgent'}
              <AlertTriangle class="h-5 w-5" />
            {:else if notice.tone === 'deadline'}
              <Clock3 class="h-5 w-5" />
            {:else}
              <ClipboardList class="h-5 w-5" />
            {/if}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-base font-extrabold text-link">
                  {notice.title}
                  {#if notice.tone === 'urgent'}
                    <span class="ml-2 inline-flex items-center gap-1 rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Urgent</span>
                  {/if}
                </h2>
                <p class="mt-1.5 text-sm leading-relaxed text-text-muted">{notice.body}</p>
              </div>
              {#if notice.actionLabel && (notice.toolId || notice.url)}
                <a
                  href={notice.url || `/tools/${notice.toolId}`}
                  target={notice.url ? '_blank' : undefined}
                  rel={notice.url ? 'noopener noreferrer' : undefined}
                  class="hidden shrink-0 items-center gap-1 rounded-full bg-selected px-4 py-2 text-xs font-extrabold text-link transition hover:bg-campus-blue hover:text-white sm:inline-flex"
                >
                  {notice.actionLabel}
                  <ChevronRight class="h-4 w-4" />
                </a>
              {/if}
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-3">
              <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-text-muted">
                <Clock3 class="h-3 w-3" />
                <span class="capitalize">{notice.filter}</span>
              </span>
              {#if notice.actionLabel && (notice.toolId || notice.url)}
                <a
                  href={notice.url || `/tools/${notice.toolId}`}
                  target={notice.url ? '_blank' : undefined}
                  rel={notice.url ? 'noopener noreferrer' : undefined}
                  class="inline-flex items-center gap-1 text-xs font-extrabold text-campus-blue transition-colors hover:underline sm:hidden"
                >
                  {notice.actionLabel} <ChevronRight class="h-3.5 w-3.5" />
                </a>
              {/if}
            </div>
          </div>
        </div>
      </article>
    {:else}
      <div class="flex flex-col items-center gap-3 py-12 text-text-muted">
        <Bell class="h-10 w-10 opacity-30" />
        <p class="text-sm font-medium">No announcements match your filters.</p>
        <button
          onclick={() => { activeFilter = 'all'; activeTone = 'all'; searchQuery = '' }}
          class="rounded-full bg-campus-blue px-4 py-2 text-xs font-extrabold text-white"
        >
          Clear filters
        </button>
      </div>
    {/each}
  </div>
</div>
