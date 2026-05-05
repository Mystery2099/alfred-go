import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { activities } from '$lib/server/schema'
import { eq, desc } from 'drizzle-orm'
import { preferenceActions } from '$lib/server/form-actions'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return { activities: [] }
  }

  const userActivities = db.select()
    .from(activities)
    .where(eq(activities.userId, locals.user.id))
    .orderBy(desc(activities.createdAt))
    .limit(50)
    .all()

  return { activities: userActivities }
}

export const actions = preferenceActions
