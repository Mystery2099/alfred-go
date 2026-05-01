<script lang="ts">
  import { getAppState } from '$lib/app-state.svelte'
  import Icon from './Icon.svelte'

  interface Props {
    tool: import('$lib/types').Tool
    tone: number
  }

  let { tool, tone }: Props = $props()
  const app = getAppState()

  const badges = ['Coursework', 'Registration', 'Financial aid', 'Email', 'Support', 'Student life']
</script>

<a
  href="/tools/{tool.id}"
  class="quick-card"
>
  <span class="quick-icon tone-{tone}"><Icon name={tool.icon} /></span>
  <span class="min-w-0 flex-1 text-left">
    <span class="block text-base font-extrabold text-text">{tool.name}</span>
    <span class="mt-1 block truncate text-sm text-text-muted opacity-80">{tool.description}</span>
    <span class="mt-5 inline-flex rounded-full px-3 py-1 text-xs font-extrabold" style="background-color: var(--app-badge-bg); color: var(--app-badge-text)">{badges[tone]}</span>
  </span>
</a>
