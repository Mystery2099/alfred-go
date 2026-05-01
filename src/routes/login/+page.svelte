<script lang="ts">
  import { getAppState, roleLabels } from '$lib/app-state.svelte'
  import { LockKeyhole, LogIn, Mail } from 'lucide-svelte'

  let { data, form } = $props()
  const app = getAppState()

  let email = $state('student@alfredgo.local')
  let password = $state('StudentGo2026!')

  $effect(() => {
    if (form?.email) email = form.email
  })

  function defaultPasswordForRole(role: string) {
    const passwords: Record<string, string> = {
      applicant: 'ApplicantGo2026!',
      accepted_student: 'AcceptedGo2026!',
      student: 'StudentGo2026!',
      staff: 'StaffGo2026!',
      admin: 'AdminGo2026!',
    }
    return passwords[role] || ''
  }

</script>

<section class="mx-auto grid max-w-5xl gap-6 py-4 lg:grid-cols-[1fr_360px] lg:items-start">
  <div class="space-y-5">
    <div>
      <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Secure prototype access</p>
      <h2 class="mt-1 text-2xl font-extrabold text-link">Sign in to AlfredGO</h2>
    </div>
    <p class="max-w-2xl text-sm leading-6 text-text-muted">
      Use one of the seeded prototype accounts. Authentication is backed by SQLite credentials and an HTTP-only session cookie.
    </p>
    <div class="grid gap-3 sm:grid-cols-2">
      {#each data.users || [] as user}
        <button
          class="rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-campus-blue/20"
          onclick={() => {
            email = user.email || ''
            password = defaultPasswordForRole(user.role)
          }}
          type="button"
        >
          <p class="font-extrabold text-link">{roleLabels[user.role]}</p>
          <p class="mt-1 text-sm text-text-muted">{user.email}</p>
        </button>
      {/each}
    </div>
  </div>

  <form class="rounded-xl border border-border bg-surface p-5 shadow-sm" method="POST">
    <h2 class="text-lg font-extrabold text-link">Account login</h2>
    <label class="mt-5 block">
      <span class="text-sm font-bold text-text-muted">Email</span>
      <span class="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-muted px-3 py-3 focus-within:border-campus-blue focus-within:ring-2 focus-within:ring-campus-blue/20">
        <Mail class="h-5 w-5 text-text-muted" />
        <input class="w-full bg-transparent text-sm outline-none" name="email" type="email" autocomplete="username" bind:value={email} required />
      </span>
    </label>
    <label class="mt-4 block">
      <span class="text-sm font-bold text-text-muted">Password</span>
      <span class="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-muted px-3 py-3 focus-within:border-campus-blue focus-within:ring-2 focus-within:ring-campus-blue/20">
        <LockKeyhole class="h-5 w-5 text-text-muted" />
        <input class="w-full bg-transparent text-sm outline-none" name="password" type="password" autocomplete="current-password" bind:value={password} required />
      </span>
    </label>
    {#if form?.authError || app.authError}
      <p class="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{form?.authError || app.authError}</p>
    {/if}
    <button class="primary-button mt-5 w-full" type="submit">
      <LogIn class="h-4 w-4" />
      Sign in
    </button>
  </form>
</section>
