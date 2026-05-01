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
  staff: 'Staff / Faculty',
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
  openProfilePanel: boolean
  authError: string | null
}

const defaultState: AppState = {
  data: null,
  userId: null,
  query: '',
  categoryFilter: 'all',
  tagFilter: 'all',
  noticeFilter: 'all',
  openCategoryIds: new Set(),
  openProfilePanel: false,
  authError: null,
}

let state = $state<AppState>({ ...defaultState, openCategoryIds: new Set() })

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
      const matchesName = tool.name.toLowerCase().includes(query)
      const matchesDesc = tool.description.toLowerCase().includes(query)
      const matchesTags = tool.tags.some((tag) => tag.toLowerCase().includes(query))
      if (!matchesName && !matchesDesc && !matchesTags) return false
    }
    return true
  })
})

let isAuthenticated = $derived(!!state.userId && !!state.data)

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
  const roleIndex = roles.indexOf(role)
  const toolRoles = tool.audienceRoles
    .map((r) => roles.indexOf(r as Role))
    .filter((i) => i >= 0)
  if (toolRoles.length === 0) return true
  return toolRoles.some((r) => r <= roleIndex)
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

    setOpenProfilePanel(open: boolean) {
      state.openProfilePanel = open
    },

    setAuthError(err: string | null) {
      state.authError = err
    },

    async login(email: string, password: string): Promise<boolean> {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const result = await res.json()
        if (result.error) {
          state.authError = result.error || 'Login failed'
          return false
        } else if (result.id) {
          state.userId = result.id
          state.authError = null
          // Refresh data
          const dataRes = await fetch('/api/data')
          const data = await dataRes.json()
          state.data = data
          return true
        } else {
          state.authError = 'Login failed'
          return false
        }
      } catch (e) {
        state.authError = 'Network error'
        return false
      }
    },

    async logout() {
      await fetch('/api/logout', { method: 'POST' })
      state = { ...defaultState, openCategoryIds: new Set() }
    },

    async toggleFavorite(toolId: string) {
      if (!state.userId) return
      const isFav = favoriteIds().has(toolId)
      if (isFav) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.userId, toolId }),
        })
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.userId, toolId }),
        })
      }
      const res = await fetch('/api/data')
      const data = await res.json()
      state.data = data
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
      if (tool.url) {
        window.open(tool.url, '_blank', 'noopener,noreferrer')
      }
    },
  }
}

export type AppStore = ReturnType<typeof getAppState>
