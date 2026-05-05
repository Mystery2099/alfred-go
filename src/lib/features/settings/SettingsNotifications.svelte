<script lang="ts">
  import { enhance } from '$app/forms'
  import type { AppStore } from '$lib/app-state.svelte'
  import { getPushStatus, isPushSupported, subscribeToPush, unsubscribeFromPush } from '$lib/push-client'
  import { Radio } from 'lucide-svelte'
  import { notificationOptions } from './settings-options'

  let { app }: { app: AppStore } = $props()

  let pushSupported = $state(false)
  let pushSubscribed = $state(false)
  let pushLoading = $state(false)
  let pushError = $state('')

  $effect(() => {
    if (typeof window === 'undefined') return

    pushSupported = isPushSupported()
    if (pushSupported) {
      getPushStatus().then((status) => {
        pushSubscribed = status.subscribed
      })
    }
  })

  function notificationEnabled(title: string): boolean {
    const settings = app.currentPreference?.notificationSettings
    if (!settings || !(title in settings)) return true
    return settings[title]
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

  function allNotificationsEnabled() {
    return notificationOptions.every(([title]) => notificationEnabled(title))
  }

  function allNotificationsDisabled() {
    return notificationOptions.every(([title]) => !notificationEnabled(title))
  }

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
</script>

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

    {#each notificationOptions as [title, body, ItemIcon], i (title)}
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
