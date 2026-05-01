<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState, roleLabels, roles } from '$lib/app-state.svelte'
  import type { Tool } from '$lib/types'
  import { Plus } from 'lucide-svelte'
  import ToolGrid from '$lib/components/shared/ToolGrid.svelte'

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

  function resetDraft() {
    draft = emptyTool()
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
    <form method="POST" action="?/saveTool" use:enhance={() => async ({ update }) => { await update(); resetDraft() }} class="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 class="mb-4 font-extrabold">Tool editor</h3>
      <input type="hidden" name="id" value={draft.id} />
      <input type="hidden" name="icon" value={draft.icon || 'Grid2X2'} />
      <input type="hidden" name="isActive" value="on" />
      <div class="grid gap-3 md:grid-cols-2">
        <input class="control" name="name" placeholder="Name" bind:value={draft.name} />
        <input class="control" name="url" placeholder="URL" bind:value={draft.url} />
        <select class="control" name="categoryId" bind:value={draft.categoryId}>
          {#each app.categories as category}
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
      <div class="mt-3 flex flex-wrap gap-2">
        {#each roles as role}
          <label class="segmented {draft.audienceRoles.includes(role) ? 'active' : ''}">
            <input
              class="sr-only"
              type="checkbox"
              name="audienceRoles"
              value={role}
              checked={draft.audienceRoles.includes(role)}
              onchange={(event) => draft.audienceRoles = event.currentTarget.checked ? [...draft.audienceRoles, role] : draft.audienceRoles.filter((item) => item !== role)}
            />
            {roleLabels[role]}
          </label>
        {/each}
      </div>
      <div class="mt-4 flex gap-3">
        <button class="primary-button"><Plus class="h-4 w-4" /> Save tool</button>
      </div>
    </form>
    <ToolGrid tools={app.data?.tools || []} admin />
  </section>
{/if}
