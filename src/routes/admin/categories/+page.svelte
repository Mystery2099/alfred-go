<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import { Plus, Trash2 } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import Button from '$lib/components/Button.svelte'
  import Badge from '$lib/components/Badge.svelte'

  const app = getAppState()

  let name = $state('')
  let description = $state('')
  let glyph = $state('Globe')
  let message = $state('')

  async function saveCategory(e: Event) {
    e.preventDefault()
    const payload = {
      id: crypto.randomUUID(),
      name,
      description,
      glyph,
      sortOrder: app.categories.length,
    }
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      message = 'Category created.'
      name = ''
      description = ''
      glyph = 'Globe'
      const dataRes = await fetch('/api/data')
      const data = await dataRes.json()
      app.hydrate({ ...data, authUserId: app.userId })
    } else {
      message = 'Failed to create category.'
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return
    const res = await fetch('/api/categories', {
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
</script>

<div class="p-4 md:p-8">
  <SectionTitle>Manage Categories</SectionTitle>
  <p class="mb-6 text-sm text-text-muted">Organize tools into categories.</p>

  <!-- Create form -->
  <form onsubmit={saveCategory} class="card mb-6 flex flex-col gap-3 p-4">
    <h3 class="text-sm font-extrabold text-text">New Category</h3>
    <input bind:value={name} placeholder="Name" required class="h-10 rounded-lg border border-border bg-muted px-3 text-sm" />
    <input bind:value={description} placeholder="Description" class="h-10 rounded-lg border border-border bg-muted px-3 text-sm" />
    <input bind:value={glyph} placeholder="Icon name (e.g. Globe, Star)" class="h-10 rounded-lg border border-border bg-muted px-3 text-sm" />
    <Button type="submit">
      <Plus class="h-4 w-4" />
      Create Category
    </Button>
    {#if message}
      <p class="text-xs text-text-muted">{message}</p>
    {/if}
  </form>

  <!-- List -->
  <div class="flex flex-col gap-2">
    {#each app.categories as cat}
      <div class="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <div>
          <p class="font-bold text-sm text-text">{cat.name}</p>
          <p class="text-xs text-text-muted">{cat.description || 'No description'}</p>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="outline">Order: {cat.sortOrder}</Badge>
          <button onclick={() => deleteCategory(cat.id)} class="rounded-lg p-1.5 text-text-muted hover:bg-campus-red/10 hover:text-campus-red transition">
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>
