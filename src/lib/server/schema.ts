import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const userCredentials = sqliteTable('user_credentials', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  parentCategoryId: text('parent_category_id'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const tools = sqliteTable('tools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url').notNull(),
  categoryId: text('category_id').notNull(),
  icon: text('icon'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull(),
  audienceRoles: text('audience_roles', { mode: 'json' }).$type<string[]>().notNull(),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  toolId: text('tool_id').notNull(),
  createdAt: text('created_at').notNull()
})

export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  dashboardLayout: text('dashboard_layout'),
  theme: text('theme').notNull(),
  preferredRoleView: text('preferred_role_view'),
  notificationSettings: text('notification_settings', { mode: 'json' }).$type<Record<string, boolean>>(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  tone: text('tone').notNull(),
  filter: text('filter').notNull(),
  actionLabel: text('action_label'),
  toolId: text('tool_id'),
  url: text('url'),
  sortOrder: integer('sort_order').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  toolId: text('tool_id'),
  toolName: text('tool_name'),
  createdAt: text('created_at').notNull()
})

export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: text('created_at').notNull()
})
