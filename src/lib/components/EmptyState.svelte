<script lang="ts">
  import { Search } from 'lucide-svelte'

  interface Props {
    title?: string
    message?: string
    icon?: any
    class?: string
  }

  let {
    title = 'Nothing here yet',
    message = 'Try adjusting your filters or search.',
    icon: Icon = Search,
    class: className = '',
  }: Props = $props()
</script>

<div class="flex flex-col items-center justify-center py-12 text-center {className}">
  <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-text-soft">
    <Icon class="h-7 w-7" />
  </div>
  <h3 class="text-base font-extrabold text-text">{title}</h3>
  <p class="mt-1 max-w-xs text-sm text-text-muted">{message}</p>
</div>
