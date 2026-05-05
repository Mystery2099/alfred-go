<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState } from '$lib/app-state.svelte'
  import { Trash2 } from 'lucide-svelte'

  const app = getAppState()
  let name = $state('')
  let formError = $state<string | null>(null)
  let submitting = $state(false)

  function resetName() {
    name = ''
    formError = null
  }
</script>

{#if app.currentRole !== 'admin'}
  <div class="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
    <h3 class="text-xl font-extrabold">Admin access required</h3>
    <p class="mt-2 text-text-muted">Sign in with an admin account to manage categories.</p>
  </div>
{:else}
  <section class="space-y-5">
    <div>
      <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Admin</p>
      <h2 class="mt-1 text-2xl font-extrabold text-link">Manage categories</h2>
    </div>
    <form method="POST" action="?/saveCategory" use:enhance={() => {
      submitting = true
      return async ({ result, update }) => {
        submitting = false
        if (result.type === 'success' && result.data?.ok === false && result.data?.error) {
          formError = String(result.data.error)
          return
        }
        formError = null
        await update()
        resetName()
      }
    }} class="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 class="mb-4 font-extrabold">New category</h3>
      {#if formError}
        <div class="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {formError}
        </div>
      {/if}
      <input type="hidden" name="id" value={name.toLowerCase().replace(/[^a-z0-9]+/g, '-')} />
      <input type="hidden" name="description" value="" />
      <input type="hidden" name="sortOrder" value={app.categories.length * 10 + 10} />
      <div class="flex gap-3">
        <input class="control flex-1" name="name" placeholder="Category name" bind:value={name} />
        <button class="primary-button" disabled={submitting}>
          {#if submitting}
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          {/if}
          Save
        </button>
      </div>
    </form>
    <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
      {#each app.categories as category}
        <div class="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-muted">
          <div class="min-w-0 flex-1">
            <span class="font-bold text-text">{category.name}</span>
            <p class="text-sm text-text-muted">{category.description || 'No description'}</p>
          </div>
          <form method="POST" action="?/deleteCategory" use:enhance>
            <input type="hidden" name="categoryId" value={category.id} />
            <button title="Delete category" type="submit" class="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition hover:bg-rose-100 hover:text-rose-600" aria-label="Delete {category.name} category">
              <Trash2 class="h-4 w-4" />
            </button>
          </form>
        </div>
      {/each}
    </div>
  </section>
{/if}
