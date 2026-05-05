<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState } from '$lib/app-state.svelte'
  import type { Announcement } from '$lib/types'
  import { Plus, X, Trash2, Pencil } from 'lucide-svelte'

  const app = getAppState()

  const emptyAnnouncement = (): Announcement => ({
    id: `announcement-${Date.now()}`,
    title: '',
    body: '',
    tone: 'reminder',
    filter: 'updates',
    actionLabel: '',
    sortOrder: (app.data?.announcements.length || 0) * 10 + 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  let draft = $state<Announcement>(emptyAnnouncement())
  let isEditing = $state(false)
  let formError = $state<string | null>(null)
  let submitting = $state(false)
  let linkType = $state<'tool' | 'url'>('tool')

  function resetDraft() {
    draft = emptyAnnouncement()
    isEditing = false
    formError = null
    linkType = 'tool'
  }

  function startEdit(announcement: Announcement) {
    draft = { ...announcement }
    isEditing = true
    formError = null
    linkType = announcement.url ? 'url' : 'tool'
  }
</script>

{#if app.currentRole !== 'admin'}
  <div class="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
    <h3 class="text-xl font-extrabold">Admin access required</h3>
    <p class="mt-2 text-text-muted">Sign in with an admin account to manage announcements.</p>
  </div>
{:else}
  <section class="space-y-5">
    <div>
      <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Admin</p>
      <h2 class="mt-1 text-2xl font-extrabold text-link">Manage announcements</h2>
    </div>
    <form method="POST" action="?/saveAnnouncement" use:enhance={() => {
      submitting = true
      return async ({ result, update }) => {
        submitting = false
        if (result.type === 'success' && result.data?.ok === false && result.data?.error) {
          formError = String(result.data.error)
          return
        }
        formError = null
        await update()
        resetDraft()
      }
    }} class="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-extrabold">{isEditing ? 'Edit announcement' : 'New announcement'}</h3>
        {#if isEditing}
          <button type="button" onclick={resetDraft} class="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition hover:bg-muted hover:text-link">
            <X class="h-4 w-4" />
          </button>
        {/if}
      </div>
      {#if formError}
        <div class="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {formError}
        </div>
      {/if}
      <input type="hidden" name="id" value={draft.id} />
      <div class="grid gap-3 md:grid-cols-2">
        <input class="control" name="title" placeholder="Title" bind:value={draft.title} />
        <input class="control" name="actionLabel" placeholder="Action label (optional)" bind:value={draft.actionLabel} />
        <select class="control" name="tone" bind:value={draft.tone}>
          <option value="urgent">Urgent</option>
          <option value="deadline">Deadline</option>
          <option value="reminder">Reminder</option>
        </select>
        <select class="control" name="filter" bind:value={draft.filter}>
          <option value="updates">Updates</option>
          <option value="deadlines">Deadlines</option>
          <option value="reminders">Reminders</option>
        </select>
        <div class="md:col-span-2 flex gap-2">
          <button type="button" onclick={() => linkType = 'tool'} class="segmented {linkType === 'tool' ? 'active' : ''}">Link to tool</button>
          <button type="button" onclick={() => linkType = 'url'} class="segmented {linkType === 'url' ? 'active' : ''}">Custom URL</button>
        </div>
        {#if linkType === 'tool'}
          <select class="control md:col-span-2" name="toolId" bind:value={draft.toolId}>
            <option value="">Select a tool...</option>
            {#each app.data?.tools || [] as tool}
              <option value={tool.id}>{tool.name}</option>
            {/each}
          </select>
        {:else}
          <input class="control md:col-span-2" name="url" placeholder="https://..." bind:value={draft.url} />
        {/if}
        <input type="hidden" name="toolId" value={linkType === 'tool' ? (draft.toolId || '') : ''} />
        <input type="hidden" name="url" value={linkType === 'url' ? (draft.url || '') : ''} />
        <input class="control" type="number" name="sortOrder" placeholder="Sort order" bind:value={draft.sortOrder} />
        <label class="flex items-center gap-2">
          <input type="checkbox" name="isActive" checked={draft.isActive} class="h-4 w-4" />
          <span class="text-sm font-medium">Active</span>
        </label>
        <textarea class="control md:col-span-2" name="body" rows="3" placeholder="Body text" bind:value={draft.body}></textarea>
      </div>
      <div class="mt-4 flex gap-3">
        <button class="primary-button" disabled={submitting}>
          {#if submitting}
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          {:else}
            <Plus class="h-4 w-4" />
          {/if}
          {isEditing ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
    <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
      {#each app.data?.announcements || [] as announcement}
        <div class="flex items-start justify-between gap-3 px-5 py-4 transition hover:bg-muted">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-text">{announcement.title}</span>
              {#if !announcement.isActive}
                <span class="rounded-md bg-border px-2 py-0.5 text-[10px] font-extrabold uppercase text-text-muted">Inactive</span>
              {/if}
            </div>
            <p class="mt-1 text-sm text-text-muted">{announcement.body}</p>
            <div class="mt-2 flex flex-wrap gap-1">
              <span class="tag">{announcement.tone}</span>
              <span class="tag">{announcement.filter}</span>
              {#if announcement.actionLabel}
                <span class="tag">{announcement.actionLabel}</span>
              {/if}
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button title="Edit announcement" onclick={() => startEdit(announcement)} class="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition hover:bg-muted hover:text-link">
              <Pencil class="h-4 w-4" />
            </button>
            <form method="POST" action="?/deleteAnnouncement" use:enhance>
              <input type="hidden" name="announcementId" value={announcement.id} />
              <button title="Delete announcement" type="submit" class="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition hover:bg-rose-100 hover:text-rose-600">
                <Trash2 class="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}
