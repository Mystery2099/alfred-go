<script lang="ts">
  import { enhance } from '$app/forms'
  import { Trash2 } from 'lucide-svelte'
  import AdminIconButton from './AdminIconButton.svelte'

  interface Props {
    action: string
    fieldName: string
    id: string
    label: string
    size?: 'sm' | 'md'
  }

  let { action, fieldName, id, label, size = 'sm' }: Props = $props()
</script>

<form method="POST" {action} use:enhance>
  <input type="hidden" name={fieldName} value={id} />
  <AdminIconButton type="submit" icon={Trash2} tone="danger" {label} {size} />
</form>
