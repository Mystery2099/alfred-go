import { error } from '@sveltejs/kit'
import { and, desc, eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import type { Activity, Announcement, AppData, Category, Tool, User, UserPreference } from '$lib/types'
import { verifyPassword } from './auth'
import { db } from './db'
import { activities, announcements, categories, favorites, tools, userCredentials, userPreferences, users } from './schema'
import { sendPushToAll } from './push'

const roles = new Set(['applicant', 'accepted_student', 'student', 'staff', 'admin'])
const themes = new Set(['system', 'light', 'dark'])
const announcementTones = new Set(['urgent', 'deadline', 'reminder'])
const announcementFilters = new Set(['updates', 'deadlines', 'reminders'])

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
  return {
    users: currentUsers,
    categories: db.select().from(categories).all() as AppData['categories'],
    tools: db.select().from(tools).all() as AppData['tools'],
    favorites: userFavorites,
    preferences: userPrefs,
    announcements: allAnnouncements.filter((a) => a.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
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
  const id = `fav-${authUser.id}-${toolId}`
  db.insert(favorites)
    .values({ id, userId: authUser.id, toolId, createdAt: new Date().toISOString() })
    .onConflictDoNothing()
    .run()
  logEvent('info', 'favorite.added', { userId: authUser.id, toolId })
}

export function removeFavorite(user: User | null, toolId: string) {
  const authUser = requireUser(user)
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
  if (prefs.preferredRoleView) assertRole(prefs.preferredRoleView)
  const now = new Date().toISOString()
  const current = db.select().from(userPreferences).where(eq(userPreferences.userId, authUser.id)).all()[0]
  const payload = {
    id: `pref-${authUser.id}`,
    userId: authUser.id,
    dashboardLayout: prefs.dashboardLayout ?? current?.dashboardLayout ?? 'default',
    theme: prefs.theme ?? current?.theme ?? 'system',
    preferredRoleView: prefs.preferredRoleView ?? current?.preferredRoleView ?? authUser.role,
    notificationSettings: prefs.notificationSettings ?? current?.notificationSettings ?? null,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }
  db.insert(userPreferences).values(payload).onConflictDoUpdate({ target: userPreferences.id, set: payload }).run()
  logEvent('info', 'preference.saved', { userId: authUser.id })
}

export function saveTool(user: User | null, tool: Tool) {
  requireAdmin(user)
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
  db.delete(favorites).where(eq(favorites.toolId, toolId)).run()
  db.delete(tools).where(eq(tools.id, toolId)).run()
  logEvent('info', 'tool.deleted', { toolId })
}

export function deleteCategory(user: User | null, categoryId: string) {
  requireAdmin(user)
  const toolsInCategory = db.select().from(tools).where(eq(tools.categoryId, categoryId)).all()
  if (toolsInCategory.length > 0) {
    error(400, `Cannot delete category with ${toolsInCategory.length} tool(s). Move or delete them first.`)
  }
  db.delete(categories).where(eq(categories.id, categoryId)).run()
  logEvent('info', 'category.deleted', { categoryId })
}

export function saveAnnouncement(user: User | null, announcement: Announcement) {
  requireAdmin(user)
  if (!announcementTones.has(announcement.tone)) error(400, 'Invalid announcement tone')
  if (!announcementFilters.has(announcement.filter)) error(400, 'Invalid announcement filter')
  if (announcement.url) announcement.url = normalizePublicUrl(announcement.url)
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
  db.delete(announcements).where(eq(announcements.id, announcementId)).run()
  logEvent('info', 'announcement.deleted', { announcementId })
}

export function logActivity(userId: string, type: Activity['type'], toolId?: string, toolName?: string) {
  const id = `act-${userId}-${Date.now()}`
  db.insert(activities).values({
    id,
    userId,
    type,
    toolId: toolId ?? null,
    toolName: toolName ?? null,
    createdAt: new Date().toISOString(),
  }).run()
}
