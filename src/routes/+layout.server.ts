import type { LayoutServerLoad } from './$types'
import { db } from '$lib/server/db'
import { categories, favorites, tools, userPreferences, users } from '$lib/server/schema'
import type { AppData } from '$lib/types'

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    users: db.select().from(users).all() as AppData['users'],
    categories: db.select().from(categories).all() as AppData['categories'],
    tools: db.select().from(tools).all() as AppData['tools'],
    favorites: db.select().from(favorites).all() as AppData['favorites'],
    preferences: db.select().from(userPreferences).all() as AppData['preferences'],
    authUserId: locals.user?.id || null,
  } as AppData & { authUserId: string | null }
}
