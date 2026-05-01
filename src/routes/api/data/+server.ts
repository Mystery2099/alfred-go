import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { categories, favorites, tools, userPreferences, users } from '$lib/server/schema'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  return json({
    users: db.select().from(users).all(),
    categories: db.select().from(categories).all(),
    tools: db.select().from(tools).all(),
    favorites: db.select().from(favorites).all(),
    preferences: db.select().from(userPreferences).all(),
    authUserId: locals.user?.id || null,
  })
}
