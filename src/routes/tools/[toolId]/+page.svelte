<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import { getAppState, roleLabels } from '$lib/app-state.svelte'
  import Icon from '$lib/components/shared/Icon.svelte'

  const app = getAppState()
  const toolId = $derived($page.params.toolId)
  const tool = $derived(app.visibleTools.find((item) => item.id === toolId))
</script>

{#if tool}
  <section class="grid gap-5 lg:grid-cols-[1fr_320px]">
    <article class="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <span class="grid h-14 w-14 place-items-center rounded-2xl bg-campus-blue text-white">
        <Icon name={tool.icon || 'Grid2X2'} class="h-7 w-7" />
      </span>
      <h2 class="mt-5 text-3xl font-extrabold">{tool.name}</h2>
      <p class="mt-3 text-lg text-text-muted">{tool.description}</p>
      <div class="mt-6 flex flex-wrap gap-2">
        {#each tool.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
      <div class="mt-8 flex flex-wrap gap-3">
        <button class="primary-button" onclick={() => app.launchTool(tool)}>Launch tool</button>
        <form method="POST" action="?/toggleFavorite" use:enhance>
          <input type="hidden" name="toolId" value={tool.id} />
          <button class="secondary-button">{app.favoriteIds.has(tool.id) ? 'Remove favorite' : 'Add favorite'}</button>
        </form>
      </div>
    </article>
    <aside class="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <p class="text-sm font-bold uppercase tracking-wider text-text-muted">Details</p>
      <dl class="mt-4 space-y-4 text-sm">
        <div><dt class="font-bold">Category</dt><dd>{app.categoryName(tool.categoryId)}</dd></div>
        <div><dt class="font-bold">Audience</dt><dd>{tool.audienceRoles.map((role) => roleLabels[role]).join(', ')}</dd></div>
        <div><dt class="font-bold">Status</dt><dd>{tool.isActive ? 'Active' : 'Inactive'}</dd></div>
      </dl>
    </aside>
  </section>
{:else}
  <div class="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
    <h3 class="text-xl font-extrabold">Tool not found</h3>
    <p class="mt-2 text-text-muted">This resource may not exist, may be inactive, or may not be visible for your current role view.</p>
  </div>
{/if}
