<script lang="ts">
  import { CheckCircle2, Circle, ChevronRight, X, Sparkles, AlertCircle, CreditCard, Mail, GraduationCap, Home, BookOpen, Star, ShieldCheck, ClipboardCheck } from 'lucide-svelte'
  import type { AppStore } from '$lib/app-state.svelte'
  import type { Role } from '$lib/types'

  interface ChecklistItem {
    id: string
    label: string
    description?: string
    toolId?: string
    icon: any
    urgency?: 'high' | 'medium' | 'low'
  }

  let { app }: { app: AppStore } = $props()

  const role = $derived(app.effectiveRole)
  const userId = $derived(app.userId)

  function storageKey() {
    return `alfredgo_checklist_${userId ?? 'guest'}_${role}`
  }

  function dismissedKey() {
    return `alfredgo_checklist_dismissed_${userId ?? 'guest'}_${role}`
  }

  function loadChecked(): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = localStorage.getItem(storageKey())
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  }

  function loadDismissed(): boolean {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(dismissedKey()) === 'true'
    } catch {
      return false
    }
  }

  let checkedIds = $state<Set<string>>(loadChecked())
  let isDismissed = $state<boolean>(loadDismissed())

  function saveChecked(ids: Set<string>) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey(), JSON.stringify(Array.from(ids)))
    }
  }

  function saveDismissed(dismissed: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(dismissedKey(), String(dismissed))
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

  const checklists: Partial<Record<Role, ChecklistItem[]>> = {
    applicant: [
      { id: 'app-status', label: 'Check My Application Status', description: 'Track your application and missing documents', toolId: 'application-status', icon: ClipboardCheck, urgency: 'high' },
      { id: 'app-fafsa', label: 'Apply for FAFSA', description: 'Federal student aid application', toolId: 'fafsa', icon: CreditCard },
      { id: 'app-tap', label: 'Apply for NYS TAP', description: 'New York State Tuition Assistance', toolId: 'nys-tap', icon: CreditCard },
      { id: 'app-scholarships', label: 'Search for Scholarships', description: 'ScholarshipUniverse and more', toolId: 'scholarshipuniverse', icon: Star },
      { id: 'app-financial-aid', label: 'Apply for Financial Aid', description: 'FAFSA, TAP, Excelsior Scholarship', toolId: 'financial-aid', icon: CreditCard },
      { id: 'app-costs', label: 'Review Costs & Aid Requirements', description: 'Estimated costs and required forms', toolId: 'cost-aid-requirements', icon: BookOpen },
    ],
    accepted_student: [
      { id: 'acc-status', label: 'Check My Application Status', description: 'Track your enrollment steps and missing documents', toolId: 'application-status', icon: ClipboardCheck, urgency: 'high' },
      { id: 'acc-aid', label: 'Review & Accept Financial Aid Offer', description: 'Accept or decline your awards', toolId: 'financial-aid-offer', icon: CreditCard, urgency: 'high' },
      { id: 'acc-bill', label: 'Pay Enrollment Deposit / Bill', description: 'Check balance and payment options', toolId: 'pay-bill', icon: CreditCard, urgency: 'high' },
      { id: 'acc-housing', label: 'Apply for Housing', description: 'Select room and meal plan', toolId: 'erez-life', icon: Home, urgency: 'high' },
      { id: 'acc-email', label: 'Set Up My Alfred State Email', description: 'Outlook email and Microsoft 365', toolId: 'email', icon: Mail },
      { id: 'acc-account', label: 'Check My Student Account', description: 'Bannerweb student dashboard', toolId: 'bannerweb', icon: ShieldCheck },
      { id: 'acc-learning', label: 'Access My Courses', description: 'My Learning online coursework', toolId: 'my-learning', icon: BookOpen },
      { id: 'acc-degreeworks', label: 'Review My Degree Progress', description: 'Track credits and requirements', toolId: 'degreeworks', icon: GraduationCap },
    ],
    
  }

  const items = $derived(checklists[role] ?? [])
  const isEligible = $derived(role in checklists)
  const completedCount = $derived(items.filter((item) => checkedIds.has(item.id)).length)
  const totalCount = $derived(items.length)
  const isComplete = $derived(completedCount === totalCount && totalCount > 0)
  const progressPercent = $derived(totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0)
</script>

{#if isEligible && !isDismissed && items.length > 0}
  <section class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-campus-blue text-white">
          <Sparkles class="h-5 w-5" />
        </div>
        <div>
          <h2 class="text-sm font-extrabold text-text">Getting Started</h2>
          <p class="text-xs text-text-muted">
            {#if isComplete}
              All done — great job!
            {:else}
              {completedCount} of {totalCount} completed
            {/if}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        {#if isComplete}
          <button
            type="button"
            onclick={resetProgress}
            class="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-muted transition hover:bg-muted"
            title="Reset progress"
          >
            Reset
          </button>
        {/if}
        <button
          type="button"
          onclick={dismiss}
          class="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition hover:bg-muted"
          aria-label="Dismiss getting started"
          title="Dismiss"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Progress bar -->
    {#if !isComplete}
      <div class="px-5 pb-3 sm:px-6">
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-campus-blue transition-all duration-500 ease-out"
            style="width: {progressPercent}%"
          ></div>
        </div>
      </div>
    {/if}

    <!-- Checklist -->
    <div class="divide-y divide-border" role="list" aria-label="Getting started checklist">
      {#each items as item (item.id)}
        {@const isChecked = checkedIds.has(item.id)}
        {@const badge = getUrgencyBadge(item.toolId)}
        {@const ItemIcon = item.icon}
        <div
          role="listitem"
          class="group flex items-start gap-3 px-5 py-3.5 transition hover:bg-muted/60 sm:px-6"
        >
          <button
            type="button"
            onclick={() => toggleItem(item.id)}
            class="mt-0.5 shrink-0 transition hover:scale-110"
            aria-label="{isChecked ? 'Mark incomplete' : 'Mark complete'}: {item.label}"
            aria-pressed={isChecked}
          >
            {#if isChecked}
              <CheckCircle2 class="h-5 w-5 text-emerald-500" />
            {:else}
              <Circle class="h-5 w-5 text-text-soft" />
            {/if}
          </button>

          <div class="min-w-0 flex-1">
            {#if item.toolId}
              <a
                href="/tools/{item.toolId}"
                class="block text-sm font-bold {isChecked ? 'text-text-muted line-through' : 'text-text'} transition group-hover:text-link"
              >
                {item.label}
              </a>
            {:else}
              <span class="block text-sm font-bold {isChecked ? 'text-text-muted line-through' : 'text-text'}">
                {item.label}
              </span>
            {/if}
            {#if item.description}
              <p class="text-xs text-text-muted {isChecked ? 'line-through opacity-60' : ''}">{item.description}</p>
            {/if}
          </div>

          <div class="flex shrink-0 items-center gap-2">
            {#if badge}
              <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <AlertCircle class="h-3 w-3" />
                {badge}
              </span>
            {/if}
            {#if item.toolId}
              <a
                href="/tools/{item.toolId}"
                class="grid h-7 w-7 place-items-center rounded-lg text-text-soft opacity-0 transition group-hover:opacity-100 hover:bg-muted"
                aria-label="Go to {item.label}"
              >
                <ChevronRight class="h-4 w-4" />
              </a>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    {#if isComplete}
      <div class="flex items-center justify-center gap-2 px-5 py-4 sm:px-6">
        <CheckCircle2 class="h-4 w-4 text-emerald-500" />
        <span class="text-xs font-semibold text-text-muted">All caught up!</span>
        <button
          type="button"
          onclick={dismiss}
          class="ml-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-link transition hover:bg-muted"
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
    class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-5 py-3.5 text-sm font-semibold text-text-muted transition hover:bg-muted hover:text-link"
  >
    <Sparkles class="h-4 w-4" />
    <span>Show Getting Started checklist ({completedCount}/{totalCount})</span>
  </button>
{/if}
