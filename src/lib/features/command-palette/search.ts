import {
  Bell,
  FileText,
  FolderOpen,
  Home,
  Search,
  Settings,
  ShieldCheck,
  Star,
  User,
  Wrench,
} from 'lucide-svelte'
import type { AppStore } from '$lib/app-state.svelte'
import type { Announcement, Category, Tool } from '$lib/types'

type IconComponent = any

export type ToolResult = { type: 'tool'; data: Tool; icon: IconComponent }
export type PageResult = { type: 'page'; name: string; href: string; icon: IconComponent }
export type AnnouncementResult = { type: 'announcement'; data: Announcement; icon: IconComponent }
export type CategoryResult = { type: 'category'; data: Category; icon: IconComponent }
export type ResultItem = ToolResult | PageResult | AnnouncementResult | CategoryResult
export type FallbackResultItem = ToolResult | AnnouncementResult

export type ResultGroup = {
  label: string
  rows: { item: ResultItem; index: number }[]
}

export function getCommandPageItems(isAdmin: boolean): PageResult[] {
  return [
    { type: 'page', name: 'Home', href: '/', icon: Home },
    { type: 'page', name: 'Browse', href: '/browse', icon: Search },
    { type: 'page', name: 'Favorites', href: '/favorites', icon: Star },
    { type: 'page', name: 'Announcements', href: '/announcements', icon: Bell },
    { type: 'page', name: 'Profile', href: '/profile', icon: User },
    { type: 'page', name: 'Settings', href: '/settings', icon: Settings },
    ...(isAdmin ? [{ type: 'page' as const, name: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ]
}

export function getRecentCommandTools(app: AppStore): Tool[] {
  if (!app.data) return []

  const launched = app.recentActivities
    .filter((activity) => activity.type === 'tool_launch' && activity.toolId)
    .map((activity) => app.data!.tools.find((tool) => tool.id === activity.toolId))
    .filter((tool): tool is Tool => !!tool && tool.isActive && app.roleCanSeeTool(app.effectiveRole, tool))
  const seen = new Set<string>()
  const unique: Tool[] = []

  for (const tool of launched) {
    if (!seen.has(tool.id)) {
      seen.add(tool.id)
      unique.push(tool)
    }
  }

  return unique.slice(0, 5)
}

export function getFallbackCommandResults(app: AppStore): FallbackResultItem[] {
  const recentItems: ToolResult[] = getRecentCommandTools(app).map((tool) => ({
    type: 'tool',
    data: tool,
    icon: Wrench,
  }))
  const announcementItems: AnnouncementResult[] = app.announcements
    .slice(0, 3)
    .map((announcement) => ({ type: 'announcement', data: announcement, icon: FileText }))

  return [...recentItems, ...announcementItems]
}

export function buildCommandResults(app: AppStore, query: string): ResultItem[] {
  if (!app.data) return []

  const pageItems = getCommandPageItems(app.isAdmin)
  const q = query.toLowerCase().trim()

  if (!q) {
    return [...getFallbackCommandResults(app), ...(pageItems as ResultItem[])]
  }

  const items: ResultItem[] = []
  const matchedTools = app.visibleTools
    .filter((tool) => {
      const category = app.categories.find((item) => item.id === tool.categoryId)
      const searchable = [tool.name, tool.description, category?.name || '', ...tool.tags]
        .join(' ')
        .toLowerCase()
      return searchable.includes(q)
    })
    .slice(0, 5)
  items.push(...matchedTools.map((tool) => ({ type: 'tool' as const, data: tool, icon: Wrench })))

  const matchedAnnouncements = app.announcements
    .filter((announcement) => announcement.title.toLowerCase().includes(q) || announcement.body.toLowerCase().includes(q))
    .slice(0, 3)
  items.push(...matchedAnnouncements.map((announcement) => ({ type: 'announcement' as const, data: announcement, icon: FileText })))

  items.push(...pageItems.filter((page) => page.name.toLowerCase().includes(q)))
  items.push(
    ...app.categories
      .filter((category) => category.name.toLowerCase().includes(q))
      .map((category) => ({ type: 'category' as const, data: category, icon: FolderOpen }))
  )

  return items
}

export function groupCommandResults(items: ResultItem[]): ResultGroup[] {
  const groups: ResultGroup[] = []
  let currentLabel = ''
  let currentRows: ResultGroup['rows'] = []

  for (let i = 0; i < items.length; i++) {
    const label = getGroupLabel(items[i])
    if (label !== currentLabel) {
      if (currentRows.length > 0) {
        groups.push({ label: currentLabel, rows: currentRows })
      }
      currentLabel = label
      currentRows = []
    }
    currentRows.push({ item: items[i], index: i })
  }

  if (currentRows.length > 0) {
    groups.push({ label: currentLabel, rows: currentRows })
  }

  return groups
}

export function commandResultKey(item: ResultItem): string {
  if (item.type === 'tool') return `tool-${item.data.id}`
  if (item.type === 'page') return `page-${item.href}`
  if (item.type === 'announcement') return `announcement-${item.data.id}`
  return `category-${item.data.id}`
}

function getGroupLabel(item: ResultItem): string {
  switch (item.type) {
    case 'tool':
      return 'Tools'
    case 'page':
      return 'Pages'
    case 'announcement':
      return 'Announcements'
    case 'category':
      return 'Categories'
  }
}
