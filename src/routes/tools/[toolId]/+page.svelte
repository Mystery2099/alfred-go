<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import { getAppState, roleLabels } from '$lib/app-state.svelte'
  import Icon from '$lib/components/shared/Icon.svelte'
  import { ExternalLink, Heart, Share2, Clock, Users, Tag, Folder, Info, HelpCircle, Mail, Phone, MapPin, AlertTriangle, CheckCircle2, XCircle, MinusCircle, ChevronRight, Wrench } from 'lucide-svelte'

  const app = getAppState()
  const toolId = $derived($page.params.toolId)
  const tool = $derived(app.visibleTools.find((item) => item.id === toolId))

  const relatedTools = $derived(() => {
    if (!tool || !app.data) return []
    return app.data.tools
      .filter((t) => t.id !== tool.id && t.categoryId === tool.categoryId && t.isActive && app.roleCanSeeTool(app.effectiveRole, t))
      .slice(0, 4)
  })

  const toolAnnouncements = $derived(() => {
    if (!tool || !app.data) return []
    return app.data.announcements.filter((a) => a.toolId === tool.id && a.isActive).slice(0, 3)
  })

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

  async function shareTool() {
    if (!tool) return
    const shareData = { title: tool.name, text: tool.description, url: window.location.href }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* ignored */ }
    } else {
      try { await navigator.clipboard.writeText(window.location.href) } catch { /* ignored */ }
    }
  }
</script>

{#if tool}
  <section class="mx-auto max-w-3xl space-y-6">
    <!-- Hero -->
    <div class="relative overflow-hidden rounded-[28px] bg-surface shadow-sm ring-1 ring-border">
      <div class="relative bg-campus-blue/5 px-6 pb-8 pt-10 sm:px-10 sm:pt-12">
        <div class="absolute inset-0 opacity-30">
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-campus-blue/10 blur-2xl"></div>
          <div class="absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-campus-lightBlue/10 blur-2xl"></div>
        </div>

        <div class="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
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
          </div>
        </div>
      </div>

      <!-- Actions row -->
      <div class="flex flex-wrap items-center gap-3 border-t border-border px-6 py-4 sm:px-10">
        <button
          class="inline-flex items-center gap-2 rounded-full bg-campus-blue px-6 py-3 text-sm font-extrabold text-white shadow-sm transition duration-150 hover:bg-campus-darkBlue active:scale-[0.97]"
          onclick={() => app.launchTool(tool)}
        >
          <ExternalLink class="h-4 w-4" />
          Launch
        </button>

        <form method="POST" action="?/toggleFavorite" use:enhance class="inline-flex">
          <input type="hidden" name="toolId" value={tool.id} />
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-extrabold text-link transition duration-150 hover:bg-muted active:scale-[0.97]"
          >
            <Heart class="h-4 w-4 {app.isFavorite(tool.id) ? 'fill-campus-gold text-campus-gold' : ''}" />
            {app.isFavorite(tool.id) ? 'Saved' : 'Save'}
          </button>
        </form>

        <button
          class="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-extrabold text-link transition duration-150 hover:bg-muted active:scale-[0.97]"
          onclick={shareTool}
        >
          <Share2 class="h-4 w-4" />
          Share
        </button>
      </div>
    </div>

    <!-- Live Data / At a Glance -->
    {#if tool.liveData && Object.keys(tool.liveData).length > 0}
      <div class="overflow-hidden rounded-[28px] bg-surface shadow-sm ring-1 ring-border">
        <div class="border-b border-border px-6 py-4 sm:px-8">
          <h2 class="text-sm font-extrabold uppercase tracking-wider text-text-muted">At a Glance</h2>
        </div>
        <div class="px-6 py-5 sm:px-8">
          {#if tool.liveData.currentBalance !== undefined}
            <div class="mb-4 flex items-baseline justify-between">
              <span class="text-sm text-text-muted">Current Balance</span>
              <span class="text-2xl font-extrabold text-text">{tool.liveData.currentBalance}</span>
            </div>
            {#if tool.liveData.dueDate}
              <div class="mb-4 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                <span class="text-sm font-bold text-amber-700 dark:text-amber-300">Due Date</span>
                <span class="text-sm font-extrabold text-amber-800 dark:text-amber-200">{tool.liveData.dueDate}</span>
              </div>
            {/if}
          {/if}

          {#if tool.liveData.unreadCount !== undefined}
            <div class="mb-4 flex items-baseline justify-between">
              <span class="text-sm text-text-muted">Unread Messages</span>
              <span class="text-2xl font-extrabold text-text">{tool.liveData.unreadCount}</span>
            </div>
          {/if}

          {#if tool.liveData.degreeProgress !== undefined}
            <div class="mb-4">
              <div class="mb-2 flex items-baseline justify-between">
                <span class="text-sm text-text-muted">Degree Progress</span>
                <span class="text-2xl font-extrabold text-text">{tool.liveData.degreeProgress}%</span>
              </div>
              <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div class="h-full rounded-full bg-campus-blue transition-all" style="width: {tool.liveData.degreeProgress}%"></div>
              </div>
              {#if tool.liveData.creditsEarned && tool.liveData.creditsRequired}
                <p class="mt-2 text-xs text-text-muted">{tool.liveData.creditsEarned} of {tool.liveData.creditsRequired} credits earned</p>
              {/if}
            </div>
          {/if}

          {#if tool.liveData.courses}
            <div class="space-y-2">
              {#each tool.liveData.courses as course}
                <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                  <div class="min-w-0 flex-1">
                    <span class="block text-sm font-extrabold text-text">{course.code}</span>
                    <span class="block text-xs text-text-muted">{course.name}</span>
                  </div>
                  <span class="shrink-0 text-sm font-extrabold text-campus-blue">{course.grade}</span>
                </div>
              {/each}
            </div>
          {/if}

          {#if tool.liveData.breakdown}
            <div class="space-y-2">
              {#each tool.liveData.breakdown as item}
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

          {#if tool.liveData.nextClass}
            <div class="rounded-xl bg-muted px-4 py-3">
              <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Next Class</span>
              <span class="mt-1 block text-lg font-extrabold text-text">{tool.liveData.nextClass.course}</span>
              <div class="mt-1 flex flex-wrap gap-x-4 text-sm text-text-muted">
                <span class="inline-flex items-center gap-1"><Clock class="h-3.5 w-3.5" /> {tool.liveData.nextClass.time}</span>
                <span class="inline-flex items-center gap-1"><MapPin class="h-3.5 w-3.5" /> {tool.liveData.nextClass.location}</span>
              </div>
            </div>
          {/if}

          {#if tool.liveData.recentGrades}
            <div class="space-y-2">
              {#each tool.liveData.recentGrades as g}
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

          {#if tool.liveData.openTickets !== undefined}
            <div class="mb-3 flex items-baseline justify-between">
              <span class="text-sm text-text-muted">Open Tickets</span>
              <span class="text-2xl font-extrabold text-text">{tool.liveData.openTickets}</span>
            </div>
            {#if tool.liveData.lastTicket}
              <div class="rounded-xl bg-muted px-4 py-3">
                <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Latest Ticket</span>
                <span class="mt-1 block text-sm font-bold text-text">{tool.liveData.lastTicket}</span>
              </div>
            {/if}
          {/if}

          {#if tool.liveData.diningDollarsRemaining !== undefined}
            <div class="mb-4 flex items-baseline justify-between">
              <span class="text-sm text-text-muted">Dining Dollars</span>
              <span class="text-2xl font-extrabold text-text">{tool.liveData.diningDollarsRemaining}</span>
            </div>
          {/if}

          {#if tool.liveData.currentRoom}
            <div class="rounded-xl bg-muted px-4 py-3">
              <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Current Room</span>
              <span class="mt-1 block text-lg font-extrabold text-text">{tool.liveData.currentRoom}</span>
              <span class="block text-sm text-text-muted">{tool.liveData.roomType} · {tool.liveData.mealPlan}</span>
            </div>
          {/if}

          {#if tool.liveData.printBalance !== undefined}
            <div class="mb-4 flex items-baseline justify-between">
              <span class="text-sm text-text-muted">Print Balance</span>
              <span class="text-2xl font-extrabold text-text">{tool.liveData.printBalance}</span>
            </div>
            {#if tool.liveData.pagesPrinted !== undefined}
              <p class="text-xs text-text-muted">{tool.liveData.pagesPrinted} pages printed this semester</p>
            {/if}
          {/if}

          {#if tool.liveData.campusAlertLevel}
            <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
              <span class="text-sm font-bold text-text">Campus Alert Level</span>
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{tool.liveData.campusAlertLevel}</span>
            </div>
          {/if}

          {#if tool.liveData.registrationWindow}
            <div class="rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
              <span class="block text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Registration Opens</span>
              <span class="mt-1 block text-lg font-extrabold text-amber-800 dark:text-amber-200">{tool.liveData.registrationWindow}</span>
              <div class="mt-2 flex flex-wrap gap-2 text-xs text-amber-700 dark:text-amber-300">
                {#if tool.liveData.advisorHold}<span>Advisor Hold: {tool.liveData.advisorHold}</span>{/if}
                {#if tool.liveData.balanceHold}<span>Balance Hold: {tool.liveData.balanceHold}</span>{/if}
              </div>
            </div>
          {/if}

          {#if tool.liveData.flags && Array.isArray(tool.liveData.flags)}
            <div class="space-y-2">
              {#each tool.liveData.flags as flag}
                <div class="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                  <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span class="text-sm font-bold text-amber-800 dark:text-amber-200">{flag}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Tags -->
    {#if tool.tags.length > 0}
      <div class="flex flex-wrap gap-2 px-1">
        {#each tool.tags as tag}
          <a
            href="/search"
            onclick={() => app.setTagFilter(tag)}
            class="inline-flex items-center gap-1.5 rounded-lg bg-surface px-3.5 py-2 text-xs font-extrabold text-text-muted shadow-sm ring-1 ring-border/60 transition hover:bg-muted hover:text-link"
          >
            <Tag class="h-3.5 w-3.5" />
            {tag}
          </a>
        {/each}
      </div>
    {/if}

    <!-- Notes -->
    {#if tool.notes}
      <div class="overflow-hidden rounded-[28px] bg-surface shadow-sm ring-1 ring-border">
        <div class="border-b border-border px-6 py-4 sm:px-8">
          <h2 class="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-text-muted">
            <Info class="h-4 w-4" />
            Important Info
          </h2>
        </div>
        <div class="px-6 py-5 sm:px-8">
          <p class="text-sm leading-relaxed text-text">{tool.notes}</p>
        </div>
      </div>
    {/if}

    <!-- Contact & Support -->
    {#if tool.helpUrl || tool.contactInfo || tool.requirements}
      <div class="overflow-hidden rounded-[28px] bg-surface shadow-sm ring-1 ring-border">
        <div class="border-b border-border px-6 py-4 sm:px-8">
          <h2 class="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-text-muted">
            <HelpCircle class="h-4 w-4" />
            Support & Requirements
          </h2>
        </div>
        <div class="divide-y divide-border">
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

    <!-- Details -->
    <div class="overflow-hidden rounded-[28px] bg-surface shadow-sm ring-1 ring-border">
      <div class="border-b border-border px-6 py-4 sm:px-8">
        <h2 class="text-sm font-extrabold uppercase tracking-wider text-text-muted">Details</h2>
      </div>
      <div class="divide-y divide-border">
        <div class="flex items-center gap-4 px-6 py-4 sm:px-8">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
            <Folder class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Category</span>
            <span class="block text-sm font-extrabold text-text">{app.categoryName(tool.categoryId)}</span>
          </div>
        </div>
        <div class="flex items-center gap-4 px-6 py-4 sm:px-8">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
            <Users class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Audience</span>
            <span class="block text-sm font-extrabold text-text">{tool.audienceRoles.map((role) => roleLabels[role]).join(', ')}</span>
          </div>
        </div>
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

    <!-- Related Announcements -->
    {#if toolAnnouncements().length > 0}
      <div class="space-y-3">
        <p class="px-1 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Related Announcements</p>
        <div class="space-y-2">
          {#each toolAnnouncements() as a}
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
    {#if relatedTools().length > 0}
      <div class="space-y-3">
        <p class="px-1 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">More in {app.categoryName(tool.categoryId)}</p>
        <div class="grid gap-3 sm:grid-cols-2">
          {#each relatedTools() as rt}
            <a
              href="/tools/{rt.id}"
              class="group flex items-center gap-4 rounded-2xl bg-surface px-5 py-4 shadow-sm ring-1 ring-border/60 transition duration-200 ease-out hover:bg-muted/60 active:scale-[0.995]"
            >
              <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted text-link transition duration-200 group-hover:scale-105">
                <Icon name={rt.icon} class="h-6 w-6" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-sm font-extrabold text-text">{rt.name}</span>
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
