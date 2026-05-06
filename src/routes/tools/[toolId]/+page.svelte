<script lang="ts">
  import { resolve } from '$app/paths'
  import { page } from '$app/stores'
  import { getAppState, roleLabels } from '$lib/app-state.svelte'
  import ListGroup from '$lib/components/ListGroup.svelte'
  import ToolHero from '$lib/features/tools/ToolHero.svelte'
  import ToolInfoRow from '$lib/features/tools/ToolInfoRow.svelte'
  import ToolLiveData from '$lib/features/tools/ToolLiveData.svelte'
  import ToolOnboardingGuide from '$lib/features/tools/ToolOnboardingGuide.svelte'
  import Icon from '$lib/components/shared/Icon.svelte'
  import { getToolOnboardingGuide } from '$lib/onboarding'
  import { ExternalLink, Clock, Users, Tag, Folder, Info, HelpCircle, Mail, AlertTriangle, ChevronRight, Wrench } from 'lucide-svelte'

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
</script>

{#if tool}
  <section class="mx-auto max-w-4xl space-y-8">
    <ToolHero
      {tool}
      onLaunch={() => app.launchTool(tool)}
    />

    {#if onboardingGuide && (app.currentRole === 'applicant' || app.currentRole === 'accepted_student')}
      <ToolOnboardingGuide guide={onboardingGuide} />
    {/if}

    <!-- Tags -->
    {#if tool.tags.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each tool.tags as tag (tag)}
          <a
            href={resolve('/browse')}
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
        <ListGroup divided={false}>
          <div class="flex items-start gap-4 px-6 py-5 sm:px-8">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link">
              <Info class="h-5 w-5" />
            </div>
            <p class="min-w-0 flex-1 text-sm leading-relaxed text-text">{tool.notes}</p>
          </div>
        </ListGroup>
      </div>
    {/if}

    <!-- Details list group -->
    <div>
      <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Details</p>
      <ListGroup>
        <ToolInfoRow icon={Folder} label="Category">
          <span class="block text-sm font-extrabold text-text">{app.categoryName(tool.categoryId)}</span>
        </ToolInfoRow>
        {#if showAudienceDetail}
          <ToolInfoRow icon={Users} label="Audience">
            <span class="block text-sm font-extrabold text-text">{tool.audienceRoles.map((role) => roleLabels[role]).join(', ')}</span>
          </ToolInfoRow>
        {/if}
        <ToolInfoRow icon={Clock} label="Status">
          <span class="block text-sm font-extrabold text-text">{tool.isActive ? 'Active' : 'Inactive'}</span>
        </ToolInfoRow>
      </ListGroup>
    </div>

    <!-- Support & Requirements list group -->
    {#if tool.helpUrl || tool.contactInfo || tool.requirements}
      <div>
        <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Support & Requirements</p>
        <ListGroup>
          {#if tool.requirements}
            <ToolInfoRow icon={Wrench} label="Requirements">
              <span class="block text-sm font-extrabold text-text">{tool.requirements}</span>
            </ToolInfoRow>
          {/if}
          {#if tool.helpUrl}
            <ToolInfoRow icon={HelpCircle} label="Help & Documentation" href={tool.helpUrl}>
              <span class="block text-sm font-extrabold text-link group-hover:underline">View help documentation</span>
              {#snippet action()}
                <ExternalLink class="h-4 w-4 shrink-0 text-text-soft transition duration-200 group-hover:translate-x-0.5" />
              {/snippet}
            </ToolInfoRow>
          {/if}
          {#if tool.contactInfo}
            <ToolInfoRow icon={Mail} label="Contact">
              <span class="block text-sm font-extrabold text-text">{tool.contactInfo}</span>
            </ToolInfoRow>
          {/if}
        </ListGroup>
      </div>
    {/if}

    <!-- Related Announcements -->
    {#if toolAnnouncements.length > 0}
      <div>
        <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Related Announcements</p>
        <div class="space-y-2">
          {#each toolAnnouncements as a (a.id)}
            <a
              href={a.url || (a.toolId ? resolve(`/tools/${a.toolId}`) : '#')}
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
          {#each relatedTools as rt (rt.id)}
            <a
              href={resolve(`/tools/${rt.id}`)}
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
