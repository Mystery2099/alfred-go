<script lang="ts">
  import { page } from '$app/stores'
  import { Home, AlertTriangle } from 'lucide-svelte'

  const status = $derived($page.status)
  const message = $derived($page.error?.message || 'Something went wrong')
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
  <div class="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
    <AlertTriangle class="h-8 w-8 text-text-muted" />
  </div>
  <h1 class="text-4xl font-extrabold text-link">{status}</h1>
  <p class="mt-2 max-w-xs text-base text-text-muted">{message}</p>
  <a href="/" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-link px-6 py-3 text-sm font-bold text-white transition hover:bg-link/90">
    <Home class="h-4 w-4" />
    Go home
  </a>
</div>
