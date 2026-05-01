import type { AppData, Category, Role, Tool, User, UserPreference } from './types'
import {
  LayoutDashboard, Search, Heart, User as UserIcon, Settings, LogOut,
  ShieldCheck, Wrench, GraduationCap, Star, Clock, ExternalLink,
  Bell, BookOpen, FileText, Mail, Calendar, BarChart3,
  CreditCard, Home, Globe, MapPin, Phone, Info, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronRight, Plus, Trash2,
  Edit3, Menu, X, Sun, Moon, Monitor, ArrowUpRight, Sparkles
} from 'lucide-svelte'
import type { Component } from 'svelte'

export const roles: Role[] = ['applicant', 'accepted_student', 'student', 'staff', 'admin']

export const roleLabels: Record<Role, string> = {
  applicant: 'Applicant',
  accepted_student: 'Accepted Student',
  student: 'Student',
  staff: 'Staff',
  admin: 'Admin',
}

const iconMap: Record<string, any> = {
  LayoutDashboard, Search, Heart, UserIcon, Settings, LogOut,
  ShieldCheck, Wrench, GraduationCap, Star, Clock, ExternalLink,
  Bell, BookOpen, FileText, Mail, Calendar, BarChart3,
  CreditCard, Home, Globe, MapPin, Phone, Info, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronRight, Plus, Trash2,
  Edit3, Menu, X, Sun, Moon, Monitor, ArrowUpRight, Sparkles
}

export function getIcon(name: string): any {
  return iconMap[name] || Globe
}

interface AppState {
  data: AppData | null
  userId: string | null
  query: string
  categoryFilter: string | 'all'
  tagFilter: string | 'all'
  noticeFilter: string | 'all'
  openCategoryIds: Set<string>
  openProfilePanel: string | null
  authError: string | null
}

const defaultOpenCategoryIds = ['academics', 'financial', 'resources', 'student-life']

const defaultState: AppState = {
  data: null,
  userId: null,
  query: '',
  categoryFilter: 'all',
  tagFilter: 'all',
  noticeFilter: 'all',
  openCategoryIds: new Set(defaultOpenCategoryIds),
  openProfilePanel: null,
  authError: null,
}

let state = $state<AppState>({ ...defaultState, openCategoryIds: new Set(defaultOpenCategoryIds) })

// Derived values
let currentUser = $derived(
  state.data?.users.find((u) => u.id === state.userId) || null
)

let displayName = $derived(
  currentUser?.name === 'Student' ? 'Test User' : (currentUser?.name || 'Guest')
)

let currentRole = $derived((currentUser?.role || 'student') as Role)

let effectiveRole = $derived(() => {
  const pref = currentPreference()
  if (pref?.preferredRoleView && pref.preferredRoleView !== currentRole) {
    return pref.preferredRoleView as Role
  }
  return currentRole
})

let categories = $derived(() => {
  if (!state.data) return []
  return [...state.data.categories].sort((a, b) => a.sortOrder - b.sortOrder)
})

let favoriteIds = $derived(() => {
  if (!state.data || !state.userId) return new Set<string>()
  return new Set(state.data.favorites.filter((f) => f.userId === state.userId).map((f) => f.toolId))
})

let visibleTools = $derived(() => {
  if (!state.data) return []
  const role = effectiveRole()
  return state.data.tools.filter((tool) => {
    if (!tool.isActive) return false
    if (!roleCanSeeTool(role, tool)) return false
    return true
  })
})

let allTags = $derived(() => {
  const tags = new Set<string>()
  visibleTools().forEach((tool) => tool.tags.forEach((tag) => tags.add(tag)))
  return Array.from(tags).sort()
})

let currentPreference = $derived(() => {
  if (!state.data || !state.userId) return null
  return state.data.preferences.find((p) => p.userId === state.userId) || null
})

let filteredTools = $derived(() => {
  if (!state.data) return []
  const role = effectiveRole()
  const query = state.query.toLowerCase().trim()
  const catFilter = state.categoryFilter
  const tagFilter = state.tagFilter

  return state.data.tools.filter((tool) => {
    if (!tool.isActive) return false
    if (!roleCanSeeTool(role, tool)) return false
    if (catFilter !== 'all' && tool.categoryId !== catFilter) return false
    if (tagFilter !== 'all' && !tool.tags.includes(tagFilter)) return false
    if (query) {
      const category = categories().find((item) => item.id === tool.categoryId)
      const searchable = [tool.name, tool.description, category?.name || '', ...tool.tags]
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(query)) return false
    }
    return true
  })
})

let isAuthenticated = $derived(!!currentUser)

function categoryName(id: string): string {
  return categories().find((c) => c.id === id)?.name || id
}

function categoryGlyph(id: string): string {
  const glyphs: Record<string, string> = {
    academics: '🎓',
    community: '✦',
    financial: '💳',
    'my-account': 'ID',
    resources: '🛠',
    'student-life': '🏠',
    staff: 'ID',
  }
  return glyphs[id] || '•'
}

function roleCanSeeTool(role: Role, tool: Tool): boolean {
  return tool.isActive && (role === 'admin' || tool.audienceRoles.includes(role))
}

export function getAppState() {
  return {
    // State accessors
    get state() { return state },
    get data() { return state.data },
    get userId() { return state.userId },
    get query() { return state.query },
    get categoryFilter() { return state.categoryFilter },
    get tagFilter() { return state.tagFilter },
    get noticeFilter() { return state.noticeFilter },
    get openCategoryIds() { return state.openCategoryIds },
    get openProfilePanel() { return state.openProfilePanel },
    get authError() { return state.authError },

    // Derived accessors
    get currentUser() { return currentUser },
    get displayName() { return displayName },
    get currentRole() { return currentRole },
    get effectiveRole() { return effectiveRole() },
    get categories() { return categories() },
    get favoriteIds() { return favoriteIds() },
    get visibleTools() { return visibleTools() },
    get allTags() { return allTags() },
    get currentPreference() { return currentPreference() },
    get filteredTools() { return filteredTools() },
    get isAuthenticated() { return isAuthenticated },
    get isAdmin() { return currentUser?.role === 'admin' },
    get dataReady() { return !!state.data },

    // Functions
    categoryName,
    categoryGlyph,
    roleCanSeeTool,

    // Actions
    hydrate(data: AppData & { authUserId?: string | null }) {
      state.data = data
      if (data.authUserId !== undefined) {
        state.userId = data.authUserId
      }
    },

    setUserId(id: string | null) {
      state.userId = id
    },

    setQuery(q: string) {
      state.query = q
    },

    setCategoryFilter(c: string | 'all') {
      state.categoryFilter = c
    },

    setTagFilter(t: string | 'all') {
      state.tagFilter = t
    },

    setNoticeFilter(n: string | 'all') {
      state.noticeFilter = n
    },

    toggleCategoryOpen(id: string) {
      const next = new Set(state.openCategoryIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      state.openCategoryIds = next
    },

    setOpenProfilePanel(open: string | null) {
      state.openProfilePanel = open
    },

    setAuthError(err: string | null) {
      state.authError = err
    },

    isFavorite(toolId: string) {
      return favoriteIds().has(toolId)
    },

    applyTheme(theme?: string) {
      const root = document.documentElement
      const t = theme || currentPreference()?.theme || 'system'
      root.classList.remove('dark', 'light')
      if (t === 'dark') root.classList.add('dark')
      else if (t === 'light') root.classList.add('light')
      else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark')
        } else {
          root.classList.add('light')
        }
      }
    },

    launchTool(tool: Tool) {
      if (!tool.url) return null
      if (tool.url.startsWith('/')) {
        window.location.href = tool.url
        return tool.url
      }
      window.open(tool.url, '_blank', 'noopener,noreferrer')
      return null
    },
  }
}

export type AppStore = ReturnType<typeof getAppState>
