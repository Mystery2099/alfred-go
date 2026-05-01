<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState } from '$lib/app-state.svelte'

  const app = getAppState()
  let name = $state('')

  function resetName() {
    name = ''
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
    <form method="POST" action="?/saveCategory" use:enhance={() => async ({ update }) => { await update(); resetName() }} class="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 class="mb-4 font-extrabold">New category</h3>
      <input type="hidden" name="id" value={name.toLowerCase().replace(/[^a-z0-9]+/g, '-')} />
      <input type="hidden" name="description" value="" />
      <input type="hidden" name="sortOrder" value={app.categories.length * 10 + 10} />
      <div class="flex gap-3">
        <input class="control flex-1" name="name" placeholder="Category name" bind:value={name} />
        <button class="primary-button">Save</button>
      </div>
    </form>
    <div class="grid gap-3 md:grid-cols-2">
      {#each app.categories as category}
        <div class="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <b>{category.name}</b>
          <p class="text-sm text-text-muted">{category.description || 'No description'}</p>
        </div>
      {/each}
    </div>
  </section>
{/if}
