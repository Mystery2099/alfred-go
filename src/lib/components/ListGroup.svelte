<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children: Snippet
    divided?: boolean
    as?: 'div' | 'section'
    class?: string
  }

  let { children, divided = true, as = 'div', class: className = '' }: Props = $props()
  const classes = $derived(`${divided ? 'divide-y divide-border ' : ''}overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border ${className}`)
</script>

{#if as === 'section'}
  <section class={classes}>
    {@render children()}
  </section>
{:else}
  <div class={classes}>
    {@render children()}
  </div>
{/if}
