import { error } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import type { AppData, Category, Tool, User, UserPreference } from '$lib/types'
import { verifyPassword } from './auth'
import { db } from './db'
import { categories, favorites, tools, userCredentials, userPreferences, users } from './schema'

export function getAppData(authUserId: string | null): AppData & { authUserId: string | null } {
  return {
    users: db.select().from(users).all() as AppData['users'],
    categories: db.select().from(categories).all() as AppData['categories'],
    tools: db.select().from(tools).all() as AppData['tools'],
    favorites: db.select().from(favorites).all() as AppData['favorites'],
    preferences: db.select().from(userPreferences).all() as AppData['preferences'],
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
  const now = new Date().toISOString()
  const current = db.select().from(userPreferences).where(eq(userPreferences.userId, authUser.id)).all()[0]
  const payload = {
    id: `pref-${authUser.id}`,
    userId: authUser.id,
    dashboardLayout: prefs.dashboardLayout ?? current?.dashboardLayout ?? 'default',
    theme: prefs.theme ?? current?.theme ?? 'system',
    preferredRoleView: prefs.preferredRoleView ?? current?.preferredRoleView ?? authUser.role,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }
  db.insert(userPreferences).values(payload).onConflictDoUpdate({ target: userPreferences.id, set: payload }).run()
  logEvent('info', 'preference.saved', { userId: authUser.id })
}

export function saveTool(user: User | null, tool: Tool) {
  requireAdmin(user)
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
