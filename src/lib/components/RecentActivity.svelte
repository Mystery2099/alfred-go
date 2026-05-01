<script lang="ts">
  import Icon from './shared/Icon.svelte'

  const recent = [
    ['My Learning', 'Checked coursework', '2 min ago', 'BookOpen'],
    ['DegreeWorks', 'Viewed degree audit', '1 hour ago', 'GraduationCap'],
    ['Outlook Email', 'Checked campus email', '3 hours ago', 'Mail']
  ] as const
</script>

<section>
  <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-link">Recent</p>
  <div class="grid gap-3 md:grid-cols-3">
    {#each recent as [title, body, time, icon]}
      <button class="recent-card hover:shadow-sm">
        <span class="quick-icon tone-0"><Icon name={icon} /></span>
        <span class="min-w-0 flex-1 text-left">
          <b>{title}</b>
          <small>{body}</small>
        </span>
        <span class="text-xs font-medium text-text-muted">{time}</span>
      </button>
    {/each}
  </div>
</section>
