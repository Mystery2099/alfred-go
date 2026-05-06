<script lang="ts">
  import { enhance } from '$app/forms'
  import { resolve } from '$app/paths'
  import { getAppState, roleLabels, roles } from '$lib/app-state.svelte'
  import { resetChecklistStorage } from '$lib/onboarding'
  import type { Activity, Tool } from '$lib/types'
  import {
    ChevronDown,
    CircleHelp,
    Download,
    ExternalLink,
    History,
    KeyRound,
    Palette,
    RotateCcw,
    Sparkles,
    Trash2,
    UserRound,
    XCircle,
  } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import SettingsNotifications from '$lib/features/settings/SettingsNotifications.svelte'
  import SettingsRow from '$lib/features/settings/SettingsRow.svelte'
  import SwitchIndicator from '$lib/features/settings/SwitchIndicator.svelte'
  import { accessibilityItems, helpItems, securityItems } from '$lib/features/settings/settings-options'

  const app = getAppState()

  let { data } = $props()
  const allActivities = $derived((data.activities || []) as Activity[])

  const favoriteTools = $derived.by(() => app.visibleTools.filter((tool) => app.favoriteIds.has(tool.id)))
  const featuredTools = $derived.by(() => app.visibleTools.filter((tool) => tool.isFeatured).slice(0, 4))

  function accessibilityEnabled(key: string): boolean {
    const settings = app.currentPreference?.accessibilitySettings
    if (!settings || !(key in settings)) return false
    return !!settings[key as keyof typeof settings]
  }

  function resourcePreview(): Tool[] {
    return (favoriteTools.length ? favoriteTools : featuredTools).slice(0, 4)
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

  let passwordError = $state('')
  let passwordSuccess = $state('')
  let passwordLoading = $state(false)

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

  function restartOnboarding() {
    resetChecklistStorage(app.userId, app.effectiveRole)
    window.location.href = '/'
  }

  function toggleAccessibilitySetting(key: string) {
    const current = app.currentPreference?.accessibilitySettings || {}
    const next = { ...current, [key]: !current[key as keyof typeof current] }
    return JSON.stringify(next)
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
      <SettingsRow icon={Palette} title="Theme" body="System follows your device preference" class="basis-40">
        {#snippet action()}
          <div class="flex flex-wrap justify-end gap-1">
            {#each ['system', 'light', 'dark'] as theme (theme)}
              <form method="POST" action="?/savePreference" use:enhance>
                <input type="hidden" name="theme" value={theme} />
                <button class="segmented {app.currentPreference?.theme === theme ? 'active' : ''}">
                  {theme}
                </button>
              </form>
            {/each}
          </div>
        {/snippet}
      </SettingsRow>

      <!-- Role view (staff and admin only) -->
      {#if app.isAdmin || app.currentRole === 'staff'}
        <SettingsRow border icon={UserRound} title="Preferred role view" body="Preview resources for another campus role" class="basis-40">
          {#snippet action()}
            <form method="POST" action="?/savePreference" use:enhance>
              <select
                name="preferredRoleView"
                class="control text-sm py-1.5 px-3"
                value={app.effectiveRole}
                onchange={(event) => event.currentTarget.form?.requestSubmit()}
              >
                {#each roles as role (role)}
                  {#if app.isAdmin || role !== 'admin'}
                    <option value={role}>{roleLabels[role]}</option>
                  {/if}
                {/each}
              </select>
            </form>
          {/snippet}
        </SettingsRow>
      {/if}

      <!-- Accessibility toggles -->
      {#each accessibilityItems as [title, body, ItemIcon, key] (key)}
        <form method="POST" action="?/savePreference" use:enhance class="border-t border-border">
          <input type="hidden" name="accessibilitySettings" value={toggleAccessibilitySetting(key)} />
          <SettingsRow as="button" type="submit" icon={ItemIcon} {title} {body}>
            {#snippet action()}
              <SwitchIndicator checked={accessibilityEnabled(key)} />
            {/snippet}
          </SettingsRow>
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
        {#each resourcePreview() as tool (tool.id)}
          <div class="min-w-0 rounded-lg bg-surface px-3 py-2 ring-1 ring-border">
            <p class="truncate text-sm font-extrabold">{tool.name}</p>
            <p class="truncate text-xs text-text-muted">{tool.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <SettingsNotifications {app} />

  <!-- Privacy & Security -->
  <div>
    <h2 class="mb-2 px-4 text-xs font-extrabold uppercase tracking-wider text-text-soft">Privacy & Security</h2>
    <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      <!-- Change password -->
      <SettingsRow as="button" icon={KeyRound} tone="tone-2" title="Change password" body="Update your account password" onclick={() => showPasswordForm = !showPasswordForm}>
        {#snippet action()}
          <span class="transition {showPasswordForm ? 'rotate-180' : ''}">
            <ChevronDown class="h-5 w-5 text-text-soft" />
          </span>
        {/snippet}
      </SettingsRow>
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
      {#each securityItems as [title, body, ItemIcon], i (title)}
        <SettingsRow border={i > 0 || showPasswordForm} icon={ItemIcon} {title} {body} />
      {/each}

      <!-- Activity history -->
      <SettingsRow border as="button" icon={History} title="Account activity" body={`${allActivities.length} recent events`} onclick={() => showActivity = !showActivity}>
        {#snippet action()}
          <span class="transition {showActivity ? 'rotate-180' : ''}">
            <ChevronDown class="h-5 w-5 text-text-soft" />
          </span>
        {/snippet}
      </SettingsRow>
      {#if showActivity}
        <div class="border-t border-border px-4 pb-4 pt-2 sm:px-8">
          {#if allActivities.length === 0}
            <p class="text-sm text-text-muted">No recent activity recorded for this account.</p>
          {:else}
            <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
              {#each allActivities as activity (activity.id)}
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
      {#each helpItems as [title, body, url], i (title)}
        {#if url}
          <SettingsRow as="a" href={url} border={i > 0} icon={CircleHelp} tone="tone-3" {title} {body}>
            {#snippet action()}
              <ExternalLink class="h-4 w-4 shrink-0 text-text-soft" />
            {/snippet}
          </SettingsRow>
        {:else}
          <SettingsRow border={i > 0} icon={CircleHelp} tone="tone-3" {title} {body} />
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
      <!-- Onboarding -->
      <SettingsRow as="button" icon={Sparkles} title="Restart getting started" body="Show the role-based onboarding checklist again from the beginning" class="w-full basis-40 text-left" onclick={restartOnboarding} />

      <!-- Export -->
      <SettingsRow border icon={Download} title="Export favorites" body="Download your saved resources as a JSON file" class="basis-40">
        {#snippet action()}
          <a href={resolve('/api/export/favorites')} download class="secondary-button text-xs py-2 px-3">
            <Download class="h-4 w-4" />
            Export
          </a>
        {/snippet}
      </SettingsRow>

      <!-- Reset -->
      <form method="POST" action="?/resetPreferences" use:enhance onsubmit={handleResetPreferences} class="border-t border-border">
        <SettingsRow as="button" type="submit" icon={RotateCcw} title="Reset preferences" body="Restore default settings for theme, role view, notifications, and accessibility" class="w-full text-left" />
      </form>

      <!-- Clear activity -->
      <form method="POST" action="?/clearActivities" use:enhance onsubmit={handleClearActivities} class="border-t border-border">
        <SettingsRow as="button" type="submit" icon={Trash2} title="Clear activity history" body="Permanently delete all recorded account activity" class="w-full text-left" />
      </form>
    </div>
  </div>
</section>
