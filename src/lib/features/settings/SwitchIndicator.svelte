<script lang="ts">
  interface Props {
    checked: boolean
    disabled?: boolean
  }

  let { checked, disabled = false }: Props = $props()
</script>

<span class="h-6 w-10 shrink-0 rounded-full p-0.5 transition {checked ? 'bg-campus-blue' : 'bg-border'} {disabled ? 'opacity-50' : ''}">
  <span class="block h-5 w-5 rounded-full bg-white transition {checked ? 'translate-x-4' : ''}"></span>
</span>
