<script lang="ts">
  import Icon from '$lib/components/shared/Icon.svelte'
  import type { Tool } from '$lib/types'
  import { ExternalLink, Share2 } from 'lucide-svelte'
  import FavoriteButton from './FavoriteButton.svelte'
  import { getToolStatusColor, getToolStatusIcon } from './tool-status'

  type ShareStatus = 'idle' | 'copying' | 'shared' | 'copied' | 'failed'

  interface Props {
    tool: Tool
    onLaunch: () => void
  }

  let { tool, onLaunch }: Props = $props()

  let shareStatus = $state<ShareStatus>('idle')
  let shareStatusTimeout: ReturnType<typeof setTimeout> | undefined

  const statusIcon = $derived(getToolStatusIcon(tool.status))
  const statusColor = $derived(getToolStatusColor(tool.status))

  function setShareStatus(status: ShareStatus) {
    shareStatus = status
    if (shareStatusTimeout) clearTimeout(shareStatusTimeout)
    if (status !== 'idle') {
      shareStatusTimeout = setTimeout(() => {
        shareStatus = 'idle'
      }, 2500)
    }
  }

  async function copyToolLink(url: string) {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      if (navigator.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard timed out')), 1000)),
        ])
        return
      }

      const copied = document.execCommand('copy')
      if (!copied) {
        throw new Error('Copy failed')
      }
    } catch {
      const copied = document.execCommand('copy')
      if (!copied) {
        throw new Error('Copy failed')
      }
    } finally {
      document.body.removeChild(textarea)
    }
  }

  async function shareTool() {
    setShareStatus('copying')
    const shareData = { title: tool.name, text: tool.description, url: window.location.href }

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData)
        setShareStatus('shared')
        return
      }

      await copyToolLink(shareData.url)
      setShareStatus('copied')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setShareStatus('idle')
        return
      }
      setShareStatus('failed')
    }
  }
</script>

<div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
  <div class="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-campus-blue text-white shadow-sm">
    <Icon name={tool.icon || 'Grid2X2'} class="h-10 w-10" />
  </div>

  <div class="min-w-0 flex-1">
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{tool.name}</h1>
      {#if tool.status}
        <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider {statusColor}">
          {#if statusIcon}
            {@const StatusIcon = statusIcon}
            <StatusIcon class="h-3.5 w-3.5" />
          {/if}
          {tool.status}
        </span>
      {/if}
    </div>
    <p class="mt-2 text-base leading-relaxed text-text-muted">{tool.description}</p>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-campus-blue px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition duration-150 hover:bg-campus-darkBlue active:scale-[0.97]"
        onclick={onLaunch}
      >
        <ExternalLink class="h-4 w-4" />
        Launch
      </button>

      <FavoriteButton toolId={tool.id} toolName={tool.name} variant="hero" />

      <button
        type="button"
        aria-live="polite"
        class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-extrabold text-link transition duration-150 hover:bg-muted active:scale-[0.97]"
        onclick={() => { void shareTool() }}
      >
        <Share2 class="h-4 w-4" />
        {#if shareStatus === 'copying'}
          Copying...
        {:else if shareStatus === 'copied'}
          Link copied
        {:else if shareStatus === 'shared'}
          Shared
        {:else if shareStatus === 'failed'}
          Copy failed
        {:else}
          Share
        {/if}
      </button>
    </div>
  </div>
</div>
