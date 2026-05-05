<script lang="ts">
  import { ChevronRight } from 'lucide-svelte'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    title: string
    sectionKey: string
    count?: number
    defaultOpen?: boolean
    children: Snippet
  }

  let { title, sectionKey, count, defaultOpen = true, children }: Props = $props()

  function loadState(): boolean {
    if (typeof window === 'undefined') return defaultOpen
    try {
      const stored = localStorage.getItem(`alfredgo_section_${sectionKey}`)
      return stored !== null ? stored === 'true' : defaultOpen
    } catch {
      return defaultOpen
    }
  }

  const initialOpen = () => defaultOpen
  let isOpen = $state(initialOpen())

  onMount(() => {
    isOpen = loadState()
  })

  function toggle() {
    isOpen = !isOpen
    if (typeof window !== 'undefined') {
      localStorage.setItem(`alfredgo_section_${sectionKey}`, String(isOpen))
    }
  }
</script>

<section>
  <button
    class="group flex w-full items-center justify-between py-1"
    onclick={toggle}
    aria-expanded={isOpen}
  >
    <div class="flex items-center gap-2">
      <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-link">{title}</p>
      {#if count !== undefined}
        <span class="rounded-full bg-selected px-2 py-0.5 text-[10px] font-extrabold text-link">{count}</span>
      {/if}
    </div>
    <ChevronRight class="h-4 w-4 text-text-soft transition duration-200 {isOpen ? 'rotate-90' : ''}" />
  </button>

  {#if isOpen}
    <div class="mt-3">
      {@render children()}
    </div>
  {/if}
</section>
