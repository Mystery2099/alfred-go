import { error } from '@sveltejs/kit'
import { and, desc, eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import type { Activity, Announcement, AppData, Category, Role, Tool, User, UserPreference } from '$lib/types'
import { verifyPassword } from './auth'
import { db } from './db'
import { activities, announcements, categories, favorites, tools, userCredentials, userPreferences, users } from './schema'
import { sendPushToAll } from './push'

const roles = new Set(['applicant', 'accepted_student', 'student', 'staff', 'admin'])
const themes = new Set(['system', 'light', 'dark'])
const announcementTones = new Set(['urgent', 'deadline', 'reminder'])
const announcementFilters = new Set(['updates', 'deadlines', 'reminders'])
const activityTypes = new Set(['tool_launch', 'favorite', 'login'])
const idPattern = /^[a-zA-Z0-9_-]{1,80}$/

function assertId(value: string, label: string) {
  if (!idPattern.test(value)) error(400, `Invalid ${label}`)
}

function assertRole(value: unknown): asserts value is User['role'] {
  if (!roles.has(String(value))) error(400, 'Invalid role')
}

export function normalizePublicUrl(value: string) {
  if (value.startsWith('/')) {
    if (value.startsWith('//')) error(400, 'URL must be a same-origin path or an HTTP(S) URL')
    return value
  }

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    error(400, 'URL must be a valid web address.')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    error(400, 'URL must use http or https.')
  }

  return parsed.toString()
}

export function getLoginData(user: User | null) {
  return {
    users: db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).all() as AppData['users'],
    authUserId: user?.id ?? null,
  }
}

function userCanSeeTool(userRole: Role, tool: Tool): boolean {
  return tool.isActive && (userRole === 'admin' || tool.audienceRoles.includes(userRole))
}

function userCanSeeAnnouncement(userRole: Role, announcement: Announcement): boolean {
  // Empty audienceRoles means visible to all roles (backward compatibility)
  if (!announcement.isActive) return false
  if (userRole === 'admin') return true
  if (announcement.audienceRoles.length === 0) return true
  return announcement.audienceRoles.includes(userRole)
}

export function getAppData(authUserId: string | null): AppData & { authUserId: string | null } {
  const allAnnouncements = db.select().from(announcements).all() as AppData['announcements']
  const currentUsers = authUserId
    ? db.select().from(users).where(eq(users.id, authUserId)).all() as AppData['users']
    : []
  const userFavorites = authUserId
    ? db.select().from(favorites).where(eq(favorites.userId, authUserId)).all() as AppData['favorites']
    : []
  const userPrefs = authUserId
    ? db.select().from(userPreferences).where(eq(userPreferences.userId, authUserId)).all() as AppData['preferences']
    : []
  const userActivities = authUserId
    ? db.select().from(activities).where(eq(activities.userId, authUserId)).orderBy(desc(activities.createdAt)).limit(5).all() as AppData['activities']
    : []

  const userRole = currentUsers[0]?.role as Role | undefined
  const allTools = db.select().from(tools).all() as AppData['tools']

  // Filter tools and announcements by role. Admins see everything (including inactive).
  const visibleTools = userRole === 'admin'
    ? allTools
    : allTools.filter((t) => userCanSeeTool(userRole || 'student', t))
  const visibleAnnouncements = userRole === 'admin'
    ? allAnnouncements
    : allAnnouncements.filter((a) => userCanSeeAnnouncement(userRole || 'student', a))

  return {
    users: currentUsers,
    categories: db.select().from(categories).all() as AppData['categories'],
    tools: visibleTools,
    favorites: userFavorites,
    preferences: userPrefs,
    announcements: visibleAnnouncements.sort((a, b) => a.sortOrder - b.sortOrder),
    activities: userActivities,
    authUserId,
  }
}

export function requireUser(user: User | null): User {
  if (!user) error(401, 'Authentication required')
  return user
}

export function requireAdmin(user: User | null): User {
  const authUser = requireUser(user)
  if (authUser.role !== 'admin') error(403, 'Forbidden')
  return authUser
}

export function authenticateUser(email: string, password: string): User {
  const normalizedEmail = email.trim().toLowerCase()
  const [credential] = db.select().from(userCredentials)
    .where(eq(userCredentials.email, normalizedEmail)).all()

  if (!credential || !verifyPassword(password, credential.passwordHash)) {
    logEvent('warn', 'auth.login_failed', { email: normalizedEmail })
    error(401, 'Invalid email or password')
  }

  const [user] = db.select().from(users).where(eq(users.id, credential.userId)).all()
  if (!user) error(401, 'Account is not linked to a user profile')
  logEvent('info', 'auth.login_success', { userId: user.id, role: user.role })
  return user as User
}

export function addFavorite(user: User | null, toolId: string) {
  const authUser = requireUser(user)
  assertId(toolId, 'tool id')
  const id = `fav-${authUser.id}-${toolId}`
  db.insert(favorites)
    .values({ id, userId: authUser.id, toolId, createdAt: new Date().toISOString() })
    .onConflictDoNothing()
    .run()
  logEvent('info', 'favorite.added', { userId: authUser.id, toolId })
}

export function removeFavorite(user: User | null, toolId: string) {
  const authUser = requireUser(user)
  assertId(toolId, 'tool id')
  db.delete(favorites).where(and(eq(favorites.userId, authUser.id), eq(favorites.toolId, toolId))).run()
  logEvent('info', 'favorite.removed', { userId: authUser.id, toolId })
}

export function toggleFavorite(user: User | null, toolId: string) {
  const authUser = requireUser(user)
  const existing = db.select().from(favorites)
    .where(and(eq(favorites.userId, authUser.id), eq(favorites.toolId, toolId))).all()
  if (existing.length) {
    removeFavorite(authUser, toolId)
  } else {
    addFavorite(authUser, toolId)
  }
}

export function savePreference(user: User | null, prefs: Partial<UserPreference>) {
  const authUser = requireUser(user)
  if (prefs.theme && !themes.has(prefs.theme)) error(400, 'Invalid theme')
  if (prefs.preferredRoleView) {
    assertRole(prefs.preferredRoleView)
    // Only admin and staff can change role view; staff cannot select admin
    if (authUser.role !== 'admin' && (authUser.role !== 'staff' || prefs.preferredRoleView === 'admin')) {
      error(403, 'Not allowed to change role view')
    }
  }
  const now = new Date().toISOString()
  const current = db.select().from(userPreferences).where(eq(userPreferences.userId, authUser.id)).all()[0]
  const payload = {
    id: `pref-${authUser.id}`,
    userId: authUser.id,
    dashboardLayout: prefs.dashboardLayout ?? current?.dashboardLayout ?? 'default',
    theme: prefs.theme ?? current?.theme ?? 'system',
    preferredRoleView: prefs.preferredRoleView ?? current?.preferredRoleView ?? authUser.role,
    notificationSettings: prefs.notificationSettings ?? current?.notificationSettings ?? null,
    accessibilitySettings: prefs.accessibilitySettings ?? current?.accessibilitySettings ?? null,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }
  db.insert(userPreferences).values(payload).onConflictDoUpdate({ target: userPreferences.id, set: payload }).run()
  logEvent('info', 'preference.saved', { userId: authUser.id })
}

export function saveTool(user: User | null, tool: Tool) {
  requireAdmin(user)
  assertId(String(tool.id || ''), 'tool id')
  assertId(String(tool.categoryId || ''), 'category id')
  tool.url = normalizePublicUrl(String(tool.url || ''))
  tool.audienceRoles.forEach(assertRole)
  const now = new Date().toISOString()
  const existing = db.select().from(tools).where(eq(tools.id, tool.id)).all()
  const payload = {
    ...tool,
    createdAt: existing[0]?.createdAt ?? tool.createdAt ?? now,
    updatedAt: now,
  }
  db.insert(tools).values(payload).onConflictDoUpdate({ target: tools.id, set: payload }).run()
  logEvent('info', existing.length ? 'tool.updated' : 'tool.created', { toolId: tool.id })
}

export function saveCategory(user: User | null, category: Category) {
  requireAdmin(user)
  assertId(String(category.id || ''), 'category id')
  const now = new Date().toISOString()
  const existing = db.select().from(categories).where(eq(categories.id, category.id)).all()
  const payload = {
    ...category,
    createdAt: existing[0]?.createdAt ?? category.createdAt ?? now,
    updatedAt: now,
  }
  db.insert(categories).values(payload).onConflictDoUpdate({ target: categories.id, set: payload }).run()
  logEvent('info', existing.length ? 'category.updated' : 'category.created', { categoryId: category.id })
}

export function deleteTool(user: User | null, toolId: string) {
  requireAdmin(user)
  assertId(toolId, 'tool id')
  db.delete(favorites).where(eq(favorites.toolId, toolId)).run()
  db.delete(tools).where(eq(tools.id, toolId)).run()
  logEvent('info', 'tool.deleted', { toolId })
}

export function deleteCategory(user: User | null, categoryId: string) {
  requireAdmin(user)
  assertId(categoryId, 'category id')
  const toolsInCategory = db.select().from(tools).where(eq(tools.categoryId, categoryId)).all()
  if (toolsInCategory.length > 0) {
    error(400, `Cannot delete category with ${toolsInCategory.length} tool(s). Move or delete them first.`)
  }
  db.delete(categories).where(eq(categories.id, categoryId)).run()
  logEvent('info', 'category.deleted', { categoryId })
}

export function saveAnnouncement(user: User | null, announcement: Announcement) {
  requireAdmin(user)
  assertId(String(announcement.id || ''), 'announcement id')
  if (announcement.toolId) assertId(announcement.toolId, 'tool id')
  if (!announcementTones.has(announcement.tone)) error(400, 'Invalid announcement tone')
  if (!announcementFilters.has(announcement.filter)) error(400, 'Invalid announcement filter')
  if (announcement.url) announcement.url = normalizePublicUrl(announcement.url)
  announcement.audienceRoles.forEach(assertRole)
  const now = new Date().toISOString()
  const existing = db.select().from(announcements).where(eq(announcements.id, announcement.id)).all()
  const payload = {
    ...announcement,
    createdAt: existing[0]?.createdAt ?? announcement.createdAt ?? now,
    updatedAt: now,
  }
  db.insert(announcements).values(payload).onConflictDoUpdate({ target: announcements.id, set: payload }).run()
  logEvent('info', existing.length ? 'announcement.updated' : 'announcement.created', { announcementId: announcement.id })

  // Send push notification to all subscribers for new active announcements
  if (!existing.length && announcement.isActive) {
    sendPushToAll(
      announcement.title,
      announcement.body,
      announcement.toolId ? `/tools/${announcement.toolId}` : (announcement.url || '/announcements')
    ).catch(() => {})
  }
}

export function deleteAnnouncement(user: User | null, announcementId: string) {
  requireAdmin(user)
  assertId(announcementId, 'announcement id')
  db.delete(announcements).where(eq(announcements.id, announcementId)).run()
  logEvent('info', 'announcement.deleted', { announcementId })
}

export function clearUserActivities(user: User | null) {
  const authUser = requireUser(user)
  db.delete(activities).where(eq(activities.userId, authUser.id)).run()
  logEvent('info', 'activities.cleared', { userId: authUser.id })
}

export function logActivity(userId: string, type: Activity['type'], toolId?: string, toolName?: string) {
  if (!activityTypes.has(type)) error(400, 'Invalid activity type')
  if (toolId) assertId(toolId, 'tool id')
  const id = `act-${userId}-${Date.now()}`
  db.insert(activities).values({
    id,
    userId,
    type,
    toolId: toolId ?? null,
    toolName: toolName ? toolName.slice(0, 120) : null,
    createdAt: new Date().toISOString(),
  }).run()
}
