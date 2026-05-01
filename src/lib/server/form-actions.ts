import type { Actions } from '@sveltejs/kit'
import type { Category, Role, Tool, UserPreference } from '$lib/types'
import { saveCategory, savePreference, saveTool, toggleFavorite } from './app-data'

export const favoriteActions = {
  toggleFavorite: async ({ request, locals }) => {
    const formData = await request.formData()
    const toolId = String(formData.get('toolId') || '')
    if (toolId) toggleFavorite(locals.user, toolId)
    return { ok: true }
  },
} satisfies Actions

export const preferenceActions = {
  savePreference: async ({ request, locals }) => {
    const formData = await request.formData()
    const prefs: Partial<UserPreference> = {}
    const theme = formData.get('theme')
    const preferredRoleView = formData.get('preferredRoleView')
    if (theme) prefs.theme = String(theme) as UserPreference['theme']
    if (preferredRoleView) prefs.preferredRoleView = String(preferredRoleView) as Role
    savePreference(locals.user, prefs)
    return { ok: true }
  },
} satisfies Actions

export const adminToolActions = {
  saveTool: async ({ request, locals }) => {
    const formData = await request.formData()
    const now = new Date().toISOString()
    const tool: Tool = {
      id: String(formData.get('id') || `tool-${Date.now()}`),
      name: String(formData.get('name') || ''),
      description: String(formData.get('description') || ''),
      url: String(formData.get('url') || ''),
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
} satisfies Actions

export const adminCategoryActions = {
  saveCategory: async ({ request, locals }) => {
    const formData = await request.formData()
    const name = String(formData.get('name') || '')
    const now = new Date().toISOString()
    const category: Category = {
      id: String(formData.get('id') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      name,
      description: String(formData.get('description') || ''),
      sortOrder: Number(formData.get('sortOrder') || 0),
      createdAt: now,
      updatedAt: now,
    }
    saveCategory(locals.user, category)
    return { ok: true }
  },
} satisfies Actions
