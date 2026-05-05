<script lang="ts">
  import { resolve } from '$app/paths'
  import { CheckCircle2, Circle, ChevronDown, ChevronRight, X, Sparkles, AlertCircle, HelpCircle } from 'lucide-svelte'
  import type { AppStore } from '$lib/app-state.svelte'
  import { checklistDismissedStorageKey, checklistStorageKey, roleChecklists, roleOnboarding } from '$lib/onboarding'

  let { app }: { app: AppStore } = $props()

  const role = $derived(app.effectiveRole)
  const userId = $derived(app.userId)

  function loadChecked(): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = localStorage.getItem(checklistStorageKey(userId, role))
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  }

  function loadDismissed(): boolean {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(checklistDismissedStorageKey(userId, role)) === 'true'
    } catch {
      return false
    }
  }

  let checkedIds = $state<Set<string>>(loadChecked())
  let isDismissed = $state<boolean>(loadDismissed())
  let expandedId = $state<string | null>(null)

  $effect(() => {
    const _key = `${userId ?? 'guest'}_${role}`
    checkedIds = loadChecked()
    isDismissed = loadDismissed()
    expandedId = null
  })

  function saveChecked(ids: Set<string>) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(checklistStorageKey(userId, role), JSON.stringify(Array.from(ids)))
    }
  }

  function saveDismissed(dismissed: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(checklistDismissedStorageKey(userId, role), String(dismissed))
    }
  }

  function toggleItem(id: string) {
    const next = new Set(checkedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    checkedIds = next
    saveChecked(next)
  }

  function dismiss() {
    isDismissed = true
    saveDismissed(true)
  }

  function restore() {
    isDismissed = false
    saveDismissed(false)
  }

  function resetProgress() {
    checkedIds = new Set()
    saveChecked(new Set())
  }

  function toggleExpanded(id: string) {
    expandedId = expandedId === id ? null : id
  }

  function getUrgencyBadge(toolId?: string): string | null {
    if (!app.data || !toolId) return null
    const tool = app.data.tools.find((t) => t.id === toolId)
    if (!tool?.liveData) return null
    const ld = tool.liveData

    if (ld.pendingAction && typeof ld.pendingAction === 'number' && ld.pendingAction > 0) {
      return `${ld.pendingAction} pending`
    }
    if (ld.unreadCount && typeof ld.unreadCount === 'number' && ld.unreadCount > 0) {
      return `${ld.unreadCount} unread`
    }
    if (ld.openTickets !== undefined && typeof ld.openTickets === 'number' && ld.openTickets > 0) {
      return `${ld.openTickets} open`
    }
    if (ld.currentBalance && typeof ld.currentBalance === 'string' && ld.dueDate) {
      return 'Due soon'
    }
    if (ld.documentsNeeded && typeof ld.documentsNeeded === 'number' && ld.documentsNeeded > 0) {
      return `${ld.documentsNeeded} needed`
    }
    if (ld.holds && typeof ld.holds === 'number' && ld.holds > 0) {
      return `${ld.holds} hold${ld.holds > 1 ? 's' : ''}`
    }
    if (ld.flags && Array.isArray(ld.flags) && ld.flags.length > 0) {
      return `${ld.flags.length} alert${ld.flags.length > 1 ? 's' : ''}`
    }
    return null
  }

  const intro = $derived(roleOnboarding[role])
  const items = $derived(roleChecklists[role] ?? [])
  const isEligible = $derived(role in roleChecklists)
  const completedCount = $derived(items.filter((item) => checkedIds.has(item.id)).length)
  const totalCount = $derived(items.length)
  const isComplete = $derived(completedCount === totalCount && totalCount > 0)
  const progressPercent = $derived(totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0)
</script>

{#if isEligible && !isDismissed && items.length > 0}
  <section class="overflow-hidden rounded-[28px] bg-surface shadow-sm ring-1 ring-border">
    <!-- Header -->
    <div class="px-4 pb-3 pt-4 sm:px-6 sm:pt-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-start gap-3">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-selected text-link">
            <Sparkles class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-extrabold uppercase tracking-[0.16em] text-text-soft">Getting Started</p>
            <h2 class="mt-0.5 text-lg font-extrabold leading-tight text-text">{intro?.title ?? 'Getting Started'}</h2>
            <p class="mt-1 text-sm leading-5 text-text-muted">{intro?.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onclick={dismiss}
          class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-text-muted transition hover:bg-muted"
          aria-label="Dismiss getting started"
          title="Dismiss"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="mt-4 rounded-[22px] bg-muted p-3">
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-bold text-text">
            {#if isComplete}
              All steps complete
            {:else}
              {completedCount} of {totalCount} completed
            {/if}
          </span>
          <span class="rounded-full bg-surface px-2.5 py-1 text-xs font-extrabold text-link">{progressPercent}%</span>
        </div>
        <div class="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            class="h-full rounded-full bg-campus-blue transition-all duration-500 ease-out"
            style="width: {progressPercent}%"
          ></div>
        </div>
        {#if intro?.focus}
          <div class="mt-3 flex flex-wrap gap-2">
            {#each intro.focus as focus (focus)}
              <span class="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-text-muted">{focus}</span>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Checklist -->
    <div class="divide-y divide-border" role="list" aria-label="Getting started checklist">
      {#each items as item (item.id)}
        {@const isChecked = checkedIds.has(item.id)}
        {@const badge = getUrgencyBadge(item.toolId)}
        {@const ItemIcon = item.icon}
        {@const isExpanded = expandedId === item.id}
        <div
          role="listitem"
          class="px-4 py-2 transition hover:bg-muted/60 sm:px-6"
        >
          <div class="flex items-start gap-3">
            <button
              type="button"
              onclick={() => toggleItem(item.id)}
              class="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-muted active:scale-95"
              aria-label="{isChecked ? 'Mark incomplete' : 'Mark complete'}: {item.label}"
              aria-pressed={isChecked}
            >
              {#if isChecked}
                <CheckCircle2 class="h-6 w-6 text-emerald-500" />
              {:else}
                <Circle class="h-6 w-6 text-text-soft" />
              {/if}
            </button>

            <button
              type="button"
              onclick={() => toggleExpanded(item.id)}
              class="min-w-0 flex-1 rounded-2xl px-1 py-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-campus-blue/40"
              aria-expanded={isExpanded}
              aria-controls="checklist-details-{item.id}"
            >
              <span class="flex items-start gap-3">
                <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-muted text-link">
                  <ItemIcon class="h-5 w-5" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full bg-selected px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-link">{item.category}</span>
                    {#if badge}
                      <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <AlertCircle class="h-3 w-3" />
                        {badge}
                      </span>
                    {/if}
                  </span>
                  <span class="mt-1 block text-sm font-extrabold leading-5 {isChecked ? 'text-text-muted line-through' : 'text-text'}">{item.label}</span>
                  {#if item.description}
                    <span class="mt-0.5 block text-xs leading-5 text-text-muted {isChecked ? 'line-through opacity-60' : ''}">{item.description}</span>
                  {/if}
                </span>
                <ChevronDown class="mt-2 h-5 w-5 shrink-0 text-text-soft transition {isExpanded ? 'rotate-180' : ''}" />
              </span>
            </button>
          </div>

          {#if isExpanded}
            <div id="checklist-details-{item.id}" class="ml-[52px] pb-3 pr-1 sm:ml-[52px]">
              <div class="rounded-[22px] bg-muted p-4">
                <div class="space-y-3">
                  <div>
                    <p class="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-text-soft">
                      <HelpCircle class="h-3.5 w-3.5" />
                      What this is
                    </p>
                    <p class="mt-1 text-sm leading-6 text-text">{item.what}</p>
                  </div>
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-text-soft">Why it matters</p>
                    <p class="mt-1 text-sm leading-6 text-text-muted">{item.why}</p>
                  </div>
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-wide text-text-soft">Next step</p>
                    <p class="mt-1 text-sm leading-6 text-text-muted">{item.next}</p>
                  </div>
                </div>
                <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                  {#if item.toolId}
                    <a
                      href={resolve(`/tools/${item.toolId}`)}
                      class="primary-button min-h-11 flex-1 rounded-full px-4 py-2.5"
                    >
                      <span>Open</span>
                      <ChevronRight class="h-4 w-4" />
                    </a>
                  {/if}
                  <button
                    type="button"
                    onclick={() => toggleItem(item.id)}
                    class="secondary-button min-h-11 flex-1 rounded-full px-4 py-2.5"
                  >
                    {isChecked ? 'Mark incomplete' : 'Mark done'}
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    {#if isComplete}
      <div class="flex flex-wrap items-center justify-center gap-2 px-5 py-4 sm:px-6">
        <CheckCircle2 class="h-4 w-4 text-emerald-500" />
        <span class="text-xs font-semibold text-text-muted">All caught up!</span>
        <button
          type="button"
          onclick={resetProgress}
          class="rounded-full px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:bg-muted"
        >
          Reset
        </button>
        <button
          type="button"
          onclick={dismiss}
          class="rounded-full px-3 py-1.5 text-xs font-semibold text-link transition hover:bg-muted"
        >
          Hide this checklist
        </button>
      </div>
    {/if}
  </section>
{/if}

<!-- Restore button if dismissed but not complete -->
{#if isEligible && isDismissed && !isComplete && items.length > 0}
  <button
    type="button"
    onclick={restore}
    class="flex min-h-14 w-full items-center justify-center gap-2 rounded-[28px] border border-dashed border-border bg-surface px-5 py-3.5 text-sm font-semibold text-text-muted transition hover:bg-muted hover:text-link"
  >
    <Sparkles class="h-4 w-4" />
    <span>Show Getting Started checklist ({completedCount}/{totalCount})</span>
  </button>
{/if}
