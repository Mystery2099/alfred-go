<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    title: string
    children?: Snippet
    class?: string
    action?: Snippet
  }

  let { title, children, class: className = '', action }: Props = $props()
</script>

<div class="mb-6 {className}">
  <div class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-extrabold uppercase tracking-wider text-text-muted">{title}</h2>
    {#if action}
      {@render action()}
    {/if}
  </div>
  {#if children}
    {@render children()}
  {/if}
</div>
