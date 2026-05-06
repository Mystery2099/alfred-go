<script lang="ts">
  import { enhance } from '$app/forms'
  import type { AppStore } from '$lib/app-state.svelte'
  import { getPushStatus, isPushSupported, subscribeToPush, unsubscribeFromPush } from '$lib/push-client'
  import { Radio } from 'lucide-svelte'
  import SettingsRow from './SettingsRow.svelte'
  import SwitchIndicator from './SwitchIndicator.svelte'
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
      <SettingsRow
        as="button"
        icon={Radio}
        tone="tone-1"
        title="Browser push notifications"
        body="Get real-time alerts on your phone or computer"
        onclick={togglePush}
        disabled={pushLoading}
        ariaPressed={pushSubscribed}
        ariaLabel={pushSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
      >
        {#snippet action()}
          <SwitchIndicator checked={pushSubscribed} disabled={pushLoading} />
        {/snippet}
      </SettingsRow>
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
        <SettingsRow as="button" type="submit" icon={ItemIcon} {title} {body}>
          {#snippet action()}
            <SwitchIndicator checked={notificationEnabled(title)} />
          {/snippet}
        </SettingsRow>
      </form>
    {/each}
  </div>
</div>
