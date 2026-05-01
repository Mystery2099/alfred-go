<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children: Snippet
    class?: string
  }

  let { children, class: className = '' }: Props = $props()
</script>

<h1 class="mb-1 text-2xl font-extrabold text-link md:text-3xl {className}">
  {@render children()}
</h1>
