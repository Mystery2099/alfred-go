<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { MouseEventHandler } from 'svelte/elements'

  interface Props {
    children: Snippet
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    href?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    class?: string
    onclick?: MouseEventHandler<HTMLButtonElement>
  }

  let {
    children,
    variant = 'primary',
    size = 'md',
    href,
    type = 'button',
    disabled = false,
    class: className = '',
    onclick,
  }: Props = $props()

  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-link/40 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-link text-white hover:bg-link/90 shadow-sm',
    secondary: 'bg-muted text-text hover:bg-muted/80 border border-border',
    ghost: 'text-text-muted hover:text-link hover:bg-muted/50',
    danger: 'bg-campus-red text-white hover:bg-campus-red/90',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  let classes = $derived(`${base} ${variants[variant]} ${sizes[size]} ${className}`)
</script>

{#if href}
  <a {href} class={classes}>
    {@render children()}
  </a>
{:else}
  <button {type} {disabled} {onclick} class={classes}>
    {@render children()}
  </button>
{/if}
