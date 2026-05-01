<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import { Sun, Moon, Monitor, ChevronDown, ChevronRight } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import Button from '$lib/components/Button.svelte'
  import Badge from '$lib/components/Badge.svelte'

  const app = getAppState()

  let openPanels = $state<Set<string>>(new Set(['dashboard']))

  function togglePanel(id: string) {
    const next = new Set(openPanels)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    openPanels = next
  }

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ]

  const roleViews = ['applicant', 'accepted_student', 'student', 'staff', 'admin']

  async function savePreference(key: string, value: string) {
    await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: app.userId, [key]: value }),
    })
    const res = await fetch('/api/data')
    const data = await res.json()
    app.hydrate({ ...data, authUserId: app.userId })
    if (key === 'theme') {
      app.applyTheme(value)
    }
  }
</script>

<div class="p-4 md:p-8">
  <SectionTitle>Settings</SectionTitle>
  <p class="mb-6 text-sm text-text-muted">Customize your AlfredGO experience.</p>

  <div class="flex flex-col gap-3">
    <!-- Dashboard Settings -->
    <div class="card overflow-hidden">
      <button
        onclick={() => togglePanel('dashboard')}
        class="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-muted/30"
      >
        <span class="font-extrabold text-sm text-text">Dashboard Settings</span>
        {#if openPanels.has('dashboard')}
          <ChevronDown class="h-4 w-4 text-text-muted" />
        {:else}
          <ChevronRight class="h-4 w-4 text-text-muted" />
        {/if}
      </button>
      {#if openPanels.has('dashboard')}
        <div class="border-t border-border px-5 py-4">
          <div class="mb-4">
            <p class="mb-2 text-xs font-bold uppercase text-text-muted">Theme</p>
            <div class="flex gap-2">
              {#each themes as theme}
                <button
                  onclick={() => savePreference('theme', theme.id)}
                  class="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition {app.currentPreference?.theme === theme.id ? 'border-link bg-link/10 text-link' : 'border-border bg-muted text-text-muted hover:text-text'}"
                >
                  <theme.icon class="h-4 w-4" />
                  {theme.label}
                </button>
              {/each}
            </div>
          </div>
          <div>
            <p class="mb-2 text-xs font-bold uppercase text-text-muted">Role View</p>
            <div class="flex flex-wrap gap-2">
              {#each roleViews as role}
                <button
                  onclick={() => savePreference('preferredRoleView', role)}
                  class="rounded-xl border px-3 py-1.5 text-xs font-bold capitalize transition {app.currentPreference?.preferredRoleView === role ? 'border-link bg-link/10 text-link' : 'border-border bg-muted text-text-muted hover:text-text'}"
                >
                  {role.replace('_', ' ')}
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Notifications -->
    <div class="card overflow-hidden">
      <button
        onclick={() => togglePanel('notifications')}
        class="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-muted/30"
      >
        <span class="font-extrabold text-sm text-text">Notifications</span>
        {#if openPanels.has('notifications')}
          <ChevronDown class="h-4 w-4 text-text-muted" />
        {:else}
          <ChevronRight class="h-4 w-4 text-text-muted" />
        {/if}
      </button>
      {#if openPanels.has('notifications')}
        <div class="border-t border-border px-5 py-4">
          <div class="flex flex-col gap-3">
            {#each [
              { label: 'Email alerts', description: 'Receive email notifications for deadlines' },
              { label: 'Push notifications', description: 'Browser push for urgent alerts' },
            ] as item}
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold text-text">{item.label}</p>
                  <p class="text-xs text-text-muted">{item.description}</p>
                </div>
                <Badge variant="outline">Soon</Badge>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Privacy -->
    <div class="card overflow-hidden">
      <button
        onclick={() => togglePanel('privacy')}
        class="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-muted/30"
      >
        <span class="font-extrabold text-sm text-text">Privacy</span>
        {#if openPanels.has('privacy')}
          <ChevronDown class="h-4 w-4 text-text-muted" />
        {:else}
          <ChevronRight class="h-4 w-4 text-text-muted" />
        {/if}
      </button>
      {#if openPanels.has('privacy')}
        <div class="border-t border-border px-5 py-4">
          <div class="flex flex-col gap-3">
            {#each [
              { label: 'Activity tracking', description: 'Allow usage analytics' },
              { label: 'Public profile', description: 'Make profile visible to other users' },
            ] as item}
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold text-text">{item.label}</p>
                  <p class="text-xs text-text-muted">{item.description}</p>
                </div>
                <Badge variant="outline">Soon</Badge>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Help -->
    <div class="card overflow-hidden">
      <button
        onclick={() => togglePanel('help')}
        class="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-muted/30"
      >
        <span class="font-extrabold text-sm text-text">Help & Support</span>
        {#if openPanels.has('help')}
          <ChevronDown class="h-4 w-4 text-text-muted" />
        {:else}
          <ChevronRight class="h-4 w-4 text-text-muted" />
        {/if}
      </button>
      {#if openPanels.has('help')}
        <div class="border-t border-border px-5 py-4">
          <div class="flex flex-col gap-3">
            {#each [
              { label: 'Documentation', description: 'View user guides and FAQs' },
              { label: 'Contact support', description: 'Email the AlfredGO team' },
            ] as item}
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold text-text">{item.label}</p>
                  <p class="text-xs text-text-muted">{item.description}</p>
                </div>
                <Badge variant="outline">Soon</Badge>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
