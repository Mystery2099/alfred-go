<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import { Plus, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import ToolGrid from '$lib/components/ToolGrid.svelte'
  import Button from '$lib/components/Button.svelte'
  import Badge from '$lib/components/Badge.svelte'

  const app = getAppState()

  let editing = $state(false)
  let editId = $state('')
  let name = $state('')
  let description = $state('')
  let url = $state('')
  let categoryId = $state('')
  let tags = $state('')
  let audienceRoles = $state<string[]>([])
  let isFeatured = $state(false)
  let isActive = $state(true)
  let message = $state('')

  function resetForm() {
    editing = false
    editId = ''
    name = ''
    description = ''
    url = ''
    categoryId = app.categories[0]?.id || ''
    tags = ''
    audienceRoles = ['student']
    isFeatured = false
    isActive = true
    message = ''
  }

  function startEdit(tool: import('$lib/types').Tool) {
    editing = true
    editId = tool.id
    name = tool.name
    description = tool.description
    url = tool.url
    categoryId = tool.categoryId
    tags = tool.tags.join(', ')
    audienceRoles = [...tool.audienceRoles]
    isFeatured = tool.isFeatured
    isActive = tool.isActive
    message = ''
  }

  async function saveTool(e: Event) {
    e.preventDefault()
    const payload = {
      id: editing ? editId : crypto.randomUUID(),
      name,
      description,
      url,
      categoryId,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      audienceRoles,
      isFeatured,
      isActive,
    }
    const res = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      message = editing ? 'Tool updated.' : 'Tool created.'
      // Refresh data
      const dataRes = await fetch('/api/data')
      const data = await dataRes.json()
      app.hydrate({ ...data, authUserId: app.userId })
      resetForm()
    } else {
      message = 'Failed to save tool.'
    }
  }

  async function deleteTool(id: string) {
    if (!confirm('Delete this tool?')) return
    const res = await fetch('/api/tools', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      const dataRes = await fetch('/api/data')
      const data = await dataRes.json()
      app.hydrate({ ...data, authUserId: app.userId })
    }
  }

  resetForm()
</script>

<div class="p-4 md:p-8">
  <div class="mb-6 flex items-center justify-between">
    <SectionTitle>Manage Tools</SectionTitle>
    <Button onclick={() => resetForm()}>
      <Plus class="h-4 w-4" />
      New Tool
    </Button>
  </div>

  <!-- Editor -->
  <form onsubmit={saveTool} class="card mb-6 flex flex-col gap-3 p-4">
    <h3 class="text-sm font-extrabold text-text">{editing ? 'Edit Tool' : 'New Tool'}</h3>
    <input bind:value={name} placeholder="Name" required class="h-10 rounded-lg border border-border bg-muted px-3 text-sm" />
    <input bind:value={description} placeholder="Description" required class="h-10 rounded-lg border border-border bg-muted px-3 text-sm" />
    <input bind:value={url} placeholder="URL" required class="h-10 rounded-lg border border-border bg-muted px-3 text-sm" />
    <select bind:value={categoryId} class="h-10 rounded-lg border border-border bg-muted px-3 text-sm">
      {#each app.categories as cat}
        <option value={cat.id}>{cat.name}</option>
      {/each}
    </select>
    <input bind:value={tags} placeholder="Tags (comma-separated)" class="h-10 rounded-lg border border-border bg-muted px-3 text-sm" />
    <div class="flex flex-wrap gap-2">
      {#each ['applicant', 'accepted_student', 'student', 'staff', 'admin'] as role}
        <label class="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs">
          <input type="checkbox" value={role} checked={audienceRoles.includes(role)} onchange={(e) => {
            if (e.currentTarget.checked) audienceRoles = [...audienceRoles, role]
            else audienceRoles = audienceRoles.filter((r) => r !== role)
          }} />
          {role.replace('_', ' ')}
        </label>
      {/each}
    </div>
    <div class="flex gap-4">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={isFeatured} />
        Featured
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={isActive} />
        Active
      </label>
    </div>
    <div class="flex gap-2">
      <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
      {#if editing}
        <Button variant="ghost" onclick={resetForm}>Cancel</Button>
      {/if}
    </div>
    {#if message}
      <p class="text-xs text-text-muted">{message}</p>
    {/if}
  </form>

  <!-- List -->
  <ToolGrid tools={app.data?.tools || []} />
</div>
