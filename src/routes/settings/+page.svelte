<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState, roleLabels, roles } from '$lib/app-state.svelte'
  import type { Activity, Tool } from '$lib/types'
  import {
    Accessibility,
    Bell,
    CalendarClock,
    ChevronDown,
    ChevronUp,
    CircleHelp,
    Database,
    Download,
    ExternalLink,
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
    ['IT Help Desk', 'Use the Help Desk resource for account, device, and campus technology support.', 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/Home/?ToUrl=%2fTDClient%2f277%2fPortal%2fHome%2f'],
    ['Directory', 'Find faculty and staff contact information when you need a specific office.', 'https://my.alfredstate.edu'],
    ['University Police', 'Emergency and non-emergency contact for campus safety and security.', 'https://www.alfredstate.edu/university-police'],
    ['Title IX', 'Read about Title IX policies and reporting procedures.', 'https://www.alfredstate.edu/title-ix'],
    ['988 Hotline', 'Suicide and crisis lifeline available 24/7.', 'https://988lifeline.org'],
    ['Feedback for AlfredGO', 'For the prototype, collect comments about missing links, confusing categories, and role visibility.', null],
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

  let showPasswordForm = $state(false)
  let showActivity = $state(false)

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
          showPasswordForm = false
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

<section class="mx-auto max-w-5xl space-y-8 pb-8">
  <div>
    <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-link">Account controls</p>
    <SectionTitle>Settings</SectionTitle>
  </div>

  <!-- Appearance -->
  <div>
    <h2 class="mb-2 px-4 text-xs font-extrabold uppercase tracking-wider text-text-soft">Appearance</h2>
    <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      <!-- Theme -->
      <div class="profile-row">
        <span class="profile-icon tone-0"><Palette class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 basis-40">
          <b>Theme</b>
          <small>System follows your device preference</small>
        </span>
        <div class="flex flex-wrap justify-end gap-1">
          {#each ['system', 'light', 'dark'] as theme}
            <form method="POST" action="?/savePreference" use:enhance>
              <input type="hidden" name="theme" value={theme} />
              <button class="segmented {app.currentPreference?.theme === theme ? 'active' : ''}">
                {theme}
              </button>
            </form>
          {/each}
        </div>
      </div>

      <!-- Role view (staff and admin only) -->
      {#if app.isAdmin || app.currentRole === 'staff'}
        <div class="profile-row border-t border-border">
          <span class="profile-icon tone-0"><UserRound class="h-5 w-5" /></span>
          <span class="min-w-0 flex-1 basis-40">
            <b>Preferred role view</b>
            <small>Preview resources for another campus role</small>
          </span>
          <form method="POST" action="?/savePreference" use:enhance>
            <select
              name="preferredRoleView"
              class="control text-sm py-1.5 px-3"
              value={app.effectiveRole}
              onchange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              {#each roles as role}
                {#if app.isAdmin || role !== 'admin'}
                  <option value={role}>{roleLabels[role]}</option>
                {/if}
              {/each}
            </select>
          </form>
        </div>
      {/if}

      <!-- Accessibility toggles -->
      {#each accessibilityItems as [title, body, ItemIcon, key]}
        <form method="POST" action="?/savePreference" use:enhance class="border-t border-border">
          <input type="hidden" name="accessibilitySettings" value={toggleAccessibilitySetting(key)} />
          <button type="submit" class="profile-row">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-selected text-link"><ItemIcon class="h-5 w-5" /></span>
            <span class="min-w-0 flex-1 text-left">
              <b>{title}</b>
              <small>{body}</small>
            </span>
            <span class="h-6 w-10 shrink-0 rounded-full p-0.5 transition {accessibilityEnabled(key) ? 'bg-campus-blue' : 'bg-border'}">
              <span class="block h-5 w-5 rounded-full bg-white transition {accessibilityEnabled(key) ? 'translate-x-4' : ''}"></span>
            </span>
          </button>
        </form>
      {/each}
    </div>

    <!-- Quick access preview -->
    <div class="mt-4 rounded-xl border border-border bg-muted p-4">
      <div class="flex items-center gap-2">
        <Sparkles class="h-4 w-4 text-link" />
        <p class="text-sm font-extrabold text-link">Quick access preview</p>
      </div>
      <div class="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
        {#each resourcePreview() as tool}
          <div class="min-w-0 rounded-lg bg-surface px-3 py-2 ring-1 ring-border">
            <p class="truncate text-sm font-extrabold">{tool.name}</p>
            <p class="truncate text-xs text-text-muted">{tool.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Notifications -->
  <div>
    <div class="mb-2 flex items-center justify-between px-4">
      <h2 class="text-xs font-extrabold uppercase tracking-wider text-text-soft">Notifications</h2>
      <div class="flex gap-2">
        <form method="POST" action="?/savePreference" use:enhance>
          <input type="hidden" name="notificationSettings" value={enableAllNotifications()} />
          <button type="submit" class="text-xs font-extrabold text-link transition hover:opacity-70 disabled:opacity-30" disabled={allNotificationsEnabled()}>Enable all</button>
        </form>
        <form method="POST" action="?/savePreference" use:enhance>
          <input type="hidden" name="notificationSettings" value={disableAllNotifications()} />
          <button type="submit" class="text-xs font-extrabold text-text-muted transition hover:opacity-70 disabled:opacity-30" disabled={allNotificationsDisabled()}>Disable all</button>
        </form>
      </div>
    </div>
    <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      <!-- Push -->
      {#if pushSupported}
        <div class="profile-row">
          <span class="profile-icon tone-1"><Radio class="h-5 w-5" /></span>
          <span class="min-w-0 flex-1">
            <b>Browser push notifications</b>
            <small>Get real-time alerts on your phone or computer</small>
          </span>
          <button
            onclick={togglePush}
            disabled={pushLoading}
            class="h-6 w-10 shrink-0 rounded-full p-0.5 transition {pushSubscribed ? 'bg-campus-blue' : 'bg-border'} disabled:opacity-50"
            aria-pressed={pushSubscribed}
            aria-label={pushSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
          >
            <span class="block h-5 w-5 rounded-full bg-white transition {pushSubscribed ? 'translate-x-4' : ''}"></span>
          </button>
        </div>
        {#if pushError}
          <p class="px-4 pb-3 text-sm text-red-600 dark:text-red-400">{pushError}</p>
        {/if}
      {/if}

      <!-- Categories -->
      {#each notificationOptions as [title, body, ItemIcon], i}
        <form method="POST" action="?/savePreference" use:enhance class="{(i > 0 || pushSupported) ? 'border-t border-border' : ''}">
          <input type="hidden" name="notificationSettings" value={JSON.stringify({
            ...(app.currentPreference?.notificationSettings || {}),
            [title]: !notificationEnabled(title)
          })} />
          <button type="submit" class="profile-row">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-selected text-link"><ItemIcon class="h-5 w-5" /></span>
            <span class="min-w-0 flex-1 text-left">
              <b>{title}</b>
              <small>{body}</small>
            </span>
            <span class="h-6 w-10 shrink-0 rounded-full p-0.5 transition {notificationEnabled(title) ? 'bg-campus-blue' : 'bg-border'}">
              <span class="block h-5 w-5 rounded-full bg-white transition {notificationEnabled(title) ? 'translate-x-4' : ''}"></span>
            </span>
          </button>
        </form>
      {/each}
    </div>
  </div>

  <!-- Privacy & Security -->
  <div>
    <h2 class="mb-2 px-4 text-xs font-extrabold uppercase tracking-wider text-text-soft">Privacy & Security</h2>
    <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      <!-- Change password -->
      <button class="profile-row" onclick={() => showPasswordForm = !showPasswordForm}>
        <span class="profile-icon tone-2"><KeyRound class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>Change password</b>
          <small>Update your account password</small>
        </span>
        <span class="transition {showPasswordForm ? 'rotate-180' : ''}">
          <ChevronDown class="h-5 w-5 text-text-soft" />
        </span>
      </button>
      {#if showPasswordForm}
        <div class="border-t border-border px-4 pb-5 pt-2 sm:px-8">
          <form id="password-form" method="POST" action="?/changePassword" use:enhance={handlePasswordEnhance} class="space-y-3">
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
      {/if}

      <!-- Security info items -->
      {#each securityItems as [title, body, ItemIcon], i}
        <div class="profile-row {i > 0 || showPasswordForm ? 'border-t border-border' : ''}">
          <span class="profile-icon tone-0 shrink-0"><ItemIcon class="h-5 w-5" /></span>
          <span class="min-w-0 flex-1">
            <b>{title}</b>
            <small>{body}</small>
          </span>
        </div>
      {/each}

      <!-- Activity history -->
      <button class="profile-row border-t border-border" onclick={() => showActivity = !showActivity}>
        <span class="profile-icon tone-0"><History class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>Account activity</b>
          <small>{allActivities.length} recent events</small>
        </span>
        <span class="transition {showActivity ? 'rotate-180' : ''}">
          <ChevronDown class="h-5 w-5 text-text-soft" />
        </span>
      </button>
      {#if showActivity}
        <div class="border-t border-border px-4 pb-4 pt-2 sm:px-8">
          {#if allActivities.length === 0}
            <p class="text-sm text-text-muted">No recent activity recorded for this account.</p>
          {:else}
            <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
              {#each allActivities as activity}
                <div class="flex items-center justify-between px-4 py-3">
                  <span class="text-sm font-extrabold text-text">{formatActivityType(activity.type, activity.toolName)}</span>
                  <span class="text-xs text-text-soft">{formatDate(activity.createdAt)}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Help & Feedback -->
  <div>
    <h2 class="mb-2 px-4 text-xs font-extrabold uppercase tracking-wider text-text-soft">Help & Feedback</h2>
    <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      {#each helpItems as [title, body, url], i}
        {#if url}
          <a href={url} target="_blank" rel="noopener noreferrer" class="profile-row {i > 0 ? 'border-t border-border' : ''}">
            <span class="profile-icon tone-3"><CircleHelp class="h-5 w-5" /></span>
            <span class="min-w-0 flex-1">
              <b>{title}</b>
              <small>{body}</small>
            </span>
            <ExternalLink class="h-4 w-4 shrink-0 text-text-soft" />
          </a>
        {:else}
          <div class="profile-row {i > 0 ? 'border-t border-border' : ''}">
            <span class="profile-icon tone-3"><CircleHelp class="h-5 w-5" /></span>
            <span class="min-w-0 flex-1">
              <b>{title}</b>
              <small>{body}</small>
            </span>
          </div>
        {/if}
      {/each}
    </div>
    <div class="mt-3 flex flex-wrap gap-2 px-4">
      <span class="tag">Prototype</span>
      <span class="tag">SQLite auth</span>
      <span class="tag">Role-based resources</span>
    </div>
  </div>

  <!-- Data Management -->
  <div>
    <h2 class="mb-2 px-4 text-xs font-extrabold uppercase tracking-wider text-text-soft">Data Management</h2>
    <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      <!-- Export -->
      <div class="profile-row">
        <span class="profile-icon tone-0"><Download class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 basis-40">
          <b>Export favorites</b>
          <small>Download your saved resources as a JSON file</small>
        </span>
        <a href="/api/export/favorites" download class="secondary-button text-xs py-2 px-3">
          <Download class="h-4 w-4" />
          Export
        </a>
      </div>

      <!-- Reset -->
      <form method="POST" action="?/resetPreferences" use:enhance onsubmit={handleResetPreferences} class="border-t border-border">
        <button type="submit" class="profile-row w-full text-left">
          <span class="profile-icon tone-0"><RotateCcw class="h-5 w-5" /></span>
          <span class="min-w-0 flex-1">
            <b>Reset preferences</b>
            <small>Restore default settings for theme, role view, notifications, and accessibility</small>
          </span>
        </button>
      </form>

      <!-- Clear activity -->
      <form method="POST" action="?/clearActivities" use:enhance onsubmit={handleClearActivities} class="border-t border-border">
        <button type="submit" class="profile-row w-full text-left">
          <span class="profile-icon tone-0"><Trash2 class="h-5 w-5" /></span>
          <span class="min-w-0 flex-1">
            <b>Clear activity history</b>
            <small>Permanently delete all recorded account activity</small>
          </span>
        </button>
      </form>
    </div>
  </div>
</section>
