<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState, roleLabels, roles } from '$lib/app-state.svelte'
  import type { Activity, Tool } from '$lib/types'
  import {
    Accessibility,
    Bell,
    CalendarClock,
    ChevronRight,
    CircleHelp,
    Database,
    Download,
    Eye,
    Gauge,
    History,
    KeyRound,
    MonitorSmartphone,
    Moon,
    Palette,
    Radio,
    RotateCcw,
    Settings,
    Shield,
    SlidersHorizontal,
    Sparkles,
    Star,
    Sun,
    Trash2,
    Type,
    UserRound,
    XCircle,
  } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import { isPushSupported, subscribeToPush, unsubscribeFromPush, getPushStatus } from '$lib/push-client'

  const app = getAppState()

  let { data } = $props()
  const allActivities = $derived((data.activities || []) as Activity[])

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

  const accessibilityItems = [
    ['Reduced motion', 'Disable animations and transitions across the interface.', Gauge, 'reducedMotion'],
    ['High contrast', 'Increase border and text contrast for better readability.', Eye, 'highContrast'],
    ['Compact density', 'Reduce padding and spacing to show more content at once.', Type, 'compactDensity'],
  ] as const

  function notificationEnabled(title: string): boolean {
    const settings = app.currentPreference?.notificationSettings
    if (!settings || !(title in settings)) return true
    return settings[title]
  }

  function accessibilityEnabled(key: string): boolean {
    const settings = app.currentPreference?.accessibilitySettings
    if (!settings || !(key in settings)) return false
    return !!settings[key as keyof typeof settings]
  }

  function resourcePreview(): Tool[] {
    const favorites = favoriteTools()
    return (favorites.length ? favorites : featuredTools()).slice(0, 4)
  }

  function formatActivityType(type: string, toolName?: string | null) {
    const labels: Record<string, string> = {
      tool_launch: toolName ? `Launched ${toolName}` : 'Launched a tool',
      favorite: 'Favorited a resource',
      login: 'Signed in',
    }
    return labels[type] || type
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  let triggerRefs = $state<Record<string, HTMLButtonElement | null>>({})
  let panelRefs = $state<Record<string, HTMLDivElement | null>>({})

  let pushSupported = $state(false)
  let pushSubscribed = $state(false)
  let pushLoading = $state(false)
  let pushError = $state('')

  let passwordError = $state('')
  let passwordSuccess = $state('')
  let passwordLoading = $state(false)

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

  function handlePasswordEnhance() {
    passwordLoading = true
    passwordError = ''
    passwordSuccess = ''
    return async ({ result }: { result: any }) => {
      passwordLoading = false
      if (result.type === 'success' || result.type === 'redirect') {
        const data = result.data
        if (data?.ok === false) {
          passwordError = data.error || 'Failed to change password'
        } else {
          passwordSuccess = 'Password updated successfully'
          const form = document.getElementById('password-form') as HTMLFormElement | null
          form?.reset()
        }
      } else if (result.type === 'failure') {
        passwordError = result.data?.error || 'Failed to change password'
      }
    }
  }

  function enableAllNotifications() {
    const settings: Record<string, boolean> = {}
    notificationOptions.forEach(([title]) => { settings[title] = true })
    return JSON.stringify(settings)
  }

  function disableAllNotifications() {
    const settings: Record<string, boolean> = {}
    notificationOptions.forEach(([title]) => { settings[title] = false })
    return JSON.stringify(settings)
  }

  function handleResetPreferences() {
    if (!confirm('This will reset your theme, role view, notifications, and accessibility settings to their defaults. Continue?')) {
      return false
    }
  }

  function handleClearActivities() {
    if (!confirm('This will permanently delete your activity history. This cannot be undone. Continue?')) {
      return false
    }
  }

  function toggleAccessibilitySetting(key: string) {
    const current = app.currentPreference?.accessibilitySettings || {}
    const next = { ...current, [key]: !current[key as keyof typeof current] }
    return JSON.stringify(next)
  }

  function allNotificationsEnabled() {
    return notificationOptions.every(([title]) => notificationEnabled(title))
  }

  function allNotificationsDisabled() {
    return notificationOptions.every(([title]) => !notificationEnabled(title))
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="mx-auto max-w-6xl space-y-6">
  <div>
    <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-link">Account controls</p>
    <SectionTitle>Settings</SectionTitle>
  </div>

  <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
    <!-- Dashboard Settings -->
    <div>
      <button
        class="profile-row"
        bind:this={triggerRefs['dashboard']}
        onclick={() => app.openProfilePanel === 'dashboard' ? closePanel() : openPanel('dashboard')}
        aria-expanded={app.openProfilePanel === 'dashboard'}
      >
        <span class="profile-icon tone-0"><Palette class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>Dashboard Settings</b>
          <small>Theme, role view, accessibility, and quick access</small>
        </span>
        <ChevronRight class="h-5 w-5 text-text-soft transition {app.openProfilePanel === 'dashboard' ? 'rotate-90' : ''}" />
      </button>
      {#if app.openProfilePanel === 'dashboard'}
        <div class="px-4 pb-5 sm:px-16" bind:this={panelRefs['dashboard']}>
          <div class="grid gap-4 lg:grid-cols-2">
            <div class="card p-5">
              <div class="flex items-center gap-2">
                <Sun class="h-4 w-4 text-link" />
                <p class="text-sm font-extrabold text-link">Theme</p>
              </div>
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
              <div class="flex items-center gap-2">
                <UserRound class="h-4 w-4 text-link" />
                <p class="text-sm font-extrabold text-link">Preferred role view</p>
              </div>
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
              <p class="mt-3 text-sm text-text-muted">Preview resources for another campus role without changing your account.</p>
            </div>
          </div>

          <div class="mt-4 card p-5">
            <div class="flex items-center gap-2">
              <Accessibility class="h-4 w-4 text-link" />
              <p class="text-sm font-extrabold text-link">Accessibility</p>
            </div>
            <div class="mt-3 divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
              {#each accessibilityItems as [title, body, ItemIcon, key]}
                <form method="POST" action="?/savePreference" use:enhance>
                  <input type="hidden" name="accessibilitySettings" value={toggleAccessibilitySetting(key)} />
                  <button
                    type="submit"
                    class="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-muted"
                  >
                    <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-selected text-link"><ItemIcon class="h-5 w-5" /></span>
                    <span class="min-w-0 flex-1">
                      <span class="block font-extrabold text-link">{title}</span>
                      <span class="mt-1 block text-sm leading-6 text-text-muted">{body}</span>
                    </span>
                    <span class="mt-1 h-6 w-10 rounded-full p-0.5 transition {accessibilityEnabled(key) ? 'bg-campus-blue' : 'bg-border'}">
                      <span class="block h-5 w-5 rounded-full bg-white transition {accessibilityEnabled(key) ? 'translate-x-4' : ''}"></span>
                    </span>
                  </button>
                </form>
              {/each}
            </div>
          </div>

          <div class="mt-4 rounded-xl border border-border bg-muted p-4">
            <div class="flex items-center gap-2">
              <Sparkles class="h-4 w-4 text-link" />
              <p class="text-sm font-extrabold text-link">Quick access preview</p>
            </div>
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

    <!-- Notifications -->
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
        <div class="px-4 pb-5 sm:px-16" bind:this={panelRefs['notifications']}>
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

          <div class="flex items-center justify-between rounded-t-2xl border border-border bg-muted px-5 py-3">
            <span class="text-sm font-extrabold text-link">Notification categories</span>
            <div class="flex gap-2">
              <form method="POST" action="?/savePreference" use:enhance>
                <input type="hidden" name="notificationSettings" value={enableAllNotifications()} />
                <button type="submit" class="rounded-lg px-3 py-1.5 text-xs font-extrabold text-link transition hover:bg-border disabled:opacity-50" disabled={allNotificationsEnabled()}>Enable all</button>
              </form>
              <form method="POST" action="?/savePreference" use:enhance>
                <input type="hidden" name="notificationSettings" value={disableAllNotifications()} />
                <button type="submit" class="rounded-lg px-3 py-1.5 text-xs font-extrabold text-text-muted transition hover:bg-border disabled:opacity-50" disabled={allNotificationsDisabled()}>Disable all</button>
              </form>
            </div>
          </div>
          <div class="divide-y divide-border rounded-b-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
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
          <p class="mt-3 text-sm text-text-muted">Notification preferences are saved to your account.</p>
        </div>
      {/if}
    </div>

    <!-- Privacy & Security -->
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
          <small>Password, session, access protections, and activity</small>
        </span>
        <ChevronRight class="h-5 w-5 text-text-soft transition {app.openProfilePanel === 'privacy' ? 'rotate-90' : ''}" />
      </button>
      {#if app.openProfilePanel === 'privacy'}
        <div class="px-4 pb-5 sm:px-16" bind:this={panelRefs['privacy']}>
          <div class="card p-5">
            <div class="flex items-center gap-2">
              <KeyRound class="h-4 w-4 text-link" />
              <p class="text-sm font-extrabold text-link">Change password</p>
            </div>
            <form id="password-form" method="POST" action="?/changePassword" use:enhance={handlePasswordEnhance} class="mt-4 space-y-3">
              <div>
                <label for="current-password" class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-text-soft">Current password</label>
                <input id="current-password" type="password" name="currentPassword" class="control w-full" required autocomplete="current-password" />
              </div>
              <div>
                <label for="new-password" class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-text-soft">New password</label>
                <input id="new-password" type="password" name="newPassword" class="control w-full" required minlength="8" autocomplete="new-password" />
              </div>
              <div>
                <label for="confirm-password" class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-text-soft">Confirm new password</label>
                <input id="confirm-password" type="password" name="confirmPassword" class="control w-full" required minlength="8" autocomplete="new-password" />
              </div>
              {#if passwordError}
                <p class="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                  <XCircle class="h-4 w-4" />{passwordError}
                </p>
              {/if}
              {#if passwordSuccess}
                <p class="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>
              {/if}
              <button type="submit" class="primary-button" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>

          <div class="mt-4 divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
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

          <div class="mt-4 card p-5">
            <div class="flex items-center gap-2">
              <History class="h-4 w-4 text-link" />
              <p class="text-sm font-extrabold text-link">Account activity</p>
            </div>
            {#if allActivities.length === 0}
              <p class="mt-3 text-sm text-text-muted">No recent activity recorded for this account.</p>
            {:else}
              <div class="mt-3 divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
                {#each allActivities as activity}
                  <div class="flex items-center justify-between px-5 py-3">
                    <span class="text-sm font-extrabold text-text">{formatActivityType(activity.type, activity.toolName)}</span>
                    <span class="text-xs text-text-soft">{formatDate(activity.createdAt)}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Help & Feedback -->
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
        <div class="px-4 pb-5 sm:px-16" bind:this={panelRefs['help']}>
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

    <!-- Data Management -->
    <div class="border-t border-border">
      <button
        class="profile-row"
        bind:this={triggerRefs['data']}
        onclick={() => app.openProfilePanel === 'data' ? closePanel() : openPanel('data')}
        aria-expanded={app.openProfilePanel === 'data'}
      >
        <span class="profile-icon tone-0"><Database class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>Data Management</b>
          <small>Export, reset, and clear your account data</small>
        </span>
        <ChevronRight class="h-5 w-5 text-text-soft transition {app.openProfilePanel === 'data' ? 'rotate-90' : ''}" />
      </button>
      {#if app.openProfilePanel === 'data'}
        <div class="px-4 pb-5 sm:px-16" bind:this={panelRefs['data']}>
          <div class="grid gap-4 lg:grid-cols-2">
            <div class="card p-5">
              <div class="flex items-center gap-2">
                <Download class="h-4 w-4 text-link" />
                <p class="text-sm font-extrabold text-link">Export favorites</p>
              </div>
              <p class="mt-2 text-sm text-text-muted">Download your saved resources as a JSON file for backup or transfer.</p>
              <a href="/api/export/favorites" download class="secondary-button mt-4 w-full">
                <Download class="h-4 w-4" />
                Download favorites
              </a>
            </div>
            <div class="card p-5">
              <div class="flex items-center gap-2">
                <RotateCcw class="h-4 w-4 text-link" />
                <p class="text-sm font-extrabold text-link">Reset preferences</p>
              </div>
              <p class="mt-2 text-sm text-text-muted">Restore default settings for theme, role view, notifications, and accessibility.</p>
              <form method="POST" action="?/resetPreferences" use:enhance onsubmit={handleResetPreferences}>
                <button type="submit" class="secondary-button mt-4 w-full">
                  <RotateCcw class="h-4 w-4" />
                  Reset to defaults
                </button>
              </form>
            </div>
          </div>
          <div class="mt-4 card p-5 border-red-200 dark:border-red-900/40">
            <div class="flex items-center gap-2">
              <Trash2 class="h-4 w-4 text-red-600 dark:text-red-400" />
              <p class="text-sm font-extrabold text-red-600 dark:text-red-400">Clear activity history</p>
            </div>
            <p class="mt-2 text-sm text-text-muted">Permanently delete all recorded account activity. This action cannot be undone.</p>
            <form method="POST" action="?/clearActivities" use:enhance onsubmit={handleClearActivities}>
              <button type="submit" class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                <Trash2 class="h-4 w-4" />
                Clear history
              </button>
            </form>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
