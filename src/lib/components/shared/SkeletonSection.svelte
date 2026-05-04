<script lang="ts">
  import SkeletonCard from './SkeletonCard.svelte'

  interface Props {
    count?: number
    title?: string
  }
  let { count = 3, title = 'Loading...' }: Props = $props()
</script>

<section class="space-y-3">
  <div class="mb-3 h-3 w-24 rounded bg-campus-blue/10 dark:bg-campus-blue/20"></div>
  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {#each Array(count) as _, i}
      <SkeletonCard />
    {/each}
  </div>
</section>
