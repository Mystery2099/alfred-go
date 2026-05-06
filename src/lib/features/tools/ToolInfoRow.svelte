<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    icon: any
    label: string
    children: Snippet
    href?: string | null
    external?: boolean
    action?: Snippet
  }

  let { icon, label, children, href = null, external = false, action }: Props = $props()
  const Icon = $derived(icon)
  const isExternal = $derived(external || !!href?.startsWith('http'))
</script>

{#snippet rowContent()}
  <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-link transition duration-200 group-hover:scale-105">
    <Icon class="h-5 w-5" />
  </div>
  <div class="min-w-0 flex-1">
    <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">{label}</span>
    {@render children()}
  </div>
  {#if action}
    {@render action()}
  {/if}
{/snippet}

{#if href}
  <a
    {href}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noopener noreferrer' : undefined}
    class="group flex items-center gap-4 px-6 py-4 transition duration-200 ease-out hover:bg-muted active:scale-[0.995] sm:px-8"
  >
    {@render rowContent()}
  </a>
{:else}
  <div class="flex items-center gap-4 px-6 py-4 sm:px-8">
    {@render rowContent()}
  </div>
{/if}
