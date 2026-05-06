<script lang="ts">
  import { enhance } from '$app/forms'
  import { getAppState } from '$lib/app-state.svelte'
  import { Heart } from 'lucide-svelte'

  interface Props {
    toolId: string
    toolName: string
    variant?: 'hero' | 'grid' | 'inline'
  }

  let { toolId, toolName, variant = 'grid' }: Props = $props()
  const app = getAppState()

  const isFavorite = $derived(app.isFavorite(toolId))

  function optimisticFavoriteEnhance() {
    app.optimisticToggleFavorite(toolId)
    return async ({ result }: { result: { type: string } }) => {
      if (result.type === 'failure') app.optimisticToggleFavorite(toolId)
    }
  }
</script>

<form method="POST" action="?/toggleFavorite" use:enhance={optimisticFavoriteEnhance} class={variant === 'hero' ? 'inline-flex' : undefined}>
  <input type="hidden" name="toolId" value={toolId} />
  {#if variant === 'hero'}
    <button
      type="submit"
      class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-extrabold text-link transition duration-150 hover:bg-muted active:scale-[0.97]"
    >
      <Heart class="h-4 w-4 {isFavorite ? 'fill-campus-gold text-campus-gold' : ''}" />
      {isFavorite ? 'Saved' : 'Save'}
    </button>
  {:else if variant === 'inline'}
    <button
      type="submit"
      aria-label={isFavorite ? `Remove ${toolName} from favorites` : `Add ${toolName} to favorites`}
      class="shrink-0 transition-colors {isFavorite ? 'text-campus-gold' : 'text-text-soft hover:text-campus-gold'}"
    >
      <Heart class="h-4 w-4 {isFavorite ? 'fill-current' : ''}" />
    </button>
  {:else}
    <button
      type="submit"
      aria-label={isFavorite ? `Remove ${toolName} from favorites` : `Add ${toolName} to favorites`}
      class="grid h-9 w-9 place-items-center rounded-xl text-text-muted transition duration-150 hover:scale-110 hover:bg-muted active:scale-90"
    >
      <Heart class="h-5 w-5 {isFavorite ? 'fill-campus-gold text-campus-gold' : 'text-text-soft'}" />
    </button>
  {/if}
</form>
