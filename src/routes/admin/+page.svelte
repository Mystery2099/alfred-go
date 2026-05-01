<script lang="ts">
  import { goto } from '$app/navigation'
  import { ShieldCheck, Wrench, GraduationCap } from 'lucide-svelte'
  import SectionTitle from '$lib/components/SectionTitle.svelte'
  import Card from '$lib/components/Card.svelte'

  const cards = [
    { href: '/admin/tools', label: 'Manage Tools', description: 'Add, edit, and organize campus tools.', icon: Wrench },
    { href: '/admin/categories', label: 'Manage Categories', description: 'Organize tools into categories.', icon: GraduationCap },
  ]
</script>

<div class="p-4 md:p-8">
  <div class="mb-6 flex items-center gap-3">
    <ShieldCheck class="h-8 w-8 text-link" />
    <SectionTitle>Admin Dashboard</SectionTitle>
  </div>
  <p class="mb-6 text-sm text-text-muted">Manage AlfredGO content and configuration.</p>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {#each cards as card}
      <a href={card.href} class="group">
        <Card class="transition hover:border-link/30 hover:shadow-md">
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-link/10 text-link">
              <card.icon class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-extrabold text-text group-hover:text-link transition-colors">{card.label}</h3>
              <p class="mt-1 text-xs text-text-muted">{card.description}</p>
            </div>
          </div>
        </Card>
      </a>
    {/each}
  </div>
</div>
