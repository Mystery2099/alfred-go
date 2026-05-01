import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { favorites } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const { userId, toolId } = await request.json()
  const id = `fav-${userId}-${toolId}`
  const now = new Date().toISOString()

  db.insert(favorites).values({ id, userId, toolId, createdAt: now })
    .onConflictDoNothing().run()

  logEvent('info', 'favorite.added', { userId, toolId })
  return json({ success: true })
}

export const DELETE: RequestHandler = async ({ request }) => {
  const { userId, toolId } = await request.json()
  const id = `fav-${userId}-${toolId}`

  db.delete(favorites).where(eq(favorites.id, id)).run()

  logEvent('info', 'favorite.removed', { userId, toolId })
  return json({ success: true })
}
