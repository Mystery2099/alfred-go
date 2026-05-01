<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import { goto } from '$app/navigation'
  import { Settings, ShieldCheck, LogOut } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import Badge from '$lib/components/Badge.svelte'
  import Button from '$lib/components/Button.svelte'

  const app = getAppState()

  async function handleLogout() {
    await app.logout()
    goto('/login')
  }

  const accessNotes = [
    { label: 'Role', value: app.currentUser?.role || 'Guest' },
    { label: 'Effective Role', value: app.effectiveRole },
    { label: 'Theme', value: app.currentPreference?.theme || 'System' },
    { label: 'Role View', value: app.currentPreference?.preferredRoleView || 'Default' },
  ]

  const infoRows = [
    { label: 'Name', value: app.displayName },
    { label: 'Email', value: app.currentUser?.email || '—' },
    { label: 'User ID', value: app.userId || '—' },
  ]
</script>

<div class="p-4 md:p-8">
  <SectionTitle>Profile</SectionTitle>
  <p class="mb-6 text-sm text-text-muted">Manage your account and preferences.</p>

  <!-- Hero -->
  <div class="mb-6 flex items-center gap-4">
    <div class="avatar h-16 w-16 text-2xl">{app.displayName.charAt(0)}</div>
    <div>
      <h2 class="text-lg font-extrabold text-text">{app.displayName}</h2>
      <p class="text-sm text-text-muted">{app.currentUser?.email}</p>
      <Badge variant="default" class="mt-1">{app.currentRole}</Badge>
    </div>
  </div>

  <!-- Access Notes -->
  <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
    {#each accessNotes as note}
      <div class="card p-3 text-center">
        <p class="text-[10px] font-bold uppercase tracking-wider text-text-muted">{note.label}</p>
        <p class="mt-1 text-sm font-extrabold text-text capitalize">{note.value}</p>
      </div>
    {/each}
  </div>

  <!-- Info -->
  <div class="card mb-6 divide-y divide-border">
    {#each infoRows as row}
      <div class="flex items-center justify-between px-4 py-3">
        <span class="text-sm text-text-muted">{row.label}</span>
        <span class="text-sm font-bold text-text">{row.value}</span>
      </div>
    {/each}
  </div>

  <!-- Links -->
  <div class="flex flex-col gap-2">
    <Button href="/settings" variant="secondary">
      <Settings class="h-4 w-4" />
      Settings
    </Button>
    {#if app.isAdmin}
      <Button href="/admin" variant="secondary">
        <ShieldCheck class="h-4 w-4" />
        Admin Dashboard
      </Button>
    {/if}
    <Button variant="ghost" onclick={handleLogout}>
      <LogOut class="h-4 w-4" />
      Log Out
    </Button>
  </div>
</div>
