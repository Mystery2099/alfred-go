<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState, roleLabels, roles } from '$lib/app-state.svelte'
  import type { Role, Tool, UserPreference } from '$lib/types'
  import {
    Bell,
    CalendarClock,
    ChevronRight,
    CircleHelp,
    KeyRound,
    MonitorSmartphone,
    Radio,
    Settings,
    Shield,
    SlidersHorizontal,
    Star,
  } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import { isPushSupported, subscribeToPush, unsubscribeFromPush, getPushStatus } from '$lib/push-client'

  const app = getAppState()

  const favoriteTools = $derived(() => app.visibleTools.filter((tool) => app.favoriteIds.has(tool.id)))
  const featuredTools = $derived(() => app.visibleTools.filter((tool) => tool.isFeatured).slice(0, 4))

  const notificationOptions = [
    ['Academic deadlines', 'Withdrawal dates, final exam reminders, and registration windows.', CalendarClock],
    ['Campus service updates', 'Banner, DegreeWorks, printing, and network maintenance notices.', MonitorSmartphone],
    ['Financial aid tasks', 'Aid offers, billing reminders, scholarships, and required forms.', Bell],
    ['Favorite resource changes', 'Updates related to resources you have pinned.', Star],
  ] as const

  const securityItems = [
    ['Password protected login', 'Test accounts authenticate with PBKDF2 password hashes stored in SQLite.', KeyRound],
    ['HTTP-only session cookie', 'The browser session is owned by the server and is not stored in localStorage.', Shield],
    ['Role-limited admin tools', 'Tool and category management require an authenticated admin role on the server.', SlidersHorizontal],
  ] as const

  const helpItems = [
    ['IT Help Desk', 'Use the Help Desk resource for account, device, and campus technology support.'],
    ['Directory', 'Find faculty and staff contact information when you need a specific office.'],
    ['Feedback for AlfredGO', 'For the prototype, collect comments about missing links, confusing categories, and role visibility.'],
  ] as const

  function notificationEnabled(title: string): boolean {
    const settings = app.currentPreference?.notificationSettings
    if (!settings || !(title in settings)) return true
    return settings[title]
  }

  function resourcePreview(): Tool[] {
    const favorites = favoriteTools()
    return (favorites.length ? favorites : featuredTools()).slice(0, 4)
  }

  let triggerRefs = $state<Record<string, HTMLButtonElement | null>>({})
  let panelRefs = $state<Record<string, HTMLDivElement | null>>({})

  let pushSupported = $state(false)
  let pushSubscribed = $state(false)
  let pushLoading = $state(false)
  let pushError = $state('')

  $effect(() => {
    if (typeof window !== 'undefined') {
      pushSupported = isPushSupported()
      if (pushSupported) {
        getPushStatus().then((status) => {
          pushSubscribed = status.subscribed
        })
      }
    }
  })

  async function togglePush() {
    pushLoading = true
    pushError = ''
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush()
        pushSubscribed = false
      } else {
        await subscribeToPush()
        pushSubscribed = true
      }
    } catch (err: any) {
      pushError = err.message || 'Failed to update push subscription'
    } finally {
      pushLoading = false
    }
  }

  function openPanel(panel: string) {
    app.setOpenProfilePanel(panel)
    requestAnimationFrame(() => {
      const el = panelRefs[panel]
      if (el) {
        const focusable = el.querySelector<HTMLElement>('button, input, select, textarea, a[href]')
        focusable?.focus()
      }
    })
  }

  function closePanel() {
    const current = app.openProfilePanel
    app.setOpenProfilePanel(null)
    if (current && triggerRefs[current]) {
      triggerRefs[current]?.focus()
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && app.openProfilePanel) {
      event.preventDefault()
      closePanel()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="mx-auto max-w-6xl space-y-5">
  <div>
    <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-link">Account controls</p>
    <SectionTitle>Settings</SectionTitle>
  </div>

  <div class="overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border">
    <div>
      <button
        class="profile-row"
        bind:this={triggerRefs['dashboard']}
        onclick={() => app.openProfilePanel === 'dashboard' ? closePanel() : openPanel('dashboard')}
        aria-expanded={app.openProfilePanel === 'dashboard'}
      >
        <span class="profile-icon tone-0"><Settings class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>Dashboard Settings</b>
          <small>Theme, role view, and quick access behavior</small>
        </span>
        <ChevronRight class="h-5 w-5 text-text-soft transition {app.openProfilePanel === 'dashboard' ? 'rotate-90' : ''}" />
      </button>
      {#if app.openProfilePanel === 'dashboard'}
        <div class="px-4 pb-4 sm:px-16" bind:this={panelRefs['dashboard']}>
          <div class="grid gap-4 lg:grid-cols-2">
            <div class="card p-5">
              <p class="text-sm font-extrabold text-link">Theme</p>
              <div class="mt-3 grid grid-cols-3 gap-2">
                {#each ['system', 'light', 'dark'] as theme}
                  <form method="POST" action="?/savePreference" use:enhance>
                    <input type="hidden" name="theme" value={theme} />
                    <button class="segmented {app.currentPreference?.theme === theme ? 'active' : ''}">
                      {theme}
                    </button>
                  </form>
                {/each}
              </div>
              <p class="mt-3 text-sm text-text-muted">System follows your device preference. Light and dark override it for this account.</p>
            </div>
            <div class="card p-5">
              <p class="text-sm font-extrabold text-link">Preferred role view</p>
              <form method="POST" action="?/savePreference" use:enhance>
              <select
                name="preferredRoleView"
                class="control mt-3 w-full"
                value={app.effectiveRole}
                onchange={(event) => event.currentTarget.form?.requestSubmit()}
              >
                {#each roles as role}
                  <option value={role}>{roleLabels[role]}</option>
                {/each}
              </select>
              </form>
              <p class="mt-3 text-sm text-text-muted">Use this to preview resources for another campus role without changing the signed-in account.</p>
            </div>
          </div>
          <div class="mt-4 rounded-xl border border-border bg-muted p-4">
            <p class="text-sm font-extrabold text-link">Quick access preview</p>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              {#each resourcePreview() as tool}
                <div class="rounded-lg bg-surface px-3 py-2 ring-1 ring-border">
                  <p class="truncate text-sm font-extrabold">{tool.name}</p>
                  <p class="truncate text-xs text-text-muted">{tool.description}</p>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="border-t border-border">
      <button
        class="profile-row"
        bind:this={triggerRefs['notifications']}
        onclick={() => app.openProfilePanel === 'notifications' ? closePanel() : openPanel('notifications')}
        aria-expanded={app.openProfilePanel === 'notifications'}
      >
        <span class="profile-icon tone-1"><Bell class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>Notifications</b>
          <small>Academic, financial, and campus alerts</small>
        </span>
        <ChevronRight class="h-5 w-5 text-text-soft transition {app.openProfilePanel === 'notifications' ? 'rotate-90' : ''}" />
      </button>
      {#if app.openProfilePanel === 'notifications'}
        <div class="px-4 pb-4 sm:px-16" bind:this={panelRefs['notifications']}>
          {#if pushSupported}
            <div class="mb-4 rounded-xl border border-border bg-surface p-4">
              <div class="flex items-start gap-3">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-selected text-link"><Radio class="h-5 w-5" /></span>
                <span class="min-w-0 flex-1">
                  <span class="block font-extrabold text-link">Browser push notifications</span>
                  <span class="mt-1 block text-sm leading-6 text-text-muted">Get real-time alerts on your phone or computer even when AlfredGO is closed.</span>
                </span>
                <button
                  onclick={togglePush}
                  disabled={pushLoading}
                  class="mt-1 h-6 w-10 rounded-full p-0.5 transition {pushSubscribed ? 'bg-campus-blue' : 'bg-border'} disabled:opacity-50"
                  aria-pressed={pushSubscribed}
                  aria-label={pushSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
                >
                  <span class="block h-5 w-5 rounded-full bg-white transition {pushSubscribed ? 'translate-x-4' : ''}"></span>
                </button>
              </div>
              {#if pushError}
                <p class="mt-2 text-sm text-red-600 dark:text-red-400">{pushError}</p>
              {/if}
            </div>
          {:else}
            <div class="mb-4 rounded-xl border border-border bg-surface p-4">
              <p class="text-sm text-text-muted">Push notifications are not supported in this browser. Install AlfredGO as a PWA for the best notification experience.</p>
            </div>
          {/if}

          <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
            {#each notificationOptions as [title, body, ItemIcon]}
              <form method="POST" action="?/savePreference" use:enhance>
                <input type="hidden" name="notificationSettings" value={JSON.stringify({
                  ...(app.currentPreference?.notificationSettings || {}),
                  [title]: !notificationEnabled(title)
                })} />
                <button
                  type="submit"
                  class="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-muted"
                >
                  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-selected text-link"><ItemIcon class="h-5 w-5" /></span>
                  <span class="min-w-0 flex-1">
                    <span class="block font-extrabold text-link">{title}</span>
                    <span class="mt-1 block text-sm leading-6 text-text-muted">{body}</span>
                  </span>
                  <span class="mt-1 h-6 w-10 rounded-full p-0.5 transition {notificationEnabled(title) ? 'bg-campus-blue' : 'bg-border'}">
                    <span class="block h-5 w-5 rounded-full bg-white transition {notificationEnabled(title) ? 'translate-x-4' : ''}"></span>
                  </span>
                </button>
              </form>
            {/each}
          </div>
          <p class="mt-4 text-sm text-text-muted">Notification preferences are saved to your account.</p>
        </div>
      {/if}
    </div>

    <div class="border-t border-border">
      <button
        class="profile-row"
        bind:this={triggerRefs['privacy']}
        onclick={() => app.openProfilePanel === 'privacy' ? closePanel() : openPanel('privacy')}
        aria-expanded={app.openProfilePanel === 'privacy'}
      >
        <span class="profile-icon tone-2"><Shield class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>Privacy & Security</b>
          <small>Session, password, and access protections</small>
        </span>
        <ChevronRight class="h-5 w-5 text-text-soft transition {app.openProfilePanel === 'privacy' ? 'rotate-90' : ''}" />
      </button>
      {#if app.openProfilePanel === 'privacy'}
        <div class="px-4 pb-4 sm:px-16" bind:this={panelRefs['privacy']}>
          <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
            {#each securityItems as [title, body, ItemIcon]}
              <div class="flex items-start gap-4 px-5 py-4">
                <span class="profile-icon tone-0 shrink-0"><ItemIcon class="h-5 w-5" /></span>
                <div class="min-w-0 flex-1">
                  <p class="font-extrabold text-link">{title}</p>
                  <p class="mt-1 text-sm leading-6 text-text-muted">{body}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <div class="border-t border-border">
      <button
        class="profile-row"
        bind:this={triggerRefs['help']}
        onclick={() => app.openProfilePanel === 'help' ? closePanel() : openPanel('help')}
        aria-expanded={app.openProfilePanel === 'help'}
      >
        <span class="profile-icon tone-3"><CircleHelp class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>Help & Feedback</b>
          <small>Support paths and prototype notes</small>
        </span>
        <ChevronRight class="h-5 w-5 text-text-soft transition {app.openProfilePanel === 'help' ? 'rotate-90' : ''}" />
      </button>
      {#if app.openProfilePanel === 'help'}
        <div class="px-4 pb-4 sm:px-16" bind:this={panelRefs['help']}>
          <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
            {#each helpItems as [title, body]}
              <div class="px-5 py-4">
                <p class="font-extrabold text-link">{title}</p>
                <p class="mt-1 text-sm leading-6 text-text-muted">{body}</p>
              </div>
            {/each}
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="tag">Prototype</span>
            <span class="tag">SQLite auth</span>
            <span class="tag">Role-based resources</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
