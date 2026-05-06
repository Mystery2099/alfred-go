<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    title: string
    body: string
    icon: any
    tone?: 'tone-0' | 'tone-1' | 'tone-2' | 'tone-3'
    border?: boolean
    as?: 'div' | 'button' | 'a'
    href?: string | null
    external?: boolean
    type?: 'button' | 'submit'
    disabled?: boolean
    ariaPressed?: boolean
    ariaLabel?: string
    class?: string
    onclick?: (event: MouseEvent) => void
    action?: Snippet
  }

  let {
    title,
    body,
    icon,
    tone = 'tone-0',
    border = false,
    as = 'div',
    href = null,
    external = false,
    type = 'button',
    disabled = false,
    ariaPressed,
    ariaLabel,
    class: className = '',
    onclick,
    action,
  }: Props = $props()
</script>

{#snippet rowContent()}
  {@const Icon = icon}
  <span class="profile-icon {tone} shrink-0"><Icon class="h-5 w-5" /></span>
  <span class="min-w-0 flex-1 text-left">
    <b>{title}</b>
    <small>{body}</small>
  </span>
  {#if action}
    {@render action()}
  {/if}
{/snippet}

{#if as === 'a' && href}
  <a
    {href}
    target={external || href.startsWith('http') ? '_blank' : undefined}
    rel={external || href.startsWith('http') ? 'noopener noreferrer' : undefined}
    class="profile-row {border ? 'border-t border-border' : ''} {className}"
  >
    {@render rowContent()}
  </a>
{:else if as === 'button'}
  <button
    {type}
    {disabled}
    aria-pressed={ariaPressed}
    aria-label={ariaLabel}
    class="profile-row {border ? 'border-t border-border' : ''} {className}"
    {onclick}
  >
    {@render rowContent()}
  </button>
{:else}
  <div class="profile-row {border ? 'border-t border-border' : ''} {className}">
    {@render rowContent()}
  </div>
{/if}
