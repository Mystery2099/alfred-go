<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import {
    FileText,
    FolderOpen,
    Search,
    Wrench,
    X
  } from 'lucide-svelte'
  import { getAppState } from '$lib/app-state.svelte'
  import CommandOnboarding from '$lib/features/command-palette/CommandOnboarding.svelte'
  import {
    buildCommandResults,
    commandResultKey,
    getFallbackCommandResults,
    groupCommandResults,
    type ResultItem
  } from '$lib/features/command-palette/search'
  import { commandPaletteOnboardingByRole, defaultCommandPaletteOnboarding } from '$lib/onboarding'

  interface Props {
    open: boolean
    onClose: () => void
  }

  let { open = $bindable(false), onClose }: Props = $props()

  const app = getAppState()

  let query = $state('')
  let selectedIndex = $state(0)
  let inputRef = $state<HTMLInputElement | undefined>(undefined)
  let listRef = $state<HTMLDivElement | undefined>(undefined)

  let results = $derived.by(() => buildCommandResults(app, query))
  let fallbackResults = $derived.by(() => getFallbackCommandResults(app))

  let hasQuery = $derived(query.trim().length > 0)
  let hasResults = $derived(results.length > 0)
  let onboarding = $derived(commandPaletteOnboardingByRole[app.effectiveRole] ?? defaultCommandPaletteOnboarding)
  let showOnboarding = $derived(!hasQuery)

  $effect(() => {
    if (open) {
      query = ''
      selectedIndex = 0
      requestAnimationFrame(() => inputRef?.focus())
    }
  })

  $effect(() => {
    const _ = results.length
    selectedIndex = 0
  })

  function handleSelect(item: ResultItem, launch = false) {
    onClose()
    if (item.type === 'tool') {
      if (launch) {
        app.launchTool(item.data)
      } else {
        goto(resolve(`/tools/${item.data.id}`))
      }
    } else if (item.type === 'page') {
      goto(resolve(item.href as '/'))
    } else if (item.type === 'announcement') {
      const a = item.data
      if (a.url) {
        window.open(a.url, '_blank', 'noopener,noreferrer')
      } else if (a.toolId) {
        goto(resolve(`/tools/${a.toolId}`))
      } else {
        goto(resolve('/announcements'))
      }
    } else if (item.type === 'category') {
      goto(resolve(`/categories/${item.data.id}`))
    }
  }

  function useSuggestion(value: string) {
    query = value
    selectedIndex = 0
    requestAnimationFrame(() => inputRef?.focus())
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      selectedIndex = (selectedIndex + 1) % results.length
      scrollSelectedIntoView()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      selectedIndex = (selectedIndex - 1 + results.length) % results.length
      scrollSelectedIntoView()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = results[selectedIndex]
      if (item) {
        handleSelect(item, event.metaKey || event.ctrlKey)
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  function scrollSelectedIntoView() {
    requestAnimationFrame(() => {
      const el = listRef?.querySelector(`[data-index="${selectedIndex}"]`)
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    })
  }

  let groupedResults = $derived(groupCommandResults(results))
</script>

<svelte:window onkeydown={(e) => {
  if (e.key === '/' && !open) {
    const target = e.target as HTMLElement | null
    const isTyping = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
    if (!isTyping) {
      e.preventDefault()
      open = true
    }
  }
}} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[15vh] backdrop-blur-sm"
    onclick={(e) => { if (e.target === e.currentTarget) onClose() }}
  >
    <div class="w-full max-w-xl overflow-hidden rounded-[28px] border border-border bg-surface shadow-2xl">
      <!-- Search input -->
      <div class="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <Search class="h-5 w-5 shrink-0 text-text-muted" />
        <input
          bind:this={inputRef}
          bind:value={query}
          onkeydown={handleKeydown}
          class="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
          placeholder="Search tools, pages, announcements..."
          maxlength="100"
        />
        {#if query}
          <button onclick={() => { query = ''; inputRef?.focus() }} class="rounded-lg p-1 text-text-muted hover:bg-muted hover:text-link" aria-label="Clear search">
            <X class="h-4 w-4" />
          </button>
        {/if}
        <kbd class="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-text-muted sm:inline-block">ESC</kbd>
      </div>

      {#if showOnboarding}
        <CommandOnboarding {onboarding} role={app.effectiveRole} onSuggestion={useSuggestion} />
      {/if}

      <!-- Results -->
      <div bind:this={listRef} class="max-h-[50vh] overflow-y-auto visible-scrollbar">
        {#if !hasResults}
          <div class="px-4 py-8 text-center">
            <p class="text-sm font-semibold text-text-muted">No results found</p>
            <p class="mt-1 text-xs text-text-soft">Try a different search term</p>
          </div>
          {#if fallbackResults.length > 0}
            <div class="border-t border-border px-4 py-2">
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Recent</p>
            </div>
            {#each fallbackResults as item, i (commandResultKey(item))}
              <button
                data-index={i}
                class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted {selectedIndex === i ? 'bg-selected' : ''}"
                onclick={() => handleSelect(item)}
                onmouseenter={() => selectedIndex = i}
              >
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-link">
                  {#if item.type === 'tool'}
                    <Wrench class="h-4 w-4" />
                  {:else}
                    <FileText class="h-4 w-4" />
                  {/if}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-link">{item.type === 'tool' ? item.data.name : item.data.title}</p>
                  <p class="truncate text-xs text-text-muted">{item.type === 'tool' ? item.data.description : item.data.body}</p>
                </div>
                {#if item.type === 'tool'}
                  <span class="hidden shrink-0 text-[10px] font-bold text-text-soft sm:inline">Go</span>
                {/if}
              </button>
            {/each}
          {/if}
        {:else}
          {#each groupedResults as group (group.label)}
            <div class="px-4 py-2">
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-text-soft">{group.label}</p>
            </div>
            {#each group.rows as { item, index } (`${item.type}-${index}`)}
              <button
                data-index={index}
                class="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted {selectedIndex === index ? 'bg-selected' : ''}"
                onclick={() => handleSelect(item)}
                onmouseenter={() => selectedIndex = index}
              >
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-link">
                  {#if item.type === 'tool'}
                    <Wrench class="h-4 w-4" />
                  {:else if item.type === 'page'}
                    <item.icon class="h-4 w-4" />
                  {:else if item.type === 'announcement'}
                    <FileText class="h-4 w-4" />
                  {:else if item.type === 'category'}
                    <FolderOpen class="h-4 w-4" />
                  {/if}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-link">
                    {#if item.type === 'tool'}
                      {item.data.name}
                    {:else if item.type === 'page'}
                      {item.name}
                    {:else if item.type === 'announcement'}
                      {item.data.title}
                    {:else if item.type === 'category'}
                      {item.data.name}
                    {/if}
                  </p>
                  <p class="truncate text-xs text-text-muted">
                    {#if item.type === 'tool'}
                      {app.categoryName(item.data.categoryId)} · {item.data.tags.slice(0, 3).join(', ')}
                    {:else if item.type === 'page'}
                      Navigate to page
                    {:else if item.type === 'announcement'}
                      {item.data.body}
                    {:else if item.type === 'category'}
                      {item.data.description || 'Browse category'}
                    {/if}
                  </p>
                </div>
                {#if item.type === 'tool'}
                  <span class="hidden shrink-0 text-[10px] font-bold text-text-soft transition-colors group-hover:text-link sm:inline" title="Cmd+Enter to launch">Launch</span>
                {/if}
              </button>
            {/each}
          {/each}
        {/if}
      </div>

      <!-- Footer hints -->
      <div class="flex items-center justify-between border-t border-border bg-muted px-4 py-2 text-[10px] font-bold text-text-soft">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1"><kbd class="rounded border border-border bg-surface px-1">↑↓</kbd> Navigate</span>
          <span class="flex items-center gap-1"><kbd class="rounded border border-border bg-surface px-1">Enter</kbd> Select</span>
          {#if results.some((r) => r.type === 'tool')}
            <span class="hidden items-center gap-1 sm:flex"><kbd class="rounded border border-border bg-surface px-1">⌘+Enter</kbd> Launch</span>
          {/if}
        </div>
        <span class="hidden sm:inline">{results.length} result{results.length === 1 ? '' : 's'}</span>
      </div>
    </div>
  </div>
{/if}
