<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    href: string
    children: Snippet
    class?: string
    external?: boolean
  }

  let { href, children, class: className = '', external = false }: Props = $props()
</script>

{#if external || href.startsWith('http')}
  <a {href} target="_blank" rel="noopener noreferrer" class={className}>
    {@render children()}
  </a>
{:else}
  <a {href} class={className}>
    {@render children()}
  </a>
{/if}
