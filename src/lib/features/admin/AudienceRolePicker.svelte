<script lang="ts">
  import { roleLabels, roles } from '$lib/app-state.svelte'
  import type { Role } from '$lib/types'

  interface Props {
    selected: Role[]
    onChange: (roles: Role[]) => void
    class?: string
  }

  let { selected, onChange, class: className = '' }: Props = $props()

  function toggleRole(role: Role, checked: boolean) {
    onChange(checked ? [...selected, role] : selected.filter((item) => item !== role))
  }
</script>

<div class="flex flex-wrap gap-2 {className}">
  {#each roles as role (role)}
    <label class="segmented {selected.includes(role) ? 'active' : ''}">
      <input
        class="sr-only"
        type="checkbox"
        name="audienceRoles"
        value={role}
        checked={selected.includes(role)}
        onchange={(event) => toggleRole(role, event.currentTarget.checked)}
      />
      {roleLabels[role]}
    </label>
  {/each}
</div>
