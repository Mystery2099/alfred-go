<script lang="ts">
  import { HelpCircle } from 'lucide-svelte'
  import type { ToolOnboardingGuide } from '$lib/onboarding'

  interface Props {
    guide: ToolOnboardingGuide
  }

  let { guide }: Props = $props()
</script>

<section class="overflow-hidden rounded-[28px] bg-surface shadow-sm ring-1 ring-border" aria-labelledby="tool-onboarding-title">
  <div class="flex items-start gap-4 px-5 py-5 sm:px-6">
    <div class="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-selected text-link">
      <HelpCircle class="h-5 w-5" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-xs font-extrabold uppercase tracking-[0.16em] text-text-soft">New here?</p>
      <h2 id="tool-onboarding-title" class="mt-0.5 text-lg font-extrabold leading-tight text-text">{guide.label}</h2>
      <div class="mt-4 space-y-3">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-wide text-text-soft">What this is</p>
          <p class="mt-1 text-sm leading-6 text-text">{guide.what}</p>
        </div>
        <div>
          <p class="text-xs font-extrabold uppercase tracking-wide text-text-soft">When to use it</p>
          <p class="mt-1 text-sm leading-6 text-text-muted">{guide.useWhen}</p>
        </div>
        <div class="rounded-[20px] bg-muted px-4 py-3">
          <p class="text-xs font-extrabold uppercase tracking-wide text-text-soft">First step</p>
          <p class="mt-1 text-sm font-semibold leading-6 text-text">{guide.firstStep}</p>
        </div>
      </div>
    </div>
  </div>
</section>
