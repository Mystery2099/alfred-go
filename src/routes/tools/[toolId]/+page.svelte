<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import { getAppState, roleLabels } from '$lib/app-state.svelte'
  import ToolLiveData from '$lib/features/tools/ToolLiveData.svelte'
  import ToolOnboardingGuide from '$lib/features/tools/ToolOnboardingGuide.svelte'
  import Icon from '$lib/components/shared/Icon.svelte'
  import { getToolOnboardingGuide } from '$lib/onboarding'
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
  const onboardingGuide = $derived.by(() => tool ? getToolOnboardingGuide(tool.id, tool.categoryId) : null)
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

    {#if onboardingGuide && (app.currentRole === 'applicant' || app.currentRole === 'accepted_student')}
      <ToolOnboardingGuide guide={onboardingGuide} />
    {/if}

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

    <ToolLiveData liveData={tool.liveData} />

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
