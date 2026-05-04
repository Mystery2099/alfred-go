import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { pushSubscriptions } from '$lib/server/schema'
import { eq } from 'drizzle-orm'

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const userId = locals.user?.id ?? null
    if (!userId) {
      return json({ subscribed: false })
    }

    const subs = db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId)).all()
    return json({ subscribed: subs.length > 0, count: subs.length })
  } catch (err: any) {
    return json({ error: err.message }, { status: 500 })
  }
}
