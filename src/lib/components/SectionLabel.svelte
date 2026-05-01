<script lang="ts">
  interface Props {
    children: import('svelte').Snippet
    class?: string
  }

  let { children, class: className = '' }: Props = $props()
</script>

<span class="mb-2 inline-block rounded-lg bg-muted px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-text-muted {className}">
  {@render children()}
</span>
