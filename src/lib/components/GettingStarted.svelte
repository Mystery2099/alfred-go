<script lang="ts">
  import { resolve } from '$app/paths'
  import { CheckCircle2, Circle, ChevronDown, ChevronRight, X, Sparkles, AlertCircle, CreditCard, Mail, GraduationCap, Home, BookOpen, Star, ShieldCheck, ClipboardCheck, FileText, HelpCircle, Landmark } from 'lucide-svelte'
  import type { AppStore } from '$lib/app-state.svelte'
  import type { Role } from '$lib/types'

  interface ChecklistItem {
    id: string
    label: string
    description?: string
    category: string
    what: string
    why: string
    next: string
    toolId?: string
    icon: any
    urgency?: 'high' | 'medium' | 'low'
  }

  interface RoleOnboarding {
    title: string
    subtitle: string
    focus: string[]
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
  let expandedId = $state<string | null>(null)

  $effect(() => {
    const _key = `${userId ?? 'guest'}_${role}`
    checkedIds = loadChecked()
    isDismissed = loadDismissed()
    expandedId = null
  })

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

  const onboarding: Partial<Record<Role, RoleOnboarding>> = {
    applicant: {
      title: 'Your Admissions Path',
      subtitle: 'Start with application status, then work through aid and scholarship steps.',
      focus: ['Check missing documents', 'Apply for financial aid', 'Learn the next admissions steps'],
    },
    accepted_student: {
      title: 'Your New Student Setup',
      subtitle: 'Move from accepted to ready for classes by setting up money, housing, email, and student systems.',
      focus: ['Confirm money and billing', 'Set up campus accounts', 'Learn where classes and records live'],
    },
  }

  const checklists: Partial<Record<Role, ChecklistItem[]>> = {
    applicant: [
      { id: 'app-status', label: 'Check My Application Status', category: 'Admissions', description: 'Track your application and missing documents', what: 'Application Status is the place to see where your admissions file stands.', why: 'If a transcript, score, form, or other document is missing, this is usually where you find out first.', next: 'Open it and look for any missing documents or next steps before moving on.', toolId: 'application-status', icon: ClipboardCheck, urgency: 'high' },
      { id: 'app-fafsa', label: 'Apply for FAFSA', category: 'Financial aid', description: 'Federal student aid application', what: 'FAFSA is the federal financial aid application used to review grants, loans, and work-study eligibility.', why: 'Many aid offers start with FAFSA, so completing it early can prevent delays.', next: 'Open FAFSA, start or continue your application, then come back here when it is submitted.', toolId: 'fafsa', icon: FileText },
      { id: 'app-tap', label: 'Apply for NYS TAP', category: 'Financial aid', description: 'New York State Tuition Assistance', what: 'TAP is New York State aid for eligible students attending college in New York.', why: 'It may reduce what you owe, but it is separate from FAFSA.', next: 'Open the TAP application and use the same name and details you used on FAFSA.', toolId: 'nys-tap', icon: Landmark },
      { id: 'app-scholarships', label: 'Search for Scholarships', category: 'Financial aid', description: 'ScholarshipUniverse and more', what: 'ScholarshipUniverse helps match you with scholarship opportunities.', why: 'Scholarships can lower costs and may have deadlines before classes begin.', next: 'Open it, complete your profile, and save scholarships you may qualify for.', toolId: 'scholarshipuniverse', icon: Star },
      { id: 'app-financial-aid', label: 'Learn How Financial Aid Works', category: 'Financial aid', description: 'FAFSA, TAP, Excelsior Scholarship', what: 'The financial aid page collects the major aid tasks and explanations in one place.', why: 'Applicants often see several aid names at once. This gives you the map before you start clicking around.', next: 'Use it to confirm which aid steps apply to you.', toolId: 'financial-aid', icon: CreditCard },
      { id: 'app-costs', label: 'Review Costs & Aid Requirements', category: 'Planning', description: 'Estimated costs and required forms', what: 'Cost and aid requirements help you understand the money side before enrollment.', why: 'Knowing estimated costs, deposits, and required forms makes later decisions easier.', next: 'Review the requirements and write down anything you need help understanding.', toolId: 'cost-aid-requirements', icon: BookOpen },
    ],
    accepted_student: [
      { id: 'acc-status', label: 'Check My Application Status', category: 'Enrollment', description: 'Track enrollment steps and missing documents', what: 'Application Status continues to matter after acceptance because it can show enrollment steps and missing items.', why: 'Small missing items can block later setup, housing, or registration tasks.', next: 'Open it first and clear any required items you see.', toolId: 'application-status', icon: ClipboardCheck, urgency: 'high' },
      { id: 'acc-aid', label: 'Review & Accept Financial Aid Offer', category: 'Money', description: 'Accept or decline your awards', what: 'Your financial aid offer shows the aid Alfred State can apply to your costs.', why: 'Some awards may need a decision before they can be applied.', next: 'Open your offer, review each award, and ask for help before declining anything you do not understand.', toolId: 'financial-aid-offer', icon: CreditCard, urgency: 'high' },
      { id: 'acc-bill', label: 'Pay Enrollment Deposit / Bill', category: 'Money', description: 'Check balance and payment options', what: 'Billing tools show balances, due dates, payment options, and deposit steps.', why: 'A balance or deposit can affect your ability to move forward.', next: 'Open billing and check whether there is an amount due or a required deposit.', toolId: 'pay-bill', icon: CreditCard, urgency: 'high' },
      { id: 'acc-housing', label: 'Apply for Housing', category: 'Campus life', description: 'Select room and meal plan', what: 'Housing selection is where residential students handle room and meal plan steps.', why: 'Housing and meal choices can have deadlines and may affect your first semester costs.', next: 'Open housing selection and check whether you need to complete an application.', toolId: 'erez-life', icon: Home, urgency: 'high' },
      { id: 'acc-email', label: 'Set Up My Alfred State Email', category: 'Accounts', description: 'Outlook email and Microsoft 365', what: 'Your Alfred State email is the main channel for official college messages.', why: 'Important notices about classes, billing, aid, and campus updates may go there.', next: 'Open email, confirm you can sign in, and check for unread setup messages.', toolId: 'email', icon: Mail },
      { id: 'acc-account', label: 'Learn Bannerweb / Student Account', category: 'Accounts', description: 'Records, billing, registration, and profile details', what: 'Bannerweb is the student records system behind your account, schedule, bill, and registration details.', why: 'You will return to it often, so learning the name now saves confusion later.', next: 'Open Bannerweb and look for your profile, holds, bill, and registration areas.', toolId: 'bannerweb', icon: ShieldCheck },
      { id: 'acc-learning', label: 'Learn My Learning', category: 'Classes', description: 'Online coursework and class materials', what: 'My Learning is where many courses post materials, assignments, announcements, and grades.', why: 'Once classes begin, this is one of the first places to check each day.', next: 'Open My Learning and confirm whether any courses or orientation materials are visible.', toolId: 'my-learning', icon: BookOpen },
      { id: 'acc-degreeworks', label: 'Learn DegreeWorks', category: 'Classes', description: 'Degree progress and requirements', what: 'DegreeWorks tracks how your courses apply to degree requirements.', why: 'It helps you understand what you have completed and what still remains.', next: 'Open DegreeWorks and scan the requirement sections without worrying about every detail yet.', toolId: 'degreeworks', icon: GraduationCap },
    ],
  }

  const intro = $derived(onboarding[role])
  const items = $derived(checklists[role] ?? [])
  const isEligible = $derived(role in checklists)
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
