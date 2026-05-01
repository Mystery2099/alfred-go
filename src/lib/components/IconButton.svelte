<script lang="ts">
  import type { Component } from 'svelte'
  import type { MouseEventHandler } from 'svelte/elements'

  interface Props {
    icon: Component
    label: string
    active?: boolean
    onclick?: MouseEventHandler<HTMLButtonElement>
  }

  let { icon: Icon, label, active = false, onclick }: Props = $props()
</script>

<button
  onclick={onclick}
  class="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 {active ? 'text-link bg-selected' : 'text-text-muted hover:text-link hover:bg-muted/50'}"
  aria-label={label}
>
  <Icon class="h-5 w-5" />
  <span>{label}</span>
</button>
