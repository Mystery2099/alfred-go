<script lang="ts">
  interface Props {
    children: import('svelte').Snippet
    variant?: 'default' | 'outline' | 'secondary' | 'destructive'
    class?: string
  }

  let { children, variant = 'default', class: className = '' }: Props = $props()

  const variants = {
    default: 'bg-primary/10 text-primary border border-primary/20',
    outline: 'border border-border text-text-muted bg-transparent',
    secondary: 'bg-muted text-text border border-border',
    destructive: 'bg-campus-red/10 text-campus-red border border-campus-red/20',
  }
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {variants[variant]} {className}">
  {@render children()}
</span>
