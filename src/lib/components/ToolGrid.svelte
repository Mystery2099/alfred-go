<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import ToolRow from './ToolRow.svelte'
  import EmptyState from './EmptyState.svelte'
  import type { Tool } from '$lib/types'

  interface Props {
    tools?: Tool[]
  }

  let { tools }: Props = $props()
  const app = getAppState()

  const displayTools = $derived(tools ?? app.filteredTools)
</script>

{#if displayTools.length > 0}
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#each displayTools as tool}
      <ToolRow {tool} />
    {/each}
  </div>
{:else}
  <EmptyState />
{/if}
