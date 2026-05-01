<script lang="ts">
  import '../app.css'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { getAppState } from '$lib/app-state.svelte'
  import { onMount } from 'svelte'
  import {
    Bell, ChevronLeft, ChevronRight, Grid2X2,
    Home, Search, Settings, Star, User
  } from 'lucide-svelte'

  let { children, data } = $props()
  const app = getAppState()

  $effect.pre(() => {
    app.hydrate(data)
  })

  const isAuthenticated = $derived(!!data?.authUserId)
  const isAdmin = $derived(data?.users?.find((u) => u.id === data?.authUserId)?.role === 'admin')

  $effect(() => {
    if (data && !data.authUserId && $page.url.pathname !== '/login') {
      goto('/login')
    }
    if (data?.authUserId && $page.url.pathname === '/login') {
      goto('/')
    }
  })

  onMount(() => {
    app.applyTheme()
  })

  let collapsed = $state(false)
  let navContainerRef: HTMLDivElement | undefined = $state()
  let mobileNavRef: HTMLElement | undefined = $state()
  let navPillStyle = $state({ top: '0px', height: '0px', opacity: 0 })
  let mobilePillStyle = $state({ left: '0px', width: '0px', opacity: 0 })

  $effect(() => {
    const _ = $page.url.pathname
    if (!navContainerRef) return
    requestAnimationFrame(() => {
      const activeEl = navContainerRef!.querySelector('.nav-item.active') as HTMLElement | null
      if (activeEl) {
        navPillStyle = {
          top: `${activeEl.offsetTop}px`,
          height: `${activeEl.offsetHeight}px`,
          opacity: 1,
        }
      } else {
        navPillStyle = { ...navPillStyle, opacity: 0 }
      }
    })
  })

  $effect(() => {
    const _ = $page.url.pathname
    if (!mobileNavRef) return
    requestAnimationFrame(() => {
      const activeEl = mobileNavRef!.querySelector('.mobile-item.active') as HTMLElement | null
      if (activeEl) {
        mobilePillStyle = {
          left: `${activeEl.offsetLeft}px`,
          width: `${activeEl.offsetWidth}px`,
          opacity: 1,
        }
      } else {
        mobilePillStyle = { ...mobilePillStyle, opacity: 0 }
      }
    })
  })

  onMount(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = () => app.applyTheme()
    systemTheme.addEventListener('change', updateSystemTheme)
    return () => systemTheme.removeEventListener('change', updateSystemTheme)
  })

  const navItems = [
    ['Home', '/', Home],
    ['Search', '/search', Search],
    ['Favorites', '/favorites', Star],
    ['Settings', '/settings', Settings],
  ] as const

  const mobileItems = [
    ['Home', '/', Home],
    ['Search', '/search', Search],
    ['Favorites', '/favorites', Star],
    ['Profile', '/profile', User],
  ] as const
</script>

<svelte:head>
  <title>AlfredGO</title>
  <link rel="icon" type="image/svg+xml" href="/icons/alfred-state-logo-A.svg" />
</svelte:head>

{#if isAuthenticated}
  <aside class="fixed left-0 top-0 z-30 hidden h-screen flex-col overflow-y-auto border-r border-border bg-surface py-5 transition-all duration-300 lg:flex {collapsed ? 'w-16 px-3' : 'w-60 px-5'}">
    <!-- Logo -->
    <a href="/" class="mb-6 flex items-center gap-3 {collapsed ? 'justify-center px-0' : 'px-3'}">
      <img src="/icons/alfred-state-logo-A.svg" alt="Alfred State" class="{collapsed ? 'h-10 w-10' : 'h-9 w-9'} text-link" />
      {#if !collapsed}
        <span class="text-xl font-extrabold text-link tracking-tight">AlfredGO</span>
      {/if}
    </a>

    <!-- Nav -->
    <div class="relative flex flex-1 flex-col" bind:this={navContainerRef}>
      <div
        class="pointer-events-none absolute left-0 right-0 z-0 rounded-3xl bg-selected transition-all duration-300 ease-out"
        style="top: {navPillStyle.top}; height: {navPillStyle.height}; opacity: {navPillStyle.opacity};"
      ></div>
      <div class="relative z-10 space-y-1">
        {#if !collapsed}
          <p class="px-4 pb-1 pt-4 text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Menu</p>
        {/if}
        {#each navItems as [label, href, ItemIcon]}
          <a
            title={label}
            href={href}
            class="nav-item {$page.url.pathname === href ? 'active' : ''} {collapsed ? 'h-12 justify-center px-0' : ''}"
          >
            <ItemIcon class={collapsed ? '!h-8 !w-8 shrink-0' : 'h-5 w-5 shrink-0'} strokeWidth={2} />
            {#if !collapsed}{label}{/if}
          </a>
        {/each}
        {#if isAdmin}
          {#if !collapsed}
            <p class="mt-4 px-4 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Administration</p>
          {/if}
          <a
            title="Admin"
            href="/admin"
            class="nav-item {$page.url.pathname.startsWith('/admin') ? 'active' : ''} {collapsed ? 'h-12 justify-center px-0' : ''}"
          >
            <Grid2X2 class={collapsed ? '!h-8 !w-8 shrink-0' : 'h-5 w-5 shrink-0'} strokeWidth={2} />
            {#if !collapsed}Admin{/if}
          </a>
        {/if}
      </div>
    </div>

    <!-- Collapse toggle -->
    <button
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      onclick={() => collapsed = !collapsed}
      class="mt-3 flex h-8 w-8 items-center justify-center self-end rounded-lg text-text-muted transition-colors hover:bg-muted hover:text-link {collapsed ? 'self-center' : ''}"
    >
      {#if collapsed}
        <ChevronRight class="h-5 w-5" />
      {:else}
        <ChevronLeft class="h-5 w-5" />
      {/if}
    </button>

    <!-- Profile -->
    <div class="mt-auto border-t border-border pt-4">
      <a
        title="Profile"
        href="/profile"
        class="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted {$page.url.pathname === '/profile' ? 'bg-muted text-link' : 'text-text'} {collapsed ? 'justify-center px-0' : ''}"
      >
        <span class="grid shrink-0 place-items-center rounded-full bg-campus-blue font-bold text-white shadow-md {collapsed ? 'h-9 w-9 text-sm' : 'avatar'}">{app.displayName?.charAt(0) || 'A'}</span>
        {#if !collapsed}
          <span>
            <span class="block text-sm font-extrabold text-link">{app.displayName}</span>
            <span class="text-xs font-medium text-text-muted">AlfredGo</span>
          </span>
        {/if}
      </a>
    </div>
  </aside>

  <main class="pb-24 transition-all duration-300 lg:pb-8 {collapsed ? 'lg:ml-16' : 'lg:ml-60'}">
    <!-- Header -->
    <header class="sticky top-0 z-20 border-b border-border bg-surface px-4 py-5 lg:px-8">
      <div class="mx-auto flex max-w-6xl items-center gap-4">
        <div class="min-w-0 flex-1">
          {#if $page.url.pathname === '/'}
            <p class="text-sm text-text-muted">Good evening</p>
            <h1 class="text-2xl font-extrabold leading-none text-link">{app.displayName || 'AlfredGO'}</h1>
          {:else}
            {@const titles: Record<string, string> = {
              '/search': 'Search',
              '/favorites': 'Favorites',
              '/profile': 'Profile',
              '/settings': 'Settings',
              '/admin': 'Manage AlfredGO',
              '/admin/tools': 'Manage tools',
              '/admin/categories': 'Manage categories',
            }}
            <h1 class="text-xl font-extrabold text-link">{titles[$page.url.pathname] || ''}</h1>
          {/if}
        </div>
        <label class="hidden min-w-0 flex-[1.1] items-center gap-3 rounded-3xl border border-border bg-muted px-4 py-3 shadow-sm transition focus-within:border-campus-blue focus-within:ring-2 focus-within:ring-campus-blue/20 md:flex">
          <Search class="h-5 w-5 text-text-muted" />
          <input value={app.query} oninput={(e) => app.setQuery(e.currentTarget.value)} class="w-full bg-transparent text-sm outline-none" placeholder="Search resources..." />
        </label>
        <button title="Notifications" class="relative hidden h-11 w-11 place-items-center rounded-full bg-muted text-link shadow-sm md:grid">
          <Bell class="h-5 w-5" />
          <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500"></span>
        </button>
      </div>
    </header>

    <div class="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      {@render children()}
    </div>
  </main>

  <!-- Mobile Nav -->
  <nav class="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-border bg-surface px-2 py-2 shadow-[var(--app-shadow)] lg:hidden" bind:this={mobileNavRef}>
    <div
      class="pointer-events-none absolute bottom-2 top-2 z-0 rounded-xl bg-selected transition-all duration-300 ease-out"
      style="left: {mobilePillStyle.left}; width: {mobilePillStyle.width}; opacity: {mobilePillStyle.opacity};"
    ></div>
    {#each mobileItems as [label, href, ItemIcon]}
      <a
        href={href}
        class="mobile-item relative z-10 {$page.url.pathname === href ? 'active' : ''}"
      >
        <ItemIcon class="h-5 w-5" />
        <span>{label}</span>
      </a>
    {/each}
  </nav>
{:else}
  <main class="min-h-screen bg-app text-text">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {@render children()}
    </div>
  </main>
{/if}
