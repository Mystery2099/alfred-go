<script lang="ts">
  import { ClipboardCheck, GraduationCap, HelpCircle } from 'lucide-svelte'
  import type { Role } from '$lib/types'
  import type { CommandPaletteOnboarding } from '$lib/onboarding'

  interface Props {
    onboarding: CommandPaletteOnboarding
    role: Role
    onSuggestion: (value: string) => void
  }

  let { onboarding, role, onSuggestion }: Props = $props()
</script>

<section class="border-b border-border px-4 py-4 sm:px-5" aria-labelledby="command-help-title">
  <div class="flex items-start gap-3">
    <div class="grid h-10 w-10 shrink-0 place-items-center rounded-[18px] bg-selected text-link">
      {#if role === 'applicant'}
        <ClipboardCheck class="h-5 w-5" />
      {:else if role === 'accepted_student'}
        <GraduationCap class="h-5 w-5" />
      {:else}
        <HelpCircle class="h-5 w-5" />
      {/if}
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-xs font-extrabold uppercase tracking-[0.16em] text-text-soft">Command Palette</p>
      <h2 id="command-help-title" class="mt-0.5 text-base font-extrabold leading-tight text-text">{onboarding.title}</h2>
      <p class="mt-1 text-sm leading-5 text-text-muted">{onboarding.body}</p>
    </div>
  </div>

  <div class="mt-4 flex flex-wrap gap-2" aria-label="Suggested searches">
    {#each onboarding.suggestions as suggestion (suggestion)}
      <button
        type="button"
        class="min-h-9 rounded-full bg-muted px-3 py-1.5 text-xs font-extrabold text-link transition hover:bg-selected active:scale-[0.98]"
        onclick={() => onSuggestion(suggestion)}
      >
        {suggestion}
      </button>
    {/each}
  </div>
</section>
