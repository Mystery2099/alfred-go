<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children: Snippet
    class?: string
    onclick?: () => void
  }

  let { children, class: className = '', onclick }: Props = $props()
</script>

{#if onclick}
  <button class="card p-5 text-left w-full {className}" onclick={onclick}>
    {@render children()}
  </button>
{:else}
  <div class="card p-5 {className}">
    {@render children()}
  </div>
{/if}
