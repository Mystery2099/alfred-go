<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import { getAppState, roleLabels } from '$lib/app-state.svelte'
  import Icon from '$lib/components/shared/Icon.svelte'
  import { ExternalLink, Heart, Share2, Clock, Users, Tag, Folder, Info, HelpCircle, Mail, MapPin, AlertTriangle, CheckCircle2, XCircle, MinusCircle, ChevronRight, Wrench, BookOpen, CreditCard, Wallet, Inbox, Utensils, Home, LifeBuoy, Star, FileText, CalendarDays, Bell, HardDrive } from 'lucide-svelte'

  const app = getAppState()
  const toolId = $derived($page.params.toolId)
  const tool = $derived(app.visibleTools.find((item) => item.id === toolId))

  const relatedTools = $derived.by(() => {
    if (!tool || !app.data) return []
    return app.data.tools
      .filter((t) => t.id !== tool.id && t.categoryId === tool.categoryId && t.isActive && app.roleCanSeeTool(app.effectiveRole, t))
      .slice(0, 4)
  })

  const toolAnnouncements = $derived.by(() => {
    if (!tool || !app.data) return []
    return app.data.announcements.filter((a) => a.toolId === tool.id && a.isActive).slice(0, 3)
  })

  const showAudienceDetail = $derived(app.currentRole === 'staff' || app.currentRole === 'admin')
  let shareStatus = $state<'idle' | 'copying' | 'shared' | 'copied' | 'failed'>('idle')
  let shareStatusTimeout: ReturnType<typeof setTimeout> | undefined

  function setShareStatus(status: typeof shareStatus) {
    shareStatus = status
    if (shareStatusTimeout) clearTimeout(shareStatusTimeout)
    if (status !== 'idle') {
      shareStatusTimeout = setTimeout(() => {
        shareStatus = 'idle'
      }, 2500)
    }
  }

  function statusIcon(status?: string | null) {
    if (status === 'online') return CheckCircle2
    if (status === 'maintenance') return AlertTriangle
    if (status === 'degraded') return MinusCircle
    if (status === 'offline') return XCircle
    return null
  }

  function statusColor(status?: string | null) {
    if (status === 'online') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30'
    if (status === 'maintenance') return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
    if (status === 'degraded') return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
    if (status === 'offline') return 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30'
    return 'text-text-muted bg-muted'
  }

  async function copyToolLink(url: string) {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      if (navigator.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard timed out')), 1000)),
        ])
        return
      }

      const copied = document.execCommand('copy')
      if (!copied) {
        throw new Error('Copy failed')
      }
    } catch {
      const copied = document.execCommand('copy')
      if (!copied) {
        throw new Error('Copy failed')
      }
    } finally {
      document.body.removeChild(textarea)
    }
  }

  async function shareTool() {
    if (!tool) return
    setShareStatus('copying')
    const shareData = { title: tool.name, text: tool.description, url: window.location.href }
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData)
        setShareStatus('shared')
        return
      }

      await copyToolLink(shareData.url)
      setShareStatus('copied')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareStatus('failed')
    }
  }
</script>

{#if tool}
  <section class="mx-auto max-w-4xl space-y-8">
    <!-- Hero -->
    <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
      <div class="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-campus-blue text-white shadow-sm">
        <Icon name={tool.icon || 'Grid2X2'} class="h-10 w-10" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{tool.name}</h1>
          {#if tool.status}
            {@const SIcon = statusIcon(tool.status)}
            <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider {statusColor(tool.status)}">
              {#if SIcon}<SIcon class="h-3.5 w-3.5" />{/if}
              {tool.status}
            </span>
          {/if}
        </div>
        <p class="mt-2 text-base leading-relaxed text-text-muted">{tool.description}</p>

        <!-- Actions -->
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-campus-blue px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition duration-150 hover:bg-campus-darkBlue active:scale-[0.97]"
            onclick={() => app.launchTool(tool)}
          >
            <ExternalLink class="h-4 w-4" />
            Launch
          </button>

          <form method="POST" action="?/toggleFavorite" use:enhance={() => {
            app.optimisticToggleFavorite(tool.id)
            return async ({ result }) => {
              if (result.type === 'failure') app.optimisticToggleFavorite(tool.id)
            }
          }} class="inline-flex">
            <input type="hidden" name="toolId" value={tool.id} />
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-extrabold text-link transition duration-150 hover:bg-muted active:scale-[0.97]"
            >
              <Heart class="h-4 w-4 {app.isFavorite(tool.id) ? 'fill-campus-gold text-campus-gold' : ''}" />
              {app.isFavorite(tool.id) ? 'Saved' : 'Save'}
            </button>
          </form>

          <button
            type="button"
            aria-live="polite"
            class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-extrabold text-link transition duration-150 hover:bg-muted active:scale-[0.97]"
            onclick={() => { void shareTool() }}
          >
            <Share2 class="h-4 w-4" />
            {#if shareStatus === 'copying'}
              Copying...
            {:else if shareStatus === 'copied'}
              Link copied
            {:else if shareStatus === 'shared'}
              Shared
            {:else if shareStatus === 'failed'}
              Copy failed
            {:else}
              Share
            {/if}
          </button>
        </div>
      </div>
    </div>

    <!-- Tags -->
    {#if tool.tags.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each tool.tags as tag}
          <a
            href="/browse"
            onclick={() => app.setTagFilter(tag)}
            class="inline-flex items-center gap-1.5 rounded-lg bg-surface px-3.5 py-2 text-xs font-extrabold text-text-muted shadow-sm ring-1 ring-border/60 transition hover:bg-muted hover:text-link"
          >
            <Tag class="h-3.5 w-3.5" />
            {tag}
          </a>
        {/each}
      </div>
    {/if}

    <!-- Live Data / At a Glance -->
    {#if tool.liveData && Object.keys(tool.liveData).length > 0}
      {@const ld = tool.liveData}
      {@const hasExplicit = ld.currentBalance !== undefined || ld.unreadCount !== undefined || ld.degreeProgress !== undefined || ld.courses || ld.breakdown || ld.nextClass || ld.recentGrades || ld.openTickets !== undefined || ld.diningDollarsRemaining !== undefined || ld.currentRoom || ld.printBalance !== undefined || ld.campusAlertLevel || ld.registrationWindow || ld.flags || ld.upcomingAssignments || ld.recentEmails || ld.locations || ld.paymentHistory || ld.tickets || ld.quickLinks || ld.storageUsed || ld.holds !== undefined || ld.roommates || ld.applicationStatus || ld.checklistItems || ld.nextSteps}
      <div>
        <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">At a Glance</p>
        <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
          <div class="px-6 py-5 sm:px-8">
            <!-- Quick stats row -->
            {#if ld.currentGPA || ld.gpa || ld.semesterGPA || ld.enrolledCourses !== undefined || ld.creditsEnrolled !== undefined || ld.plannedCourses !== undefined || ld.classesToday !== undefined}
              <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {#if ld.currentGPA || ld.gpa}
                  <div class="rounded-xl bg-muted px-4 py-3 text-center">
                    <span class="block text-2xl font-extrabold text-text">{ld.currentGPA || ld.gpa}</span>
                    <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">GPA</span>
                  </div>
                {/if}
                {#if ld.semesterGPA}
                  <div class="rounded-xl bg-muted px-4 py-3 text-center">
                    <span class="block text-2xl font-extrabold text-text">{ld.semesterGPA}</span>
                    <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">This Term</span>
                  </div>
                {/if}
                {#if ld.enrolledCourses !== undefined}
                  <div class="rounded-xl bg-muted px-4 py-3 text-center">
                    <span class="block text-2xl font-extrabold text-text">{ld.enrolledCourses}</span>
                    <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Courses</span>
                  </div>
                {/if}
                {#if ld.creditsEnrolled !== undefined}
                  <div class="rounded-xl bg-muted px-4 py-3 text-center">
                    <span class="block text-2xl font-extrabold text-text">{ld.creditsEnrolled}</span>
                    <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Credits</span>
                  </div>
                {/if}
                {#if ld.plannedCourses !== undefined}
                  <div class="rounded-xl bg-muted px-4 py-3 text-center">
                    <span class="block text-2xl font-extrabold text-text">{ld.plannedCourses}</span>
                    <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Planned</span>
                  </div>
                {/if}
                {#if ld.classesToday !== undefined}
                  <div class="rounded-xl bg-muted px-4 py-3 text-center">
                    <span class="block text-2xl font-extrabold text-text">{ld.classesToday}</span>
                    <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Today</span>
                  </div>
                {/if}
              </div>
            {/if}

            {#if ld.currentBalance !== undefined}
              <div class="mb-4 flex items-baseline justify-between">
                <span class="text-sm text-text-muted">Current Balance</span>
                <span class="text-2xl font-extrabold text-text">{ld.currentBalance}</span>
              </div>
              {#if ld.dueDate}
                <div class="mb-4 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                  <span class="text-sm font-bold text-amber-700 dark:text-amber-300">Due Date</span>
                  <span class="text-sm font-extrabold text-amber-800 dark:text-amber-200">{ld.dueDate}</span>
                </div>
              {/if}
            {/if}

            {#if ld.unreadCount !== undefined}
              <div class="mb-4 flex items-baseline justify-between">
                <span class="text-sm text-text-muted">Unread Messages</span>
                <span class="text-2xl font-extrabold text-text">{ld.unreadCount}</span>
              </div>
            {/if}

            {#if ld.degreeProgress !== undefined}
              <div class="mb-4">
                <div class="mb-2 flex items-baseline justify-between">
                  <span class="text-sm text-text-muted">Degree Progress</span>
                  <span class="text-2xl font-extrabold text-text">{ld.degreeProgress}%</span>
                </div>
                <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div class="h-full rounded-full bg-campus-blue transition-all" style="width: {ld.degreeProgress}%"></div>
                </div>
                {#if ld.creditsEarned && ld.creditsRequired}
                  <p class="mt-2 text-xs text-text-muted">{ld.creditsEarned} of {ld.creditsRequired} credits earned</p>
                {/if}
              </div>
            {/if}

            {#if ld.storageUsed && ld.storageTotal}
              {@const usedNum = parseFloat(ld.storageUsed)}
              {@const totalNum = parseFloat(ld.storageTotal)}
              {@const pct = totalNum > 0 ? Math.round((usedNum / totalNum) * 100) : 0}
              <div class="mb-4">
                <div class="mb-2 flex items-baseline justify-between">
                  <span class="text-sm text-text-muted">Storage Used</span>
                  <span class="text-sm font-extrabold text-text">{ld.storageUsed} / {ld.storageTotal}</span>
                </div>
                <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div class="h-full rounded-full bg-campus-blue transition-all" style="width: {pct}%"></div>
                </div>
              </div>
            {/if}

            {#if ld.courses}
              <div class="mb-2 space-y-2">
                {#each ld.courses as course}
                  <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <div class="min-w-0 flex-1">
                      <span class="block text-sm font-extrabold text-text">{course.code}</span>
                      <span class="block text-xs text-text-muted">{course.name}{#if course.instructor} · {course.instructor}{/if}{#if course.credits} · {course.credits} cr{/if}</span>
                    </div>
                    <span class="shrink-0 text-sm font-extrabold text-campus-blue">{course.grade}</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ld.upcomingAssignments && Array.isArray(ld.upcomingAssignments)}
              <div class="mb-2 space-y-2">
                {#each ld.upcomingAssignments as a}
                  <div class="flex items-start justify-between gap-4 rounded-xl bg-muted px-4 py-3">
                    <div class="min-w-0 flex-1">
                      <span class="block text-sm font-extrabold text-text">{a.name}</span>
                      <span class="block text-xs text-text-muted">{a.course} · Due {a.due}</span>
                    </div>
                    <span class="shrink-0 rounded-full bg-campus-blue/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-campus-blue">{a.type}</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ld.recentGrades}
              <div class="mb-2 space-y-2">
                {#each ld.recentGrades as g}
                  <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <div class="min-w-0 flex-1">
                      <span class="block text-sm font-bold text-text">{g.course}</span>
                      <span class="block text-xs text-text-muted">{g.assignment}</span>
                    </div>
                    <span class="shrink-0 text-sm font-extrabold text-campus-blue">{g.grade}</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ld.recentEmails && Array.isArray(ld.recentEmails)}
              <div class="mb-2 space-y-2">
                {#each ld.recentEmails as e}
                  <div class="flex items-start gap-3 rounded-xl bg-muted px-4 py-3">
                    <div class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg {e.unread ? 'bg-campus-blue text-white' : 'bg-surface text-text-soft ring-1 ring-border/60'}">
                      <Mail class="h-4 w-4" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="block text-sm font-bold text-text">{e.sender}</span>
                        {#if e.unread}<span class="h-2 w-2 shrink-0 rounded-full bg-campus-blue"></span>{/if}
                      </div>
                      <span class="block text-xs font-extrabold text-text">{e.subject}</span>
                      <span class="block truncate text-xs text-text-muted">{e.preview}</span>
                    </div>
                    <span class="shrink-0 text-xs text-text-soft">{e.time}</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ld.breakdown}
              <div class="mb-2 space-y-2">
                {#each ld.breakdown as item}
                  <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <div class="min-w-0 flex-1">
                      <span class="block text-sm font-bold text-text">{item.type}</span>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                      <span class="text-sm font-extrabold text-text">{item.amount}</span>
                      <span class="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider {item.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : item.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-muted text-text-muted'}">{item.status}</span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ld.paymentHistory && Array.isArray(ld.paymentHistory)}
              <div class="mb-2 space-y-2">
                {#each ld.paymentHistory as p}
                  <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <div class="min-w-0 flex-1">
                      <span class="block text-sm font-bold text-text">{p.date}</span>
                      <span class="block text-xs text-text-muted">{p.method}</span>
                    </div>
                    <span class="shrink-0 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{p.amount}</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ld.tickets && Array.isArray(ld.tickets)}
              <div class="mb-2 space-y-2">
                {#each ld.tickets as t}
                  <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <div class="min-w-0 flex-1">
                      <span class="block text-sm font-bold text-text">{t.title}</span>
                      <span class="block text-xs text-text-muted">{t.category} · {t.date}</span>
                    </div>
                    <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider {t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : t.status === 'In Progress' ? 'bg-campus-blue/10 text-campus-blue' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}">{t.status}</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ld.locations && Array.isArray(ld.locations)}
              <div class="mb-2 space-y-2">
                {#each ld.locations as loc}
                  <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <div class="min-w-0 flex-1">
                      <span class="block text-sm font-bold text-text">{loc.name}</span>
                      <span class="block text-xs text-text-muted">{loc.hours}</span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span class="h-2 w-2 rounded-full {loc.status === 'Open' ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                      <span class="text-xs font-extrabold {loc.status === 'Open' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">{loc.status}</span>
                      <span class="text-xs text-text-soft">{loc.untilClose}</span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ld.nextClass}
              <div class="mb-2 rounded-xl bg-muted px-4 py-3">
                <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Next Class</span>
                <span class="mt-1 block text-lg font-extrabold text-text">{ld.nextClass.course}</span>
                <div class="mt-1 flex flex-wrap gap-x-4 text-sm text-text-muted">
                  <span class="inline-flex items-center gap-1"><Clock class="h-3.5 w-3.5" /> {ld.nextClass.time}</span>
                  <span class="inline-flex items-center gap-1"><MapPin class="h-3.5 w-3.5" /> {ld.nextClass.location}</span>
                </div>
              </div>
            {/if}

            {#if ld.openTickets !== undefined}
              <div class="mb-3 flex items-baseline justify-between">
                <span class="text-sm text-text-muted">Open Tickets</span>
                <span class="text-2xl font-extrabold text-text">{ld.openTickets}</span>
              </div>
              {#if ld.lastTicket}
                <div class="mb-2 rounded-xl bg-muted px-4 py-3">
                  <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Latest Ticket</span>
                  <span class="mt-1 block text-sm font-bold text-text">{ld.lastTicket}</span>
                </div>
              {/if}
            {/if}

            {#if ld.diningDollarsRemaining !== undefined}
              <div class="mb-4 flex items-baseline justify-between">
                <span class="text-sm text-text-muted">Dining Dollars</span>
                <span class="text-2xl font-extrabold text-text">{ld.diningDollarsRemaining}</span>
              </div>
              {#if ld.diningDollarsSpentThisMonth}
                <p class="mb-4 text-xs text-text-muted">{ld.diningDollarsSpentThisMonth} spent this month</p>
              {/if}
            {/if}

            {#if ld.currentRoom}
              <div class="mb-2 rounded-xl bg-muted px-4 py-3">
                <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Current Room</span>
                <span class="mt-1 block text-lg font-extrabold text-text">{ld.currentRoom}</span>
                <span class="block text-sm text-text-muted">{ld.roomType} · {ld.mealPlan}</span>
                {#if ld.roommates && Array.isArray(ld.roommates)}
                  <span class="block text-xs text-text-muted">Roommates: {ld.roommates.join(', ')}</span>
                {/if}
              </div>
            {/if}

            {#if ld.printBalance !== undefined}
              <div class="mb-4 flex items-baseline justify-between">
                <span class="text-sm text-text-muted">Print Balance</span>
                <span class="text-2xl font-extrabold text-text">{ld.printBalance}</span>
              </div>
              {#if ld.pagesPrinted !== undefined}
                <p class="text-xs text-text-muted">{ld.pagesPrinted} pages printed this semester</p>
              {/if}
            {/if}

            {#if ld.campusAlertLevel}
              <div class="mb-2 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <span class="text-sm font-bold text-text">Campus Alert Level</span>
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{ld.campusAlertLevel}</span>
              </div>
            {/if}

            {#if ld.registrationWindow}
              <div class="mb-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                <span class="block text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Registration Opens</span>
                <span class="mt-1 block text-lg font-extrabold text-amber-800 dark:text-amber-200">{ld.registrationWindow}</span>
                <div class="mt-2 flex flex-wrap gap-2 text-xs text-amber-700 dark:text-amber-300">
                  {#if ld.advisorHold}<span>Advisor Hold: {ld.advisorHold}</span>{/if}
                  {#if ld.balanceHold}<span>Balance Hold: {ld.balanceHold}</span>{/if}
                </div>
              </div>
            {/if}

            {#if ld.holds !== undefined}
              {#if Array.isArray(ld.holds) && ld.holds.length > 0}
                <div class="mb-2 space-y-2">
                  {#each ld.holds as hold}
                    <div class="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                      <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span class="text-sm font-bold text-amber-800 dark:text-amber-200">{hold}</span>
                    </div>
                  {/each}
                </div>
              {:else if typeof ld.holds === 'number' && ld.holds > 0}
                <div class="mb-3 flex items-baseline justify-between">
                  <span class="text-sm text-text-muted">Holds</span>
                  <span class="text-2xl font-extrabold text-text">{ld.holds}</span>
                </div>
              {:else if typeof ld.holds === 'number' && ld.holds === 0}
                <div class="mb-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                  <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span class="text-sm font-bold text-emerald-800 dark:text-emerald-200">No holds on your account</span>
                </div>
              {/if}
            {/if}

            {#if ld.flags && Array.isArray(ld.flags)}
              <div class="mb-2 space-y-2">
                {#each ld.flags as flag}
                  <div class="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                    <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span class="text-sm font-bold text-amber-800 dark:text-amber-200">{flag}</span>
                  </div>
                {/each}
              </div>
            {/if}

            <!-- Quick links -->
            {#if ld.quickLinks && Array.isArray(ld.quickLinks)}
              <div class="mt-4 flex flex-wrap gap-2">
                {#each ld.quickLinks as link}
                  <span class="inline-flex items-center gap-1.5 rounded-lg bg-campus-blue/10 px-3 py-1.5 text-xs font-extrabold text-campus-blue">{link}</span>
                {/each}
              </div>
            {/if}

            <!-- Generic scalar fallback -->
            {#if Object.entries(ld).filter(([k, v]) => !['currentBalance','dueDate','unreadCount','degreeProgress','creditsEarned','creditsRequired','storageUsed','storageTotal','courses','upcomingAssignments','recentGrades','recentEmails','breakdown','paymentHistory','tickets','locations','nextClass','openTickets','lastTicket','diningDollarsRemaining','diningDollarsSpentThisMonth','currentRoom','roomType','mealPlan','roommates','printBalance','pagesPrinted','campusAlertLevel','registrationWindow','advisorHold','balanceHold','holds','flags','quickLinks','currentGPA','gpa','semesterGPA','enrolledCourses','creditsEnrolled','plannedCourses','classesToday'].includes(k) && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')).length > 0}
              <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {#each Object.entries(ld).filter(([k, v]) => !['currentBalance','dueDate','unreadCount','degreeProgress','creditsEarned','creditsRequired','storageUsed','storageTotal','courses','upcomingAssignments','recentGrades','recentEmails','breakdown','paymentHistory','tickets','locations','nextClass','openTickets','lastTicket','diningDollarsRemaining','diningDollarsSpentThisMonth','currentRoom','roomType','mealPlan','roommates','printBalance','pagesPrinted','campusAlertLevel','registrationWindow','advisorHold','balanceHold','holds','flags','quickLinks','currentGPA','gpa','semesterGPA','enrolledCourses','creditsEnrolled','plannedCourses','classesToday'].includes(k) && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) as [key, value]}
                  <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <span class="text-sm text-text-muted">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
                    <span class="text-sm font-extrabold text-text">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <!-- Notes -->
    {#if tool.notes}
      <div>
        <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Important Info</p>
        <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
          <div class="flex items-start gap-4 px-6 py-5 sm:px-8">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
              <Info class="h-5 w-5" />
            </div>
            <p class="min-w-0 flex-1 text-sm leading-relaxed text-text">{tool.notes}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Details list group -->
    <div>
      <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Details</p>
      <div class="divide-y divide-border overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
        <div class="flex items-center gap-4 px-6 py-4 sm:px-8">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
            <Folder class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Category</span>
            <span class="block text-sm font-extrabold text-text">{app.categoryName(tool.categoryId)}</span>
          </div>
        </div>
        {#if showAudienceDetail}
          <div class="flex items-center gap-4 px-6 py-4 sm:px-8">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
              <Users class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Audience</span>
              <span class="block text-sm font-extrabold text-text">{tool.audienceRoles.map((role) => roleLabels[role]).join(', ')}</span>
            </div>
          </div>
        {/if}
        <div class="flex items-center gap-4 px-6 py-4 sm:px-8">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
            <Clock class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Status</span>
            <span class="block text-sm font-extrabold text-text">{tool.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Support & Requirements list group -->
    {#if tool.helpUrl || tool.contactInfo || tool.requirements}
      <div>
        <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Support & Requirements</p>
        <div class="divide-y divide-border overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
          {#if tool.requirements}
            <div class="flex items-center gap-4 px-6 py-4 sm:px-8">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
                <Wrench class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Requirements</span>
                <span class="block text-sm font-extrabold text-text">{tool.requirements}</span>
              </div>
            </div>
          {/if}
          {#if tool.helpUrl}
            <a href={tool.helpUrl} target="_blank" rel="noopener noreferrer" class="group flex items-center gap-4 px-6 py-4 transition duration-200 ease-out hover:bg-muted active:scale-[0.995] sm:px-8">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link transition duration-200 group-hover:scale-105">
                <HelpCircle class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Help & Documentation</span>
                <span class="block text-sm font-extrabold text-link group-hover:underline">View help documentation</span>
              </div>
              <ExternalLink class="h-4 w-4 shrink-0 text-text-soft transition duration-200 group-hover:translate-x-0.5" />
            </a>
          {/if}
          {#if tool.contactInfo}
            <div class="flex items-center gap-4 px-6 py-4 sm:px-8">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
                <Mail class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Contact</span>
                <span class="block text-sm font-extrabold text-text">{tool.contactInfo}</span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Related Announcements -->
    {#if toolAnnouncements.length > 0}
      <div>
        <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Related Announcements</p>
        <div class="space-y-2">
          {#each toolAnnouncements as a}
            <a
              href={a.url || (a.toolId ? `/tools/${a.toolId}` : '#')}
              target={a.url ? '_blank' : undefined}
              rel={a.url ? 'noopener noreferrer' : undefined}
              class="group block rounded-2xl bg-surface px-5 py-4 shadow-sm ring-1 ring-border/60 transition duration-200 ease-out hover:bg-muted/60 active:scale-[0.995]"
            >
              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200 group-hover:scale-105 {a.tone === 'urgent' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : a.tone === 'deadline' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-muted text-link'}">
                  {#if a.tone === 'urgent'}<AlertTriangle class="h-4 w-4" />
                  {:else if a.tone === 'deadline'}<Clock class="h-4 w-4" />
                  {:else}<Info class="h-4 w-4" />{/if}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-text">{a.title}</p>
                  <p class="mt-0.5 text-xs text-text-muted line-clamp-2">{a.body}</p>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Related tools -->
    {#if relatedTools.length > 0}
      <div>
        <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">More in {app.categoryName(tool.categoryId)}</p>
        <div class="grid min-w-0 gap-3 sm:grid-cols-2">
          {#each relatedTools as rt}
            <a
              href="/tools/{rt.id}"
              class="group flex min-w-0 items-center gap-3 rounded-2xl bg-surface px-4 py-4 shadow-sm ring-1 ring-border/60 transition duration-200 ease-out hover:bg-muted/60 active:scale-[0.995] sm:gap-4 sm:px-5"
            >
              <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted text-link transition duration-200 group-hover:scale-105">
                <Icon name={rt.icon} class="h-6 w-6" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block truncate text-sm font-extrabold text-text">{rt.name}</span>
                <span class="block truncate text-xs text-text-muted">{rt.description}</span>
              </div>
              <ChevronRight class="h-5 w-5 shrink-0 text-text-soft transition duration-200 group-hover:translate-x-0.5 group-hover:text-link" />
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </section>
{:else}
  <div class="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
    <div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted">
      <ExternalLink class="h-8 w-8 text-text-soft" />
    </div>
    <h3 class="mt-4 text-xl font-extrabold text-text">Tool not found</h3>
    <p class="mt-2 text-sm text-text-muted">This resource may not exist, may be inactive, or may not be visible for your current role view.</p>
  </div>
{/if}
