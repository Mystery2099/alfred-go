<script lang="ts">
  interface Props {
    count?: number
    title?: string
  }
  let { count = 3, title = 'Loading...' }: Props = $props()
</script>

<section class="space-y-3">
  <div class="mb-3 h-3 w-24 rounded bg-campus-blue/10 dark:bg-campus-blue/20"></div>
  <div class="divide-y divide-border rounded-2xl bg-surface shadow-sm ring-1 ring-border overflow-hidden">
    {#each Array(count) as _, i}
      <div class="flex items-center gap-4 px-5 py-4 animate-pulse">
        <div class="h-10 w-10 shrink-0 rounded-xl bg-campus-blue/10 dark:bg-campus-blue/20"></div>
        <div class="min-w-0 flex-1 space-y-2">
          <div class="h-4 w-1/3 rounded bg-campus-blue/10 dark:bg-campus-blue/20"></div>
          <div class="h-3 w-2/3 rounded bg-muted"></div>
        </div>
      </div>
    {/each}
  </div>
</section>
