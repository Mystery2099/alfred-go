<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState } from '$lib/app-state.svelte'
  import type { Tool } from '$lib/types'
  import { Plus, X } from 'lucide-svelte'
  import ToolGrid from '$lib/components/shared/ToolGrid.svelte'
  import AudienceRolePicker from '$lib/features/admin/AudienceRolePicker.svelte'

  const app = getAppState()

  const emptyTool = (): Tool => ({
    id: `tool-${Date.now()}`,
    name: '',
    description: '',
    url: '',
    categoryId: app.categories[0]?.id || 'academics',
    icon: 'Grid2X2',
    tags: [],
    audienceRoles: ['student'],
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  let draft = $state<Tool>(emptyTool())
  let isEditing = $state(false)
  let formError = $state<string | null>(null)
  let submitting = $state(false)

  function resetDraft() {
    draft = emptyTool()
    isEditing = false
    formError = null
  }

  function startEdit(tool: Tool) {
    draft = { ...tool, tags: [...tool.tags] }
    isEditing = true
    formError = null
  }
</script>

{#if app.currentRole !== 'admin'}
  <div class="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
    <h3 class="text-xl font-extrabold">Admin access required</h3>
    <p class="mt-2 text-text-muted">Sign in with an admin account to manage tools.</p>
  </div>
{:else}
  <section class="space-y-5">
    <div>
      <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Admin</p>
      <h2 class="mt-1 text-2xl font-extrabold text-link">Manage tools</h2>
    </div>
    <form method="POST" action="?/saveTool" use:enhance={() => {
      submitting = true
      return async ({ result, update }) => {
        submitting = false
        if (result.type === 'failure' && result.data?.error) {
          formError = String(result.data.error)
          return
        }
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
        <h3 class="font-extrabold">{isEditing ? 'Edit tool' : 'Tool editor'}</h3>
        {#if isEditing}
          <button type="button" onclick={resetDraft} class="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition hover:bg-muted hover:text-link" aria-label="Cancel editing">
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
      <input type="hidden" name="icon" value={draft.icon || 'Grid2X2'} />
      <div class="grid gap-3 md:grid-cols-2">
        <input class="control" name="name" placeholder="Name" bind:value={draft.name} />
        <input class="control" name="url" placeholder="URL" bind:value={draft.url} />
        <select class="control" name="categoryId" bind:value={draft.categoryId}>
          {#each app.categories as category (category.id)}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
        <input
          class="control"
          placeholder="Tags, comma separated"
          value={draft.tags.join(', ')}
          oninput={(event) => draft.tags = event.currentTarget.value.split(',').map((tag) => tag.trim()).filter(Boolean)}
        />
        <input type="hidden" name="tags" value={draft.tags.join(', ')} />
        <textarea class="control md:col-span-2" name="description" rows="3" placeholder="Description" bind:value={draft.description}></textarea>
      </div>
      <AudienceRolePicker class="mt-3" selected={draft.audienceRoles} onChange={(nextRoles) => draft.audienceRoles = nextRoles} />
      <label class="mt-3 flex items-center gap-2">
        <input type="checkbox" name="isActive" checked={draft.isActive} class="h-4 w-4" onchange={(event) => draft.isActive = event.currentTarget.checked} />
        <span class="text-sm font-medium">Active</span>
      </label>
      <div class="mt-4 flex gap-3">
        <button class="primary-button" disabled={submitting}>
          {#if submitting}
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          {:else}
            <Plus class="h-4 w-4" />
          {/if}
          {isEditing ? 'Update tool' : 'Save tool'}
        </button>
      </div>
    </form>
    <ToolGrid tools={app.data?.tools || []} admin onEdit={startEdit} />
  </section>
{/if}
