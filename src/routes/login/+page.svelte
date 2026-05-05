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

<div class="grid min-h-[100dvh] grid-rows-[1fr_auto] lg:grid-cols-3">
  <!-- Left: Hero image -->
  <div class="relative overflow-hidden lg:col-span-2">
    <img
      src="/suny-alfred-state-college-technology_708_gallery1.webp"
      alt="Alfred State College"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <!-- Gradient overlay - subtle so image shows through -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#003C71]/80 via-[#00203C]/60 to-[#003C71]/40"></div>

    <!-- Content overlay -->
    <div class="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
      <div class="flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-full bg-[#00203C] shadow-lg">
          <img src="/icons/alfred-state-logo-A.svg" alt="" class="h-6 w-6" />
        </span>
        <span class="text-sm font-bold text-white/90">AlfredGO</span>
      </div>

      <div class="max-w-md">
        <h1 class="text-4xl font-extrabold leading-tight text-white lg:text-5xl">
          Welcome to<br/>Alfred State
        </h1>
        <p class="mt-4 text-base leading-relaxed text-white/80">
          Your gateway to campus tools, resources, and services.
        </p>
      </div>
    </div>
  </div>

  <!-- Right: Login form -->
  <div class="flex w-full flex-col justify-center bg-[var(--app-bg)] p-6 lg:col-span-1 lg:p-16 xl:p-20">
    <div class="mx-auto w-full max-w-lg">
      <!-- Mobile-only header -->
      <div class="mb-6 lg:hidden">
        <h2 class="text-2xl font-extrabold text-[var(--app-text)]">Sign in</h2>
        <p class="mt-1 text-sm text-[var(--app-text-muted)]">Use your prototype account</p>
      </div>

      <!-- Desktop header -->
      <div class="mb-8 hidden lg:block">
        <h2 class="text-2xl font-extrabold text-[var(--app-text)]">Sign in</h2>
        <p class="mt-1 text-sm text-[var(--app-text-muted)]">Prototype accounts use local credentials. Use the cards below to auto-fill.</p>
      </div>

      <form class="space-y-5" method="POST">
        <!-- Email -->
        <div class="space-y-2">
          <label class="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--app-text-muted)]" for="email">
            Email
          </label>
          <div class="flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-4 shadow-sm transition focus-within:border-campus-blue focus-within:ring-2 focus-within:ring-campus-blue/20">
            <Mail class="h-5 w-5 shrink-0 text-[var(--app-text-muted)]" />
            <input
              id="email"
              class="w-full bg-transparent text-base text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-soft)]"
              name="email"
              type="email"
              autocomplete="username"
              bind:value={email}
              required
            />
          </div>
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--app-text-muted)]" for="password">
              Password
            </label>
            <a href="https://passwordreset.microsoftonline.com" target="_blank" rel="noopener noreferrer" class="text-xs font-extrabold text-link hover:underline">
              Forgot password?
            </a>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-4 shadow-sm transition focus-within:border-campus-blue focus-within:ring-2 focus-within:ring-campus-blue/20">
            <LockKeyhole class="h-5 w-5 shrink-0 text-[var(--app-text-muted)]" />
            <input
              id="password"
              class="w-full bg-transparent text-base text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-soft)]"
              name="password"
              type="password"
              autocomplete="current-password"
              bind:value={password}
              required
            />
          </div>
        </div>

        <!-- Error -->
        {#if form?.authError || app.authError}
          <div class="rounded-2xl bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {form?.authError || app.authError}
          </div>
        {/if}

        <!-- Submit -->
        <button class="primary-button w-full py-4 text-base" type="submit">
          <LogIn class="h-5 w-5" />
          Sign in
        </button>
      </form>

      <!-- Role selector -->
      <div class="mt-8">
        <p class="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">Quick Select</p>
        <div class="grid grid-cols-2 gap-3">
          {#each data.users || [] as user}
            <button
              class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-campus-blue/20 active:scale-[0.98]"
              onclick={() => {
                email = user.email || ''
                password = defaultPasswordForRole(user.role)
              }}
              type="button"
            >
              <span class="text-sm font-extrabold text-link">{roleLabels[user.role]}</span>
              <span class="mt-1 block truncate text-xs text-[var(--app-text-soft)]">{user.email}</span>
            </button>
          {/each}
        </div>
      </div>

      <p class="mt-4 text-center text-[10px] text-[var(--app-text-soft)]">
        Click a role card to auto-fill credentials
      </p>
    </div>
  </div>
</div>
