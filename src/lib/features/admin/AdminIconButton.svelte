<script lang="ts">
  interface Props {
    icon: any
    label: string
    title?: string
    tone?: 'neutral' | 'danger'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit'
    onclick?: (event: MouseEvent) => void
  }

  let {
    icon,
    label,
    title = label,
    tone = 'neutral',
    size = 'sm',
    type = 'button',
    onclick,
  }: Props = $props()

  const sizeClass = $derived(size === 'md' ? 'h-9 w-9 rounded-xl' : 'h-8 w-8 rounded-lg')
  const toneClass = $derived(
    tone === 'danger'
      ? 'hover:bg-rose-100 hover:text-rose-600'
      : 'hover:bg-muted hover:text-link'
  )
  const Icon = $derived(icon)
</script>

<button
  {type}
  {title}
  aria-label={label}
  class="grid place-items-center text-text-muted transition {sizeClass} {toneClass}"
  {onclick}
>
  <Icon class="h-4 w-4" />
</button>
