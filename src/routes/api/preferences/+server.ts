import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { userPreferences } from '$lib/server/schema'
import { eq } from 'drizzle-orm'
import { logEvent } from '$lib/logger'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const { userId, ...prefs } = await request.json()

  const existing = db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId)).all()

  const now = new Date().toISOString()

  if (existing.length > 0) {
    db.update(userPreferences)
      .set({ ...prefs, updatedAt: now })
      .where(eq(userPreferences.userId, userId))
      .run()
  } else {
    db.insert(userPreferences).values({
      id: `pref-${userId}`,
      userId,
      ...prefs,
      createdAt: now,
      updatedAt: now,
    }).run()
  }

  logEvent('info', 'preference.saved', { userId })
  return json({ success: true })
}
