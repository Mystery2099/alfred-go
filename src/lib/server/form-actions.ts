import type { Actions } from '@sveltejs/kit'
import type { Announcement, Category, Role, Tool, UserPreference } from '$lib/types'
import { changeUserPassword } from './auth'
import { clearUserActivities, deleteAnnouncement, deleteCategory, deleteTool, logActivity, normalizePublicUrl, saveAnnouncement, saveCategory, savePreference, saveTool, toggleFavorite } from './app-data'

export const favoriteActions = {
  toggleFavorite: async ({ request, locals }) => {
    const formData = await request.formData()
    const toolId = String(formData.get('toolId') || '')
    if (toolId) {
      toggleFavorite(locals.user, toolId)
      if (locals.user) {
        logActivity(locals.user.id, 'favorite', toolId)
      }
    }
    return { ok: true }
  },
} satisfies Actions

export const preferenceActions = {
  savePreference: async ({ request, locals }) => {
    const formData = await request.formData()
    const prefs: Partial<UserPreference> = {}
    const theme = formData.get('theme')
    const preferredRoleView = formData.get('preferredRoleView')
    const notificationSettings = formData.get('notificationSettings')
    const accessibilitySettings = formData.get('accessibilitySettings')
    if (theme) prefs.theme = String(theme) as UserPreference['theme']
    if (preferredRoleView) {
      const role = String(preferredRoleView) as Role
      // Only admin and staff can change role view; staff cannot select admin
      if (locals.user && (locals.user.role === 'admin' || (locals.user.role === 'staff' && role !== 'admin'))) {
        prefs.preferredRoleView = role
      }
    }
    if (notificationSettings) {
      try {
        prefs.notificationSettings = JSON.parse(String(notificationSettings))
      } catch {
        // ignore invalid JSON
      }
    }
    if (accessibilitySettings) {
      try {
        prefs.accessibilitySettings = JSON.parse(String(accessibilitySettings))
      } catch {
        // ignore invalid JSON
      }
    }
    savePreference(locals.user, prefs)
    return { ok: true }
  },
  changePassword: async ({ request, locals }) => {
    const formData = await request.formData()
    const currentPassword = String(formData.get('currentPassword') || '')
    const newPassword = String(formData.get('newPassword') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (!locals.user) return { ok: false, error: 'Authentication required.' }
    if (!currentPassword || !newPassword) return { ok: false, error: 'All fields are required.' }
    if (newPassword !== confirmPassword) return { ok: false, error: 'New passwords do not match.' }

    const result = changeUserPassword(locals.user.id, currentPassword, newPassword)
    return result
  },
  resetPreferences: async ({ locals }) => {
    if (!locals.user) return { ok: false, error: 'Authentication required.' }
    savePreference(locals.user, {
      theme: 'system',
      preferredRoleView: locals.user.role,
      notificationSettings: {
        'Academic deadlines': true,
        'Campus service updates': true,
        'Financial aid tasks': true,
        'Favorite resource changes': true,
      },
      accessibilitySettings: {
        reducedMotion: false,
        highContrast: false,
        compactDensity: false,
      },
    })
    return { ok: true }
  },
  clearActivities: async ({ locals }) => {
    if (!locals.user) return { ok: false, error: 'Authentication required.' }
    clearUserActivities(locals.user)
    return { ok: true }
  },
} satisfies Actions

export const adminToolActions = {
  saveTool: async ({ request, locals }) => {
    const formData = await request.formData()
    const name = String(formData.get('name') || '').trim()
    const url = String(formData.get('url') || '').trim()

    if (!name) return { ok: false, error: 'Name is required.' }
    if (!url) return { ok: false, error: 'URL is required.' }
    try {
      normalizePublicUrl(url)
    } catch {
      return { ok: false, error: 'URL must be a same-origin path or an HTTP(S) web address.' }
    }

    const now = new Date().toISOString()
    const tool: Tool = {
      id: String(formData.get('id') || `tool-${Date.now()}`),
      name,
      description: String(formData.get('description') || '').trim(),
      url,
      categoryId: String(formData.get('categoryId') || 'academics'),
      icon: String(formData.get('icon') || 'Grid2X2'),
      tags: String(formData.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      audienceRoles: formData.getAll('audienceRoles').map(String) as Role[],
      isFeatured: formData.get('isFeatured') === 'on',
      isActive: formData.get('isActive') !== 'off',
      createdAt: now,
      updatedAt: now,
    }
    saveTool(locals.user, tool)
    return { ok: true }
  },
  deleteTool: async ({ request, locals }) => {
    const formData = await request.formData()
    const toolId = String(formData.get('toolId') || '')
    if (!toolId) return { ok: false, error: 'Tool ID is required.' }
    deleteTool(locals.user, toolId)
    return { ok: true }
  },
} satisfies Actions

export const adminCategoryActions = {
  saveCategory: async ({ request, locals }) => {
    const formData = await request.formData()
    const name = String(formData.get('name') || '').trim()

    if (!name) return { ok: false, error: 'Category name is required.' }

    const now = new Date().toISOString()
    const category: Category = {
      id: String(formData.get('id') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      name,
      description: String(formData.get('description') || '').trim(),
      sortOrder: Number(formData.get('sortOrder') || 0),
      createdAt: now,
      updatedAt: now,
    }
    saveCategory(locals.user, category)
    return { ok: true }
  },
  deleteCategory: async ({ request, locals }) => {
    const formData = await request.formData()
    const categoryId = String(formData.get('categoryId') || '')
    if (!categoryId) return { ok: false, error: 'Category ID is required.' }
    deleteCategory(locals.user, categoryId)
    return { ok: true }
  },
} satisfies Actions

export const adminAnnouncementActions = {
  saveAnnouncement: async ({ request, locals }) => {
    const formData = await request.formData()
    const title = String(formData.get('title') || '').trim()
    const body = String(formData.get('body') || '').trim()

    if (!title) return { ok: false, error: 'Title is required.' }
    if (!body) return { ok: false, error: 'Body is required.' }

    const now = new Date().toISOString()
    const id = String(formData.get('id') || `announcement-${Date.now()}`)
    const toolId = String(formData.get('toolId') || '').trim() || undefined
    const url = String(formData.get('url') || '').trim() || undefined

    const announcement: Announcement = {
      id,
      title,
      body,
      tone: String(formData.get('tone') || 'reminder') as Announcement['tone'],
      filter: String(formData.get('filter') || 'updates') as Announcement['filter'],
      actionLabel: String(formData.get('actionLabel') || '').trim() || undefined,
      toolId,
      url,
      sortOrder: Number(formData.get('sortOrder') || 0),
      isActive: formData.get('isActive') !== 'off',
      createdAt: now,
      updatedAt: now,
    }
    saveAnnouncement(locals.user, announcement)
    return { ok: true }
  },
  deleteAnnouncement: async ({ request, locals }) => {
    const formData = await request.formData()
    const announcementId = String(formData.get('announcementId') || '')
    if (!announcementId) return { ok: false, error: 'Announcement ID is required.' }
    deleteAnnouncement(locals.user, announcementId)
    return { ok: true }
  },
} satisfies Actions
