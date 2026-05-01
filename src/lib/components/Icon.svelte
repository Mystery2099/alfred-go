<script lang="ts">
  import { getIcon } from '$lib/app-state.svelte'
  import type { Component } from 'svelte'

  interface Props {
    name: string
    class?: string
  }

  let { name, class: className = '' }: Props = $props()

  const Icon = $derived(getIcon(name) as Component<{ class?: string }>)
</script>

<Icon class={className} />
